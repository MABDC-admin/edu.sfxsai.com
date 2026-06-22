"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient({});
async function main() {
    console.log('Seeding database...');
    await prisma.academicYear.upsert({
        where: { code: 'SY2024-2025' },
        update: {},
        create: {
            code: 'SY2024-2025',
            startDate: new Date('2024-08-01'),
            endDate: new Date('2025-05-30'),
            isActive: false,
            remarks: 'Past Academic Year'
        }
    });
    await prisma.academicYear.upsert({
        where: { code: 'SY2025-2026' },
        update: {},
        create: {
            code: 'SY2025-2026',
            startDate: new Date('2025-08-01'),
            endDate: new Date('2026-05-30'),
            isActive: false,
            remarks: 'Past Academic Year'
        }
    });
    await prisma.academicYear.upsert({
        where: { code: 'SY2026-2027' },
        update: {},
        create: {
            code: 'SY2026-2027',
            startDate: new Date('2026-08-01'),
            endDate: new Date('2027-05-30'),
            isActive: true,
            remarks: 'Current Academic Year'
        }
    });
    const adminPassword = await bcrypt.hash('Denskie123', 10);
    await prisma.user.upsert({
        where: { email: 'sottodennis@gmail.com' },
        update: {},
        create: {
            email: 'sottodennis@gmail.com',
            password: adminPassword,
            role: 'ADMIN'
        }
    });
    const registrarPassword = await bcrypt.hash('123456', 10);
    await prisma.user.upsert({
        where: { email: 'rene@sfxsai.com' },
        update: {},
        create: {
            email: 'rene@sfxsai.com',
            password: registrarPassword,
            role: 'REGISTRAR'
        }
    });
    const financePassword = await bcrypt.hash('123456', 10);
    await prisma.user.upsert({
        where: { email: 'ivyann@sfxsai.com' },
        update: {},
        create: {
            email: 'ivyann@sfxsai.com',
            password: financePassword,
            role: 'FINANCE'
        }
    });
    const principalPassword = await bcrypt.hash('123456', 10);
    await prisma.user.upsert({
        where: { email: 'principal@sfxsai.com' },
        update: {
            role: 'PRINCIPAL'
        },
        create: {
            email: 'principal@sfxsai.com',
            password: principalPassword,
            role: 'PRINCIPAL'
        }
    });
    const teacherPassword = await bcrypt.hash('123456', 10);
    await prisma.user.upsert({
        where: { email: 'teacher1@sfxsai.com' },
        update: {
            role: 'TEACHER'
        },
        create: {
            email: 'teacher1@sfxsai.com',
            password: teacherPassword,
            role: 'TEACHER'
        }
    });
    const studentPassword = await bcrypt.hash('123456', 10);
    await prisma.user.upsert({
        where: { email: 'student1@sfxsai.com' },
        update: {
            role: 'STUDENT'
        },
        create: {
            email: 'student1@sfxsai.com',
            password: studentPassword,
            role: 'STUDENT'
        }
    });
    const statuses = ['Enrolled', 'Enrolled', 'Withdrawn', 'Enrolled'];
    for (let i = 1; i <= 15; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (i % 6));
        date.setDate(date.getDate() - (i * 2));
        await prisma.student.upsert({
            where: { lrn: `LRN${100000 + i}` },
            update: { documentStatus: 'Incomplete', enrollmentSubmittedAt: date },
            create: {
                studentNo: `STU-2026-${i.toString().padStart(3, '0')}`,
                lrn: `LRN${100000 + i}`,
                firstName: `Student ${i}`,
                lastName: `Test`,
                gradeLevel: `Grade ${(i % 6) + 7}`,
                studentType: 'Regular',
                enrollmentStatus: statuses[i % 4],
                documentStatus: 'Incomplete',
                financeStatus: 'Paid',
                enrollmentSubmittedAt: date
            }
        });
    }
    const sectionsData = [
        { gradeLevel: 'Grade 10', sectionName: 'Grade 10 - Rizal', capacity: 40, enrolled: 38 },
        { gradeLevel: 'Grade 10', sectionName: 'Grade 10 - Mabini', capacity: 40, enrolled: 40 },
        { gradeLevel: 'Grade 9', sectionName: 'Grade 9 - Bonifacio', capacity: 35, enrolled: 30 },
        { gradeLevel: 'Grade 8', sectionName: 'Grade 8 - Luna', capacity: 45, enrolled: 22 },
        { gradeLevel: 'Grade 7', sectionName: 'Grade 7 - Aguinaldo', capacity: 50, enrolled: 12 },
    ];
    for (const s of sectionsData) {
        const existingSection = await prisma.section.findFirst({ where: { sectionName: s.sectionName } });
        if (!existingSection) {
            await prisma.section.create({
                data: {
                    gradeLevel: s.gradeLevel,
                    sectionName: s.sectionName,
                    capacity: s.capacity,
                    enrolled: s.enrolled,
                    availableSlots: s.capacity - s.enrolled,
                    status: 'Active'
                }
            });
        }
    }
    const existingApp = await prisma.enrollmentApplication.findUnique({ where: { applicationNo: 'APP-2026-001' } });
    if (!existingApp) {
        await prisma.enrollmentApplication.create({
            data: {
                applicationNo: 'APP-2026-001',
                studentName: 'New Applicant One',
                gradeLevel: 'Grade 7',
                studentType: 'New',
                status: 'Pending',
                documentStatus: 'Incomplete',
                financeStatus: 'Unpaid'
            }
        });
    }
    const docsData = [
        { requestNo: 'REQ-001', studentName: 'Student 1 Test', documentType: 'Form 137', requestedAt: new Date() },
        { requestNo: 'REQ-002', studentName: 'Student 5 Test', documentType: 'Good Moral', requestedAt: new Date(Date.now() - 86400000) },
        { requestNo: 'REQ-003', studentName: 'Student 12 Test', documentType: 'Certificate of Enrollment', requestedAt: new Date(Date.now() - 172800000) },
    ];
    for (const d of docsData) {
        const existingReq = await prisma.documentRequest.findUnique({ where: { requestNo: d.requestNo } });
        if (!existingReq) {
            await prisma.documentRequest.create({
                data: {
                    requestNo: d.requestNo,
                    studentName: d.studentName,
                    documentType: d.documentType,
                    paymentStatus: 'Paid',
                    requestStatus: 'Processing',
                    requestedAt: d.requestedAt
                }
            });
        }
    }
    console.log('Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map