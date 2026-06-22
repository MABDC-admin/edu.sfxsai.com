"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const standard_sections_util_1 = require("../src/sections/standard-sections.util");
const prisma = new client_1.PrismaClient();
async function main() {
    const activeAcademicYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
        orderBy: { startDate: 'desc' },
    });
    const academicYearId = activeAcademicYear?.id;
    const students = await prisma.student.findMany({
        where: academicYearId ? { academicYearId } : undefined,
        select: { gradeLevel: true },
    });
    const enrollmentByGrade = new Map();
    for (const student of students) {
        enrollmentByGrade.set(student.gradeLevel, (enrollmentByGrade.get(student.gradeLevel) ?? 0) + 1);
    }
    const sections = (0, standard_sections_util_1.buildStandardSections)(academicYearId, enrollmentByGrade);
    await prisma.$transaction(async (tx) => {
        await tx.teacherClassAssignment.updateMany({ data: { sectionId: null } });
        await tx.section.deleteMany({});
        await tx.section.createMany({ data: sections });
        await tx.student.updateMany({
            where: academicYearId ? { academicYearId } : undefined,
            data: { section: 'SFXSAI' },
        });
        await tx.teacherProfile.updateMany({
            data: {
                sectionAssignment: 'SFXSAI',
                advisoryClass: 'SFXSAI',
            },
        });
        await tx.teacherClassAssignment.updateMany({
            data: { sectionName: 'SFXSAI' },
        });
    });
    const result = {
        academicYear: activeAcademicYear?.code ?? 'No active academic year',
        createdSections: sections.length,
        studentsAssignedToSfxsai: students.length,
        teachersAssignedToSfxsai: await prisma.teacherProfile.count(),
    };
    console.log(JSON.stringify(result, null, 2));
}
main()
    .catch(error => {
    console.error(error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=standardize-sections.js.map