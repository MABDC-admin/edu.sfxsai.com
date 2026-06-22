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
export declare class AiService {
    private readonly toolContext?;
    static readonly OPENROUTER_MODEL = "deepseek/deepseek-v4-flash";
    static readonly OPENROUTER_COMPARISON_MODEL = "google/gemini-2.5-flash-lite-preview-09-2025";
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
    getStudentAcademicInsights(profileData: any): Promise<string>;
    private resolveModel;
    private requireApiKey;
    private openRouterHeaders;
    private buildMessages;
    private normalizeMessages;
    private systemPrompt;
}
