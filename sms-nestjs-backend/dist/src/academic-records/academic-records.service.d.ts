import { DrizzleService } from '../drizzle/drizzle.service';
export declare class AcademicRecordsService {
    private drizzle;
    constructor(drizzle: DrizzleService);
    create(data: any): Promise<{
        id: string;
        studentId: string | null;
        gradeLevel: string;
        section: string | null;
        academicYearId: string | null;
        schoolYear: string;
        studentName: string;
        generalAverage: string | null;
        remarks: string | null;
        status: string;
    }>;
    findAll(ayId?: string): Promise<{
        id: string;
        studentId: string | null;
        gradeLevel: string;
        section: string | null;
        academicYearId: string | null;
        schoolYear: string;
        studentName: string;
        generalAverage: string | null;
        remarks: string | null;
        status: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        studentId: string | null;
        gradeLevel: string;
        section: string | null;
        academicYearId: string | null;
        schoolYear: string;
        studentName: string;
        generalAverage: string | null;
        remarks: string | null;
        status: string;
    } | undefined>;
    update(id: string, data: any): Promise<{
        id: string;
        studentName: string;
        gradeLevel: string;
        section: string | null;
        schoolYear: string;
        generalAverage: string | null;
        remarks: string | null;
        status: string;
        academicYearId: string | null;
        studentId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        studentId: string | null;
        gradeLevel: string;
        section: string | null;
        academicYearId: string | null;
        schoolYear: string;
        studentName: string;
        generalAverage: string | null;
        remarks: string | null;
        status: string;
    }>;
}
