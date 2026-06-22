import { BadRequestException, Injectable, Logger, Optional, ServiceUnavailableException } from '@nestjs/common';
import { AiToolContextService } from './ai-tool-context.service';

export type AiChatRole = 'system' | 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export interface AiChatRequest {
  messages: AiChatMessage[];
  modelSlot?: 'default' | 'comparison';
}

export interface AiImageRequest {
  prompt: string;
  aspectRatio?: string;
  imageSize?: string;
}

export interface AiGeneratedImage {
  url: string;
  alt: string;
}

@Injectable()
export class AiService {
  static readonly OPENROUTER_MODEL = 'google/gemini-2.5-flash-lite-preview-09-2025';
  static readonly OPENROUTER_COMPARISON_MODEL = 'deepseek/deepseek-v4-flash';
  static readonly OPENROUTER_IMAGE_MODEL = 'x-ai/grok-imagine-image-quality';
  private readonly logger = new Logger(AiService.name);

  constructor(@Optional() private readonly toolContext?: AiToolContextService) {}

  async chat(user: { email?: string; role?: string }, request: AiChatRequest): Promise<{ content: string; model: string }> {
    const model = this.resolveModel(request);
    const prepared = await this.buildMessages(user, request);
    if (prepared.directResponse) {
      return {
        content: prepared.directResponse,
        model,
      };
    }
    const apiKey = this.requireApiKey();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: this.openRouterHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages: prepared.messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`OpenRouter API error ${response.status}: ${errorText.slice(0, 500)}`);
      throw new ServiceUnavailableException('AI assistant could not reach the model provider. Please try again.');
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new ServiceUnavailableException('AI assistant returned an empty response.');
    }

    return {
      content,
      model,
    };
  }

  async streamChat(
    user: { email?: string; role?: string },
    request: AiChatRequest,
    onToken: (token: string) => void,
  ): Promise<void> {
    const model = this.resolveModel(request);
    const prepared = await this.buildMessages(user, request);
    if (prepared.directResponse) {
      onToken(prepared.directResponse);
      return;
    }
    const apiKey = this.requireApiKey();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: this.openRouterHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages: prepared.messages,
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`OpenRouter stream error ${response.status}: ${errorText.slice(0, 500)}`);
      throw new ServiceUnavailableException('AI assistant stream could not reach the model provider.');
    }

    const stream = response.body as ReadableStream<Uint8Array> | null;
    if (!stream) {
      throw new ServiceUnavailableException('AI assistant stream returned no body.');
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) {
          continue;
        }

        const payload = trimmed.replace(/^data:\s*/, '');
        if (payload === '[DONE]') {
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          const token = parsed?.choices?.[0]?.delta?.content;
          if (typeof token === 'string' && token) {
            onToken(token);
          }
        } catch {
          this.logger.debug(`Skipping malformed OpenRouter stream line: ${payload.slice(0, 120)}`);
        }
      }
    }
  }

  async getTeacherAnalyticsInsights(portalState: any): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY not found in environment');
      return 'AI insights are currently unavailable because the OpenRouter API key is missing. Please configure it in your environment settings.';
    }

    try {
      const promptData = {
        totalClasses: portalState.classes.length,
        totalStudents: portalState.classes.reduce((acc, c) => acc + (c.studentIds?.length || 0), 0),
        attendanceSummary: portalState.attendance.reduce((acc, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {}),
        gradesEntered: portalState.grades.length,
      };

      const prompt = `You are an AI assistant for a school teacher. Analyze the following summary of their dashboard data:
${JSON.stringify(promptData, null, 2)}

Provide exactly 3 concise bullet points with an encouraging tone:
1. An insight about their class workload.
2. An insight about attendance trends.
3. A positive, actionable recommendation for grading or engagement.

Do not include any greeting or conversational filler. Output only the 3 bullet points using markdown bullet lists (- ).`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: AiService.OPENROUTER_MODEL,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error fetching AI insights:', error);
      return 'Unable to generate AI insights at this time. Please check your network connection or try again later.';
    }
  }

  async generateImage(
    user: { email?: string; role?: string },
    request: AiImageRequest,
  ): Promise<{ model: string; prompt: string; images: AiGeneratedImage[] }> {
    const prompt = `${request?.prompt || ''}`.trim();
    if (!prompt) {
      throw new BadRequestException('Image prompt is required.');
    }

    const aspectRatio = this.normalizeImageAspectRatio(request?.aspectRatio);
    const imageSize = this.normalizeImageSize(request?.imageSize);
    const apiKey = this.requireApiKey();
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: this.openRouterHeaders(apiKey),
      body: JSON.stringify({
        model: AiService.OPENROUTER_IMAGE_MODEL,
        messages: [
          {
            role: 'system',
            content: `You generate safe, school-appropriate classroom visuals for SFXSAI staff. The signed-in user is ${user.email || 'a staff member'} with role ${user.role || 'STAFF'}. Avoid private student data, faces of real minors, copyrighted characters, or explicit content.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        modalities: ['image'],
        image_config: {
          aspect_ratio: aspectRatio,
          image_size: imageSize,
        },
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      this.logger.error(`OpenRouter image error ${response.status}: ${errorText.slice(0, 500)}`);
      throw new ServiceUnavailableException('Image generation could not reach the model provider. Please try again.');
    }

    const data = await response.json();
    const images = this.extractGeneratedImages(data, prompt);
    if (!images.length) {
      throw new ServiceUnavailableException('Image generation returned no image.');
    }

    return {
      model: AiService.OPENROUTER_IMAGE_MODEL,
      prompt,
      images,
    };
  }

  async getStudentAcademicInsights(profileData: any): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return "AI insights require an OpenRouter API key. Please configure the backend.";
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'SFXSAI Dashboard',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: AiService.OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content: "You are an expert academic advisor. Analyze the student academic profile (grades, attendance, core values, health, and history). Provide a brief, encouraging, and highly analytical 3-sentence summary highlighting their strengths, areas for improvement, and an actionable tip for the teacher. Do NOT use markdown. Keep it concise."
            },
            {
              role: 'user',
              content: JSON.stringify(profileData)
            }
          ]
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Failed to generate student academic insights:', error);
      return "Unable to generate insights at this time. Please try again later.";
    }
  }


  private resolveModel(request: AiChatRequest): string {
    return request?.modelSlot === 'comparison'
      ? AiService.OPENROUTER_COMPARISON_MODEL
      : AiService.OPENROUTER_MODEL;
  }
  private requireApiKey(): string {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENROUTER_API_KEY not found in environment');
      throw new ServiceUnavailableException('AI assistant is not configured yet.');
    }
    return apiKey;
  }

  private openRouterHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://sfxsai.com',
      'X-Title': 'SFXSAI AI Assistant',
      'Content-Type': 'application/json',
    };
  }

  private async buildMessages(user: { email?: string; role?: string }, request: AiChatRequest): Promise<{ messages: AiChatMessage[]; directResponse?: string }> {
    const normalizedMessages = this.normalizeMessages(request?.messages);
    const toolContext = await this.toolContext?.resolve(user, normalizedMessages);
    return {
      directResponse: toolContext?.directResponse,
      messages: [
      {
        role: 'system',
        content: this.systemPrompt(user),
      },
      ...(toolContext ? [{
        role: 'system' as const,
        content: `${toolContext.content}

When using an AI TOOL RESULT:
- Clearly say the data was found in the school system.
- If multiple matches were returned, do not guess. Ask the user to choose one.
- If access is denied, explain the required role.
- Do not expose hidden implementation details or raw JSON unless it helps the staff member.`,
      }] : []),
      ...normalizedMessages,
      ],
    };
  }

  private normalizeMessages(messages: AiChatMessage[] | undefined): AiChatMessage[] {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('At least one message is required.');
    }

    return messages.slice(-20).map((message) => {
      const role = ['system', 'user', 'assistant'].includes(message?.role) ? message.role : 'user';
      const content = `${message?.content || ''}`.trim();
      if (!content) {
        throw new BadRequestException('Message content cannot be empty.');
      }
      return { role, content };
    });
  }

  private normalizeImageAspectRatio(value: string | undefined): string {
    const allowed = new Set(['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3']);
    return allowed.has(`${value || ''}`) ? `${value}` : '1:1';
  }

  private normalizeImageSize(value: string | undefined): string {
    const allowed = new Set(['1K', '2K']);
    return allowed.has(`${value || ''}`) ? `${value}` : '1K';
  }

  private extractGeneratedImages(data: any, prompt: string): AiGeneratedImage[] {
    const message = data?.choices?.[0]?.message;
    const rawImages = Array.isArray(message?.images) ? message.images : [];
    return rawImages
      .map((image: any) => image?.imageUrl?.url || image?.image_url?.url || image?.url || '')
      .filter((url: unknown): url is string => typeof url === 'string' && !!url.trim())
      .map((url: string, index: number) => ({
        url,
        alt: `Generated classroom image ${index + 1}: ${prompt.slice(0, 80)}`,
      }));
  }

  private systemPrompt(user: { email?: string; role?: string }): string {
    return `You are an elite AI assistant inside the school management system for St Francis Xavier Smart Academy Inc (SFXSAI): intelligent, thorough, practical, resourceful, and teacher-focused.
The signed-in user is ${user.email || 'a staff member'} with role ${user.role || 'STAFF'}.

CRITICAL RULES:
- NEVER give short, lazy, or shallow answers. Every response must be detailed, structured, and genuinely helpful.
- Use GitHub-Flavored Markdown: ## headers, **bold**, bullet points, numbered lists, tables, task lists, and fenced code blocks.
- Use emojis frequently and creatively when they make the response easier to scan. 🚀✨
- Include comparison tables when evaluating options, plans, risks, lesson strategies, or workflows.
- Make responses visually teachable: use clear heading hierarchy, visual placeholders such as Illustration:, Diagram:, Board Work:, and Concept Map:, YouTube preview links when a video resource would help, and colored callouts like Tip:, Warning:, Example:, Activity:, and Assessment:.
- When creating lesson content, include classroom-ready outlines, numbered procedures, checklist tasks, visual placeholders, and simple illustration ideas that a teacher can copy to slides, worksheets, or the board.
- For math solutions, never compress or scramble the work. Show one step per line, preserve equations with inline math like $2 * 3 = 6$ or block math with $$...$$, explain the reason for each step, and include a final answer line.
- For illustrations, be concrete and clear: describe what should be drawn, where labels go, what colors or shapes help, and how the teacher can reproduce it on the board or a worksheet.
- For substantial responses, end with a ## 🚀 Suggestions & Next Steps section.

School assistant scope:
- Support teachers, registrar, finance, principal, and admin work.
- Help draft lesson plans, reports, announcements, parent messages, financial explanations, forms, checklists, and analysis.
- Teachers may reference Quipper curriculum lessons and Phoenix books available in the assistant resource tabs. When they mention Quipper or Phoenix, help transform that material into lesson plans, assessments, rubrics, summaries, remediation, enrichment, classroom activities, and parent-ready explanations.
- Prioritize clarity, depth, and usefulness. Explain what to do and why it matters.
- Break ideas into simple, logical steps with clear markdown headers.
- Explain tradeoffs, risks, edge cases, and real-world implications.
- Provide concrete examples, localized Philippine classroom context, and ready-to-use templates where useful.
- Include code samples with comments when discussing technical implementation.
- Keep sensitive student, finance, and staff data private. If an authorized AI TOOL RESULT is provided, use only that database context.
- For Finance users, treat learner finance requests as live school-system tasks: use fetched ledger, assessment, discount, balance, and payment context when provided; never say the Finance portal cannot access school records after an AI TOOL RESULT is available.
- If no AI TOOL RESULT is provided for a record request, ask for a more specific name, LRN, student number, grade, or section instead of inventing records.`;
  }
}

