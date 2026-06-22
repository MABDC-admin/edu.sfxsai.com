import { DrizzleService } from '../drizzle/drizzle.service';
export declare class DepedFormsService {
    private drizzle;
    constructor(drizzle: DrizzleService);
    create(data: any): Promise<{
        id: string;
        academicYearId: string | null;
        status: string;
        description: string | null;
        formCode: string;
        formName: string;
        scope: string;
        lastGenerated: string;
    }>;
    findAll(ayId?: string): Promise<{
        id: string;
        academicYearId: string | null;
        status: string;
        description: string | null;
        formCode: string;
        formName: string;
        scope: string;
        lastGenerated: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        academicYearId: string | null;
        status: string;
        description: string | null;
        formCode: string;
        formName: string;
        scope: string;
        lastGenerated: string;
    } | undefined>;
    update(id: string, data: any): Promise<{
        id: string;
        formCode: string;
        formName: string;
        description: string | null;
        scope: string;
        status: string;
        lastGenerated: string;
        academicYearId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        academicYearId: string | null;
        status: string;
        description: string | null;
        formCode: string;
        formName: string;
        scope: string;
        lastGenerated: string;
    }>;
}
