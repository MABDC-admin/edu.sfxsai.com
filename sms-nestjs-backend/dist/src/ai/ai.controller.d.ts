import { AiService } from './ai.service';
import type { AiChatRequest } from './ai.service';
import type { Response } from 'express';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    private readonly logger;
    chat(body: AiChatRequest, req: {
        user: {
            userId: string;
            email: string;
            role: string;
        };
    }): Promise<{
        content: string;
        model: string;
    }>;
    chatStream(body: AiChatRequest, req: {
        user: {
            userId: string;
            email: string;
            role: string;
        };
    }, res: Response): Promise<void>;
}
