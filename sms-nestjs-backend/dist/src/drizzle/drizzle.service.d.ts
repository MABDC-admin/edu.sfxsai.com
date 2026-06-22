import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import * as relations from './relations';
export declare class DrizzleService implements OnModuleInit, OnModuleDestroy {
    db: NodePgDatabase<typeof schema & typeof relations>;
    private pool;
    private heartbeatTimer?;
    private readonly logger;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private startHeartbeat;
    private logHeartbeat;
    private shouldUseSsl;
}
