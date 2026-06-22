import { DocumentRequestsService } from './document-requests.service';
export declare class DocumentRequestsController {
    private readonly service;
    constructor(service: DocumentRequestsService);
    create(createDto: any): Promise<{
        id: string;
        academicYearId: string | null;
        studentName: string;
        requestNo: string;
        documentType: string;
        paymentStatus: string;
        requestStatus: string;
        requestedAt: string;
        releaseDate: string | null;
    }>;
    findAll(ayId?: string): Promise<{
        id: string;
        academicYearId: string | null;
        studentName: string;
        requestNo: string;
        documentType: string;
        paymentStatus: string;
        requestStatus: string;
        requestedAt: string;
        releaseDate: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        academicYearId: string | null;
        studentName: string;
        requestNo: string;
        documentType: string;
        paymentStatus: string;
        requestStatus: string;
        requestedAt: string;
        releaseDate: string | null;
    } | undefined>;
    update(id: string, updateDto: any): Promise<{
        id: string;
        requestNo: string;
        studentName: string;
        documentType: string;
        paymentStatus: string;
        requestStatus: string;
        requestedAt: string;
        releaseDate: string | null;
        academicYearId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        academicYearId: string | null;
        studentName: string;
        requestNo: string;
        documentType: string;
        paymentStatus: string;
        requestStatus: string;
        requestedAt: string;
        releaseDate: string | null;
    }>;
}
