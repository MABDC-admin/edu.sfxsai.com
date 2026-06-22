export declare const standardGradeLevels: readonly ["Nursery", "K2", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12"];
export declare const standardSectionNames: readonly ["SFXSAI", "MABDC"];
export type StandardSectionName = (typeof standardSectionNames)[number];
export interface StandardSectionInput {
    academicYearId?: string;
    gradeLevel: string;
    sectionName: StandardSectionName;
    adviser: string;
    room: string;
    capacity: number;
    enrolled: number;
    availableSlots: number;
    status: string;
}
export declare function normalizeStandardGradeLevel(gradeLevel: string | null | undefined): string;
export declare function buildStandardSections(academicYearId?: string, sfxsaiEnrollmentByGrade?: Map<string, number>): StandardSectionInput[];
