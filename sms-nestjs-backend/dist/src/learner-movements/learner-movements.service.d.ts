import { DrizzleService } from '../drizzle/drizzle.service';
export declare class LearnerMovementsService {
    private drizzle;
    constructor(drizzle: DrizzleService);
    create(data: any): Promise<{
        id: string;
        academicYearId: string | null;
        studentName: string;
        status: string;
        movementType: string;
        from: string | null;
        to: string | null;
        effectiveDate: string;
        requestedBy: string | null;
    }>;
    findAll(ayId?: string): Promise<{
        id: string;
        academicYearId: string | null;
        studentName: string;
        status: string;
        movementType: string;
        from: string | null;
        to: string | null;
        effectiveDate: string;
        requestedBy: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        academicYearId: string | null;
        studentName: string;
        status: string;
        movementType: string;
        from: string | null;
        to: string | null;
        effectiveDate: string;
        requestedBy: string | null;
    } | undefined>;
    update(id: string, data: any): Promise<{
        id: string;
        studentName: string;
        movementType: string;
        from: string | null;
        to: string | null;
        effectiveDate: string;
        status: string;
        requestedBy: string | null;
        academicYearId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        academicYearId: string | null;
        studentName: string;
        status: string;
        movementType: string;
        from: string | null;
        to: string | null;
        effectiveDate: string;
        requestedBy: string | null;
    }>;
}
