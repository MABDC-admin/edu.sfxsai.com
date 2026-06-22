import { PrismaService } from '../prisma/prisma.service';
type UploadedFile = {
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
};
type StoreFileInput = {
    file: UploadedFile;
    ownerType: string;
    ownerId?: string;
    category: string;
    uploadedById?: string;
    apiOrigin: string;
};
export declare class StorageService {
    private readonly prisma;
    private readonly storageRoot;
    constructor(prisma: PrismaService);
    storeFile(input: StoreFileInput): Promise<{
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
    listFiles(filters: {
        ownerType?: string;
        ownerId?: string;
        category?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<{
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
    private applyOwnerSideEffect;
}
export {};
