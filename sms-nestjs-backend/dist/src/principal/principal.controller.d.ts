import { PrincipalService } from './principal.service';
interface AuthenticatedRequest {
    user?: {
        id?: string;
        email?: string;
        name?: string;
        role?: string;
    };
}
export declare class PrincipalController {
    private readonly principalService;
    constructor(principalService: PrincipalService);
    getOverview(academicYearId: string, req: AuthenticatedRequest): Promise<{
        academicYear: {
            id: string;
            remarks: string | null;
            code: string;
            startDate: string;
            endDate: string;
            isActive: boolean;
        };
        principalProfile: {
            id: string;
            name: string;
            email: string;
            title: string;
        };
        students: {
            id: string;
            studentNo: string;
            lrn: string;
            firstName: string;
            middleName: string | null;
            lastName: string;
            suffix: string | null;
            birthdate: string | null;
            gender: string | null;
            motherTongue: string | null;
            dialect: string | null;
            gradeLevel: string;
            section: string | null;
            adviser: string | null;
            studentType: string;
            enrollmentStatus: string;
            documentStatus: string;
            financeStatus: string;
            guardian: string | null;
            contactNo: string | null;
            address: string | null;
            motherName: string | null;
            motherContact: string | null;
            fatherName: string | null;
            fatherContact: string | null;
            phAddress: string | null;
            uaeAddress: string | null;
            previousSchool: string | null;
            photoUrl: string | null;
            photoFileId: string | null;
            enrollmentSubmittedAt: string | null;
            lastUpdated: string;
            academicYearId: string | null;
        }[];
        sections: {
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
        }[];
        teachers: {
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
        }[];
        attendanceRecords: {
            id: string;
            studentId: string;
            createdAt: string;
            teacherUserId: string;
            updatedAt: string;
            status: string;
            date: string;
            classId: string;
            reason: string;
        }[];
        gradeRecords: {
            id: string;
            studentId: string;
            createdAt: string;
            teacherUserId: string;
            updatedAt: string;
            quarter: string;
            classId: string;
            written: number | null;
            performance: number | null;
            exam: number | null;
        }[];
        academicRecords: {
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
        }[];
        calendarEvents: {
            id: string;
            createdAt: string;
            updatedAt: string;
            academicYearId: string | null;
            endDate: string | null;
            description: string | null;
            title: string;
            eventDate: string;
            eventType: string;
            color: string | null;
        }[];
        alerts: {
            id: string;
            severity: "High" | "Medium" | "Low";
            title: string;
            detail: string;
            owner: string;
        }[];
    }>;
}
export {};
