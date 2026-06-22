import { IntegrationService } from './integration.service';
interface AuthenticatedRequest {
    user?: {
        sub?: string;
        userId?: string;
        id?: string;
    };
}
export declare class IntegrationController {
    private readonly integrationService;
    constructor(integrationService: IntegrationService);
    private userId;
    getStudentFinanceProfile(studentId: string, academicYearId: string, req: AuthenticatedRequest): Promise<{
        student: {
            id: string;
            studentNo: string;
            lrn: string;
            firstName: string;
            middleName: string | null;
            lastName: string;
            gradeLevel: string;
            section: string | null;
            adviser: string | null;
            enrollmentStatus: string;
            documentStatus: string;
            financeStatus: string;
            academicYearId: string | null;
        };
        academicYear: {
            id: string;
            remarks: string | null;
            code: string;
            startDate: string;
            endDate: string;
            isActive: boolean;
        } | undefined;
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
        finance: {
            assessment: {
                id: string;
                studentId: string;
                createdAt: string;
                updatedAt: string;
                financeStatus: string;
                academicYearId: string;
                feeTemplateId: string | null;
                regularDiscountPercent: number;
                siblingDiscountPercent: number;
                scholarshipDiscountPercent: number;
                grossAmount: number;
                discountAmount: number;
                netAmount: number;
                paidAmount: number;
                balance: number;
                createdById: string | null;
                updatedById: string | null;
                payments: {
                    id: string;
                    studentId: string;
                    createdAt: string;
                    updatedAt: string;
                    academicYearId: string;
                    remarks: string | null;
                    amount: number;
                    studentAssessmentId: string;
                    receiptNumber: string;
                    method: string;
                    paymentDate: string;
                    encodedById: string | null;
                }[];
                studentAssessmentLineItems: {
                    id: string;
                    description: string;
                    feeTypeId: string;
                    amount: number;
                    studentAssessmentId: string;
                    sourceFeeTemplateLineItemId: string | null;
                    feeType: {
                        id: string;
                        createdAt: string;
                        name: string;
                        updatedAt: string;
                        isActive: boolean;
                        description: string | null;
                    };
                }[];
            } | undefined;
            clearanceStatus: string;
        };
    }>;
    getFinanceClearance(academicYearId: string, req: AuthenticatedRequest): Promise<{
        studentId: string;
        student: {
            id: string;
            studentNo: string;
            lrn: string;
            firstName: string;
            lastName: string;
            gradeLevel: string;
            section: string | null;
        };
        academicYearId: string;
        financeStatus: string;
        netAmount: number;
        paidAmount: number;
        balance: number;
        updatedAt: string;
    }[]>;
    syncStudentFinanceStatus(studentId: string, academicYearId: string, req: AuthenticatedRequest): Promise<{
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
        lastUpdated: string;
        academicYearId: string | null;
        photoFileId: string | null;
        photoUrl: string | null;
        enrollmentSubmittedAt: string | null;
    } | {
        id: string;
        studentId: string;
        createdAt: string;
        updatedAt: string;
        financeStatus: string;
        academicYearId: string;
        feeTemplateId: string | null;
        regularDiscountPercent: number;
        siblingDiscountPercent: number;
        scholarshipDiscountPercent: number;
        grossAmount: number;
        discountAmount: number;
        netAmount: number;
        paidAmount: number;
        balance: number;
        createdById: string | null;
        updatedById: string | null;
    }>;
    getDataMap(): {
        keys: string[];
        registrarToFinance: {
            registrarField: string;
            financeField: string;
        }[];
        financeToRegistrar: {
            financeField: string;
            registrarField: string;
        }[];
        roles: {
            FINANCE: string[];
            REGISTRAR: string[];
            ADMIN: string[];
        };
    };
}
export {};
