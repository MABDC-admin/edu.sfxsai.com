import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from '../drizzle/drizzle.service';
export declare class AuthService {
    private drizzle;
    private jwtService;
    constructor(drizzle: DrizzleService, jwtService: JwtService);
    login(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: string;
            avatarUrl: string | null;
        };
    }>;
}
