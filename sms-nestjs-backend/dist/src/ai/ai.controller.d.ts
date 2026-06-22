import { AiService } from './ai.service';
import type { AiChatRequest, AiImageRequest } from './ai.service';
import type { Response } from 'express';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
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
    generateImage(body: AiImageRequest, req: {
        user: {
            userId: string;
            email: string;
            role: string;
        };
    }): Promise<{
        model: string;
        prompt: string;
        images: import("./ai.service").AiGeneratedImage[];
    }>;
    chatStream(body: AiChatRequest, req: {
        user: {
            userId: string;
            email: string;
            role: string;
        };
    }, res: Response): Promise<void>;
}
