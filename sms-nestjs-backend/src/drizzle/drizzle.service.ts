import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as relations from './relations';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public db: NodePgDatabase<typeof schema & typeof relations>;
  private pool!: Pool;
  private heartbeatTimer?: NodeJS.Timeout;
  private readonly logger = new Logger(DrizzleService.name);

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing in environment variables');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: this.shouldUseSsl(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DB_POOL_MAX ?? 10),
      idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS ?? 30000),
      connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT_MS ?? 10000),
      keepAlive: true,
      keepAliveInitialDelayMillis: Number(process.env.DB_POOL_KEEPALIVE_INITIAL_DELAY_MS ?? 10000),
    });

    this.pool.on('error', (error) => {
      this.logger.error(`PostgreSQL pool idle client error: ${error.message}`, error.stack);
    });

    this.pool.on('connect', () => {
      this.logger.log('PostgreSQL client connected to pool');
    });

    this.pool.on('acquire', () => {
      this.logger.debug(`PostgreSQL client acquired from pool total=${this.pool.totalCount} idle=${this.pool.idleCount} waiting=${this.pool.waitingCount}`);
    });

    this.pool.on('remove', () => {
      this.logger.warn(`PostgreSQL client removed from pool total=${this.pool.totalCount} idle=${this.pool.idleCount} waiting=${this.pool.waitingCount}`);
    });

    await this.pool.connect().then((client) => client.release());
    this.db = drizzle(this.pool, { schema: { ...schema, ...relations } });
    this.logger.log('Drizzle ORM initialized with node-postgres driver');
    this.startHeartbeat();
  }

  async onModuleDestroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    if (this.pool) {
      await this.pool.end();
    }
  }

  private startHeartbeat() {
    const intervalMs = Number(process.env.DB_HEARTBEAT_INTERVAL_MS ?? 300000);
    this.heartbeatTimer = setInterval(() => {
      void this.logHeartbeat();
    }, intervalMs);
    void this.logHeartbeat();
  }

  private async logHeartbeat() {
    try {
      await this.pool.query('select 1');
      this.logger.log(`PostgreSQL heartbeat ok total=${this.pool.totalCount} idle=${this.pool.idleCount} waiting=${this.pool.waitingCount}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`PostgreSQL heartbeat failed: ${message}`, stack);
    }
  }

  private shouldUseSsl(databaseUrl: string) {
    const lowered = databaseUrl.toLowerCase();
    return lowered.includes('sslmode=require') || lowered.includes('ssl=true');
  }
}
