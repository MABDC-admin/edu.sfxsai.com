import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadGeneric(file: any, body: any, req: any): Promise<{
        id: string;
        uploadedAt: Date;
        ownerType: string;
        ownerId: string | null;
        category: string;
        originalName: string;
        storedName: string;
        mimeType: string;
        size: number;
        relativePath: string;
        publicUrl: string;
        uploadedById: string | null;
    }>;
    uploadStudentDocument(studentId: string, file: any, req: any): Promise<{
        id: string;
        uploadedAt: Date;
        ownerType: string;
        ownerId: string | null;
        category: string;
        originalName: string;
        storedName: string;
        mimeType: string;
        size: number;
        relativePath: string;
        publicUrl: string;
        uploadedById: string | null;
    }>;
    uploadStudentPhoto(studentId: string, file: any, req: any): Promise<{
        id: string;
        uploadedAt: Date;
        ownerType: string;
        ownerId: string | null;
        category: string;
        originalName: string;
        storedName: string;
        mimeType: string;
        size: number;
        relativePath: string;
        publicUrl: string;
        uploadedById: string | null;
    }>;
    uploadStaffAvatar(file: any, req: any): Promise<{
        id: string;
        uploadedAt: Date;
        ownerType: string;
        ownerId: string | null;
        category: string;
        originalName: string;
        storedName: string;
        mimeType: string;
        size: number;
        relativePath: string;
        publicUrl: string;
        uploadedById: string | null;
    }>;
    listFiles(ownerType?: string, ownerId?: string, category?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        uploadedAt: Date;
        ownerType: string;
        ownerId: string | null;
        category: string;
        originalName: string;
        storedName: string;
        mimeType: string;
        size: number;
        relativePath: string;
        publicUrl: string;
        uploadedById: string | null;
    }[]>;
    deleteFile(id: string): Promise<{
        deleted: boolean;
    }>;
}
