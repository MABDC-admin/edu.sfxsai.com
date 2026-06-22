"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var DrizzleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const schema = __importStar(require("./schema"));
const relations = __importStar(require("./relations"));
let DrizzleService = DrizzleService_1 = class DrizzleService {
    db;
    pool;
    heartbeatTimer;
    logger = new common_1.Logger(DrizzleService_1.name);
    async onModuleInit() {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is missing in environment variables');
        }
        this.pool = new pg_1.Pool({
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
        this.db = (0, node_postgres_1.drizzle)(this.pool, { schema: { ...schema, ...relations } });
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
    startHeartbeat() {
        const intervalMs = Number(process.env.DB_HEARTBEAT_INTERVAL_MS ?? 300000);
        this.heartbeatTimer = setInterval(() => {
            void this.logHeartbeat();
        }, intervalMs);
        void this.logHeartbeat();
    }
    async logHeartbeat() {
        try {
            await this.pool.query('select 1');
            this.logger.log(`PostgreSQL heartbeat ok total=${this.pool.totalCount} idle=${this.pool.idleCount} waiting=${this.pool.waitingCount}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const stack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`PostgreSQL heartbeat failed: ${message}`, stack);
        }
    }
    shouldUseSsl(databaseUrl) {
        const lowered = databaseUrl.toLowerCase();
        return lowered.includes('sslmode=require') || lowered.includes('ssl=true');
    }
};
exports.DrizzleService = DrizzleService;
exports.DrizzleService = DrizzleService = DrizzleService_1 = __decorate([
    (0, common_1.Injectable)()
], DrizzleService);
//# sourceMappingURL=drizzle.service.js.map