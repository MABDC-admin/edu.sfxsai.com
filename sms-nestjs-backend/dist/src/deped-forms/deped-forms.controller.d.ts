import { DepedFormsService } from './deped-forms.service';
export declare class DepedFormsController {
    private readonly service;
    constructor(service: DepedFormsService);
    create(createDto: any): Promise<{
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
    update(id: string, updateDto: any): Promise<{
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
