import { TeacherService } from './teacher.service';
interface AuthenticatedRequest {
    user?: {
        sub?: string;
        userId?: string;
        id?: string;
        email?: string;
        role?: string;
    };
}
import { AiService } from '../ai/ai.service';
export declare class TeacherController {
    private readonly teacherService;
    private readonly aiService;
    constructor(teacherService: TeacherService, aiService: AiService);
    private teacherUserId;
    getPortal(req: AuthenticatedRequest): Promise<{
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
    updateProfile(req: AuthenticatedRequest, body: Parameters<TeacherService['updateProfile']>[1]): Promise<{
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
    markAttendance(req: AuthenticatedRequest, body: Parameters<TeacherService['markAttendance']>[1]): Promise<{
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
    upsertGrade(req: AuthenticatedRequest, body: Parameters<TeacherService['upsertGrade']>[1]): Promise<{
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
    bulkUpsertGrades(req: AuthenticatedRequest, body: Parameters<TeacherService['bulkUpsertGrades']>[1]): Promise<{
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
    createResource(req: AuthenticatedRequest, body: Parameters<TeacherService['createResource']>[1]): Promise<{
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
    updateResource(req: AuthenticatedRequest, id: string, body: Parameters<TeacherService['updateResource']>[2]): Promise<{
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
    deleteResource(req: AuthenticatedRequest, id: string): Promise<{
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
    createLessonLog(req: AuthenticatedRequest, body: Parameters<TeacherService['createLessonLog']>[1]): Promise<{
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
    updateLessonLog(req: AuthenticatedRequest, id: string, body: Parameters<TeacherService['updateLessonLog']>[2]): Promise<{
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
    deleteLessonLog(req: AuthenticatedRequest, id: string): Promise<{
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
    createAnnouncement(req: AuthenticatedRequest, body: Parameters<TeacherService['createAnnouncement']>[1]): Promise<{
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
    updateAnnouncement(req: AuthenticatedRequest, id: string, body: Parameters<TeacherService['updateAnnouncement']>[2]): Promise<{
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
    deleteAnnouncement(req: AuthenticatedRequest, id: string): Promise<{
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
    sendMessage(req: AuthenticatedRequest, body: Parameters<TeacherService['sendMessage']>[1]): Promise<{
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
    createScheduleEntry(req: AuthenticatedRequest, body: Parameters<TeacherService['createScheduleEntry']>[1]): Promise<{
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
    updateScheduleEntry(req: AuthenticatedRequest, id: string, body: Parameters<TeacherService['updateScheduleEntry']>[2]): Promise<{
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
    deleteScheduleEntry(req: AuthenticatedRequest, id: string): Promise<{
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
    getStudentAcademicProfile(req: AuthenticatedRequest, studentId: string): Promise<{
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
    getStudentAcademicInsights(req: AuthenticatedRequest, studentId: string): Promise<{
        insights: string;
    }>;
    getAnalyticsInsights(req: AuthenticatedRequest): Promise<{
        insights: string;
    }>;
}
export {};
