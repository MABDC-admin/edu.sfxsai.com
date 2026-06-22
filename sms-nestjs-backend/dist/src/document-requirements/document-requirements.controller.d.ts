import { DocumentRequirementsService } from './document-requirements.service';
export declare class DocumentRequirementsController {
    private readonly service;
    constructor(service: DocumentRequirementsService);
    create(createDto: any): Promise<{
        id: string;
        studentNo: string;
        academicYearId: string | null;
        studentName: string;
        remarks: string | null;
        status: string;
        requirement: string;
        uploadedAt: string;
        verifiedBy: string | null;
    }>;
    findAll(ayId?: string): Promise<{
        id: string;
        studentNo: string;
        academicYearId: string | null;
        studentName: string;
        remarks: string | null;
        status: string;
        requirement: string;
        uploadedAt: string;
        verifiedBy: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        studentNo: string;
        academicYearId: string | null;
        studentName: string;
        remarks: string | null;
        status: string;
        requirement: string;
        uploadedAt: string;
        verifiedBy: string | null;
    } | undefined>;
    update(id: string, updateDto: any): Promise<{
        id: string;
        studentName: string;
        studentNo: string;
        requirement: string;
        status: string;
        uploadedAt: string;
        verifiedBy: string | null;
        remarks: string | null;
        academicYearId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        studentNo: string;
        academicYearId: string | null;
        studentName: string;
        remarks: string | null;
        status: string;
        requirement: string;
        uploadedAt: string;
        verifiedBy: string | null;
    }>;
}
