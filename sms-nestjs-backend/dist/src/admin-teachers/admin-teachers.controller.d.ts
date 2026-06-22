import { AdminTeachersService } from './admin-teachers.service';
export declare class AdminTeachersController {
    private readonly adminTeachers;
    constructor(adminTeachers: AdminTeachersService);
    findAll(): Promise<{
        id: any;
        fullName: any;
        email: any;
        contactNumber: any;
        assignedGradeLevel: any;
        advisoryClass: any;
        subjects: string[];
        accountStatus: any;
        role: any;
        dateCreated: string;
        profilePhotoUrl: any;
        sectionAssignment: any;
        totalClassesHandled: any;
        numberOfStudents: any;
        weeklyHours: any;
        loginHistory: string[];
    }[]>;
    create(body: Parameters<AdminTeachersService['create']>[0]): Promise<{
        id: any;
        fullName: any;
        email: any;
        contactNumber: any;
        assignedGradeLevel: any;
        advisoryClass: any;
        subjects: string[];
        accountStatus: any;
        role: any;
        dateCreated: string;
        profilePhotoUrl: any;
        sectionAssignment: any;
        totalClassesHandled: any;
        numberOfStudents: any;
        weeklyHours: any;
        loginHistory: string[];
    }>;
    update(id: string, body: Parameters<AdminTeachersService['update']>[1]): Promise<{
        id: any;
        fullName: any;
        email: any;
        contactNumber: any;
        assignedGradeLevel: any;
        advisoryClass: any;
        subjects: string[];
        accountStatus: any;
        role: any;
        dateCreated: string;
        profilePhotoUrl: any;
        sectionAssignment: any;
        totalClassesHandled: any;
        numberOfStudents: any;
        weeklyHours: any;
        loginHistory: string[];
    }>;
    resetPassword(id: string, body: {
        password?: string;
    }): Promise<{
        id: any;
        fullName: any;
        email: any;
        contactNumber: any;
        assignedGradeLevel: any;
        advisoryClass: any;
        subjects: string[];
        accountStatus: any;
        role: any;
        dateCreated: string;
        profilePhotoUrl: any;
        sectionAssignment: any;
        totalClassesHandled: any;
        numberOfStudents: any;
        weeklyHours: any;
        loginHistory: string[];
    }>;
}
