import { DrizzleService } from '../drizzle/drizzle.service';
export declare class SectionsService {
    private drizzle;
    constructor(drizzle: DrizzleService);
    create(data: any): Promise<{
        id: string;
        gradeLevel: string;
        adviser: string | null;
        academicYearId: string | null;
        status: string;
        sectionName: string;
        room: string | null;
        capacity: number;
        enrolled: number;
        availableSlots: number;
    }>;
    findAll(ayId?: string): Promise<{
        gradeLevel: string;
        enrolled: number;
        availableSlots: number;
        status: string;
        id: string;
        adviser: string | null;
        academicYearId: string | null;
        sectionName: string;
        room: string | null;
        capacity: number;
    }[]>;
    getTeachers(): Promise<{
        password: string;
        id: string;
        email: string;
        studentId: string | null;
        role: string;
        avatarUrl: string | null;
        avatarFileId: string | null;
        createdAt: string;
        teacherProfiles: {
            id: string;
            email: string;
            createdAt: string;
            name: string;
            teacherUserId: string;
            department: string | null;
            phone: string | null;
            advisoryClass: string | null;
            assignedGradeLevel: string | null;
            accountStatus: string;
            adminRole: string;
            sectionAssignment: string | null;
            subjects: string;
            totalClassesHandled: number;
            numberOfStudents: number;
            weeklyHours: number;
            updatedAt: string;
        }[];
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        gradeLevel: string;
        adviser: string | null;
        academicYearId: string | null;
        status: string;
        sectionName: string;
        room: string | null;
        capacity: number;
        enrolled: number;
        availableSlots: number;
        teacherClassAssignments: {
            id: string;
            createdAt: string;
            teacherUserId: string;
            updatedAt: string;
            academicYearId: string | null;
            sectionName: string;
            room: string | null;
            subject: string;
            schedule: string;
            sectionId: string | null;
        }[];
    } | undefined>;
    update(id: string, data: any): Promise<{
        id: string;
        gradeLevel: string;
        sectionName: string;
        adviser: string | null;
        room: string | null;
        capacity: number;
        enrolled: number;
        availableSlots: number;
        status: string;
        academicYearId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        gradeLevel: string;
        adviser: string | null;
        academicYearId: string | null;
        status: string;
        sectionName: string;
        room: string | null;
        capacity: number;
        enrolled: number;
        availableSlots: number;
    }>;
    batchAssign(sectionId: string, studentIds: string[]): Promise<{
        id: string;
        gradeLevel: string;
        sectionName: string;
        adviser: string | null;
        room: string | null;
        capacity: number;
        enrolled: number;
        availableSlots: number;
        status: string;
        academicYearId: string | null;
    }>;
}
