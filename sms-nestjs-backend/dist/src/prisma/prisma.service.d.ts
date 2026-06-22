import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    constructor();
    onModuleInit(): Promise<void>;
    withTransientRetry<T>(operation: () => Promise<T>, maxAttempts?: number): Promise<T>;
    private isTransientConnectionError;
    private wait;
}
