import { DrizzleService } from '../drizzle/drizzle.service';
export declare class IdQrRecordsService {
    private drizzle;
    constructor(drizzle: DrizzleService);
    create(data: any): Promise<{
        id: string;
        studentNo: string;
        academicYearId: string | null;
        studentName: string;
        remarks: string | null;
        gradeSection: string | null;
        qrStatus: string;
        idStatus: string;
        lastPrinted: string | null;
    }>;
    findAll(ayId?: string): Promise<{
        id: string;
        studentNo: string;
        academicYearId: string | null;
        studentName: string;
        remarks: string | null;
        gradeSection: string | null;
        qrStatus: string;
        idStatus: string;
        lastPrinted: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        studentNo: string;
        academicYearId: string | null;
        studentName: string;
        remarks: string | null;
        gradeSection: string | null;
        qrStatus: string;
        idStatus: string;
        lastPrinted: string | null;
    } | undefined>;
    update(id: string, data: any): Promise<{
        id: string;
        studentName: string;
        studentNo: string;
        gradeSection: string | null;
        qrStatus: string;
        idStatus: string;
        lastPrinted: string | null;
        remarks: string | null;
        academicYearId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        studentNo: string;
        academicYearId: string | null;
        studentName: string;
        remarks: string | null;
        gradeSection: string | null;
        qrStatus: string;
        idStatus: string;
        lastPrinted: string | null;
    }>;
}
