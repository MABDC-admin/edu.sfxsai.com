"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const ai_tool_context_service_1 = require("./ai-tool-context.service");
let AiService = class AiService {
    static { AiService_1 = this; }
    toolContext;
    static OPENROUTER_MODEL = 'deepseek/deepseek-v4-flash';
    static OPENROUTER_COMPARISON_MODEL = 'google/gemini-2.5-flash-lite-preview-09-2025';
    logger = new common_1.Logger(AiService_1.name);
    constructor(toolContext) {
        this.toolContext = toolContext;
    }
    async chat(user, request) {
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
            throw new common_1.ServiceUnavailableException('AI assistant could not reach the model provider. Please try again.');
        }
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
            throw new common_1.ServiceUnavailableException('AI assistant returned an empty response.');
        }
        return {
            content,
            model,
        };
    }
    async streamChat(user, request, onToken) {
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
            throw new common_1.ServiceUnavailableException('AI assistant stream could not reach the model provider.');
        }
        const stream = response.body;
        if (!stream) {
            throw new common_1.ServiceUnavailableException('AI assistant stream returned no body.');
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
                }
                catch {
                    this.logger.debug(`Skipping malformed OpenRouter stream line: ${payload.slice(0, 120)}`);
                }
            }
        }
    }
    async getTeacherAnalyticsInsights(portalState) {
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
                    model: AiService_1.OPENROUTER_MODEL,
                    messages: [{ role: 'user', content: prompt }]
                }),
                signal: AbortSignal.timeout(15000)
            });
            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        }
        catch (error) {
            this.logger.error('Error fetching AI insights:', error);
            return 'Unable to generate AI insights at this time. Please check your network connection or try again later.';
        }
    }
    async getStudentAcademicInsights(profileData) {
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
                    model: AiService_1.OPENROUTER_MODEL,
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
        }
        catch (error) {
            console.error('Failed to generate student academic insights:', error);
            return "Unable to generate insights at this time. Please try again later.";
        }
    }
    resolveModel(request) {
        return request?.modelSlot === 'comparison'
            ? AiService_1.OPENROUTER_COMPARISON_MODEL
            : AiService_1.OPENROUTER_MODEL;
    }
    requireApiKey() {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            this.logger.warn('OPENROUTER_API_KEY not found in environment');
            throw new common_1.ServiceUnavailableException('AI assistant is not configured yet.');
        }
        return apiKey;
    }
    openRouterHeaders(apiKey) {
        return {
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://sfxsai.com',
            'X-Title': 'SFXSAI AI Assistant',
            'Content-Type': 'application/json',
        };
    }
    async buildMessages(user, request) {
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
                        role: 'system',
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
    normalizeMessages(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new common_1.BadRequestException('At least one message is required.');
        }
        return messages.slice(-20).map((message) => {
            const role = ['system', 'user', 'assistant'].includes(message?.role) ? message.role : 'user';
            const content = `${message?.content || ''}`.trim();
            if (!content) {
                throw new common_1.BadRequestException('Message content cannot be empty.');
            }
            return { role, content };
        });
    }
    systemPrompt(user) {
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
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [ai_tool_context_service_1.AiToolContextService])
], AiService);
//# sourceMappingURL=ai.service.js.map