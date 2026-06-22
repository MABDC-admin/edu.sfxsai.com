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
export declare class AiService {
    private readonly toolContext?;
    static readonly OPENROUTER_MODEL = "google/gemini-2.5-flash-lite-preview-09-2025";
    static readonly OPENROUTER_COMPARISON_MODEL = "deepseek/deepseek-v4-flash";
    static readonly OPENROUTER_IMAGE_MODEL = "x-ai/grok-imagine-image-quality";
    private readonly logger;
    constructor(toolContext?: AiToolContextService | undefined);
    chat(user: {
        email?: string;
        role?: string;
    }, request: AiChatRequest): Promise<{
        content: string;
        model: string;
    }>;
    streamChat(user: {
        email?: string;
        role?: string;
    }, request: AiChatRequest, onToken: (token: string) => void): Promise<void>;
    getTeacherAnalyticsInsights(portalState: any): Promise<string>;
    generateImage(user: {
        email?: string;
        role?: string;
    }, request: AiImageRequest): Promise<{
        model: string;
        prompt: string;
        images: AiGeneratedImage[];
    }>;
    getStudentAcademicInsights(profileData: any): Promise<string>;
    private resolveModel;
    private requireApiKey;
    private openRouterHeaders;
    private buildMessages;
    private normalizeMessages;
    private normalizeImageAspectRatio;
    private normalizeImageSize;
    private extractGeneratedImages;
    private systemPrompt;
}
