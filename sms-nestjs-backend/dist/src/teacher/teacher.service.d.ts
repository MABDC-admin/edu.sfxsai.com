import { DrizzleService } from '../drizzle/drizzle.service';
type TeacherUser = {
    userId?: string;
    sub?: string;
    id?: string;
    email?: string;
    role?: string;
};
type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
type ResourceType = 'PDF' | 'Video' | 'Document' | 'Link';
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export declare class TeacherService {
    private readonly drizzle;
    constructor(drizzle: DrizzleService);
    getPortalState(user: TeacherUser): Promise<{
        teacher: {
            name: string;
            email: string;
            department: string;
            phone: string;
            advisoryClass: string;
            assignedGradeLevel: string | null;
            avatarUrl: string;
        };
        classes: {
            id: string;
            section: string;
            subject: string;
            schedule: string;
            room: string;
            studentIds: string[];
            gradeLevel: number | undefined;
        }[];
        students: {
            id: string;
            name: string;
            studentNo: string;
            gradeLevel: string;
            gender: string;
            guardian: string;
            contactNo: string;
            contact: string;
            photoUrl: string;
        }[];
        attendance: {
            id: string;
            classId: string;
            studentId: string;
            date: string;
            status: string;
            reason: string;
        }[];
        grades: {
            id: string;
            classId: string;
            studentId: string;
            quarter: string;
            written: number | null;
            performance: number | null;
            exam: number | null;
        }[];
        resources: {
            id: string;
            classId: string;
            title: string;
            type: string;
            subject: string;
            size: string;
            uploadedAt: string;
        }[];
        dlls: {
            id: string;
            classId: string;
            date: string;
            objectives: string;
            activities: string;
            materials: string;
            remarks: string;
        }[];
        announcements: {
            id: string;
            audience: string;
            title: string;
            body: string;
            postedAt: string;
        }[];
        messages: {
            id: string;
            thread: string;
            sender: string;
            audience: string;
            message: string;
            sentAt: string;
        }[];
        scheduleEntries: {
            id: string;
            weekday: string;
            title: string;
            startTime: string;
        }[];
    }>;
    private buildPortalState;
    updateProfile(teacherUserId: string, profile: {
        name?: string;
        email?: string;
        department?: string;
        phone?: string;
        advisoryClass?: string;
        assignedGradeLevel?: string;
    }): Promise<import("pg").QueryResult<never>>;
    markAttendance(teacherUserId: string, body: {
        classId?: string;
        studentId?: string;
        date?: string;
        status?: AttendanceStatus;
        reason?: string;
    }): Promise<import("pg").QueryResult<never>>;
    private resolveAttendanceClassId;
    upsertGrade(teacherUserId: string, body: {
        classId?: string;
        studentId?: string;
        quarter?: Quarter;
        written?: number | null;
        performance?: number | null;
        exam?: number | null;
    }): Promise<import("pg").QueryResult<never>>;
    createResource(teacherUserId: string, body: {
        classId?: string;
        title?: string;
        type?: ResourceType;
        subject?: string;
        size?: string;
    }): Promise<import("pg").QueryResult<never>>;
    updateResource(teacherUserId: string, id: string, body: {
        title?: string;
        type?: ResourceType;
        subject?: string;
        size?: string;
    }): Promise<{
        updated: boolean;
    }>;
    deleteResource(teacherUserId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    createLessonLog(teacherUserId: string, body: {
        classId?: string;
        date?: string;
        objectives?: string;
        activities?: string;
        materials?: string;
        remarks?: string;
    }): Promise<import("pg").QueryResult<never>>;
    updateLessonLog(teacherUserId: string, id: string, body: {
        date?: string;
        objectives?: string;
        activities?: string;
        materials?: string;
        remarks?: string;
    }): Promise<{
        updated: boolean;
    }>;
    deleteLessonLog(teacherUserId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    createAnnouncement(teacherUserId: string, body: {
        audience?: string;
        title?: string;
        body?: string;
    }): Promise<import("pg").QueryResult<never>>;
    updateAnnouncement(teacherUserId: string, id: string, body: {
        audience?: string;
        title?: string;
        body?: string;
    }): Promise<{
        updated: boolean;
    }>;
    deleteAnnouncement(teacherUserId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    sendMessage(teacherUserId: string, body: {
        thread?: string;
        audience?: 'Student' | 'Parent' | 'Admin';
        message?: string;
    }): Promise<import("pg").QueryResult<never>>;
    createScheduleEntry(teacherUserId: string, body: {
        weekday?: string;
        title?: string;
        startTime?: string;
    }): Promise<import("pg").QueryResult<never>>;
    updateScheduleEntry(teacherUserId: string, id: string, body: {
        weekday?: string;
        title?: string;
        startTime?: string;
    }): Promise<{
        updated: boolean;
    }>;
    deleteScheduleEntry(teacherUserId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    requireTeacherUserId(user: TeacherUser): string;
    private loadAssignedStudents;
    private mapStudentIdsByClass;
    private canonicalAttendanceClassIds;
    private studentName;
    private toDateOnly;
    private parseDate;
    private requireText;
    private requireOneOf;
    private requireWeekday;
    private requireTime;
    private nullableScore;
    getStudentAcademicProfile(teacherUserId: string, studentId: string): Promise<{
        student: {
            coreValues: {
                id: string;
                studentId: string;
                createdAt: string;
                updatedAt: string;
                schoolYear: string;
                quarter: string;
                makaDiyos: string;
                makatao: string;
                makakalikasan: string;
                makabansa: string;
            }[];
            healthProfiles: {
                id: string;
                studentId: string;
                createdAt: string;
                updatedAt: string;
                schoolYear: string;
                recordType: string;
                heightMeters: number;
                weightKg: number;
                bmi: number;
                bmiCategory: string;
            }[];
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
            studentCoreValues: {
                id: string;
                studentId: string;
                createdAt: string;
                updatedAt: string;
                schoolYear: string;
                quarter: string;
                makaDiyos: string;
                makatao: string;
                makakalikasan: string;
                makabansa: string;
            }[];
            studentHealthProfiles: {
                id: string;
                studentId: string;
                createdAt: string;
                updatedAt: string;
                schoolYear: string;
                recordType: string;
                heightMeters: number;
                weightKg: number;
                bmi: number;
                bmiCategory: string;
            }[];
        };
        attendance: {
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
        grades: {
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
    }>;
    private assertOwnedDelete;
}
export {};
