import { AcademicYearsService } from './academic-years.service';
export declare class AcademicYearsController {
    private readonly service;
    constructor(service: AcademicYearsService);
    create(createDto: any): Promise<{
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
    update(id: string, updateDto: any): Promise<{
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
