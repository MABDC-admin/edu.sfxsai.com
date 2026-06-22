"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardSectionNames = exports.standardGradeLevels = void 0;
exports.normalizeStandardGradeLevel = normalizeStandardGradeLevel;
exports.buildStandardSections = buildStandardSections;
exports.standardGradeLevels = [
    'Nursery',
    'K2',
    'G1',
    'G2',
    'G3',
    'G4',
    'G5',
    'G6',
    'G7',
    'G8',
    'G9',
    'G10',
    'G11',
    'G12',
];
exports.standardSectionNames = ['SFXSAI', 'MABDC'];
const DEFAULT_CAPACITY = 30;
const gradeLevelAliasMap = new Map([
    ['pre-kindergarten', 'Nursery'],
    ['kindergarten', 'K2'],
    ['kindergarten 1', 'Nursery'],
    ['nursery', 'Nursery'],
    ['kinder', 'K2'],
    ['k1', 'Nursery'],
    ['kinder 2', 'K2'],
    ['kindergarten 2', 'K2'],
    ['k2', 'K2'],
    ['kinder2', 'K2'],
    ['grade1', 'G1'],
    ['grade2', 'G2'],
    ['grade3', 'G3'],
    ['grade4', 'G4'],
    ['grade5', 'G5'],
    ['grade6', 'G6'],
    ['grade7', 'G7'],
    ['grade8', 'G8'],
    ['grade9', 'G9'],
    ['grade10', 'G10'],
    ['grade11', 'G11'],
    ['grade12', 'G12'],
    ...exports.standardGradeLevels
        .filter(gradeLevel => gradeLevel.startsWith('G'))
        .flatMap(gradeLevel => [
        [gradeLevel.toLowerCase(), gradeLevel],
        [`grade ${gradeLevel.slice(1)}`, gradeLevel],
        [gradeLevel.slice(1), gradeLevel],
        [`grade${gradeLevel.slice(1)}`, gradeLevel],
    ]),
]);
function normalizeStandardGradeLevel(gradeLevel) {
    if (!gradeLevel) {
        return '';
    }
    const normalized = gradeLevel.trim().replace(/\s+/g, ' ').toLowerCase();
    const gradeAlias = gradeLevelAliasMap.get(normalized);
    if (gradeAlias) {
        return gradeAlias;
    }
    const numericOnlyMatch = normalized.match(/^g?(\d+)$/);
    if (numericOnlyMatch) {
        const value = `G${numericOnlyMatch[1]}`;
        return gradeLevelAliasMap.get(value.toLowerCase()) || value;
    }
    return gradeLevel.trim();
}
function normalizeEnrollmentCounts(enrollmentByGrade) {
    const normalized = new Map();
    for (const [gradeLevel, count] of enrollmentByGrade.entries()) {
        const canonicalGradeLevel = normalizeStandardGradeLevel(gradeLevel);
        normalized.set(canonicalGradeLevel, (normalized.get(canonicalGradeLevel) ?? 0) + count);
    }
    return normalized;
}
function buildStandardSections(academicYearId, sfxsaiEnrollmentByGrade = new Map()) {
    const normalizedSfxsaiEnrollmentByGrade = normalizeEnrollmentCounts(sfxsaiEnrollmentByGrade);
    return exports.standardGradeLevels.flatMap(gradeLevel => exports.standardSectionNames.map(sectionName => {
        const enrolled = sectionName === 'SFXSAI'
            ? normalizedSfxsaiEnrollmentByGrade.get(gradeLevel) ?? 0
            : 0;
        const availableSlots = Math.max(DEFAULT_CAPACITY - enrolled, 0);
        return {
            academicYearId,
            gradeLevel,
            sectionName,
            adviser: '',
            room: '',
            capacity: DEFAULT_CAPACITY,
            enrolled,
            availableSlots,
            status: availableSlots === 0 ? 'Full' : 'Open',
        };
    }));
}
//# sourceMappingURL=standard-sections.util.js.map