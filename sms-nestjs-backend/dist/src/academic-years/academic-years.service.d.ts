import { DrizzleService } from '../drizzle/drizzle.service';
export declare class AcademicYearsService {
    private drizzle;
    constructor(drizzle: DrizzleService);
    create(data: any): Promise<{
        id: string;
        remarks: string | null;
        code: string;
        startDate: string;
        endDate: string;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        remarks: string | null;
        code: string;
        startDate: string;
        endDate: string;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        remarks: string | null;
        code: string;
        startDate: string;
        endDate: string;
        isActive: boolean;
    } | undefined>;
    update(id: string, data: any): Promise<{
        id: string;
        code: string;
        startDate: string;
        endDate: string;
        isActive: boolean;
        remarks: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        remarks: string | null;
        code: string;
        startDate: string;
        endDate: string;
        isActive: boolean;
    }>;
}
