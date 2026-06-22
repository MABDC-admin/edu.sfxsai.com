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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema = __importStar(require("../drizzle/schema"));
const standard_sections_util_1 = require("./standard-sections.util");
let SectionsService = class SectionsService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    async create(data) {
        const payload = {
            ...data,
            gradeLevel: data?.gradeLevel ? (0, standard_sections_util_1.normalizeStandardGradeLevel)(data.gradeLevel) : data?.gradeLevel,
        };
        const [created] = await this.drizzle.db.insert(schema.section).values(payload).returning();
        return created;
    }
    async findAll(ayId) {
        const sections = await this.drizzle.db.query.section.findMany({
            where: ayId ? (0, drizzle_orm_1.eq)(schema.section.academicYearId, ayId) : undefined,
        });
        const students = await this.drizzle.db.query.student.findMany({
            where: ayId ? (0, drizzle_orm_1.eq)(schema.student.academicYearId, ayId) : undefined,
        });
        const normalizeSectionValue = (value) => (value ?? '').trim().toUpperCase();
        const sectionStatusFromCapacity = (capacity = 0, enrolled = 0) => {
            const available = Math.max(capacity - enrolled, 0);
            if (available <= 0)
                return 'Closed';
            if (available <= 5)
                return 'Nearly Full';
            return 'Open';
        };
        const isCampusOnlySectionName = (sectionName) => {
            const normalized = normalizeSectionValue(sectionName);
            return normalized === 'SFXSAI' || normalized === 'MABDC';
        };
        const extractSectionCampus = (value) => {
            const normalized = normalizeSectionValue(value);
            if (!normalized)
                return undefined;
            const campusMatch = normalized.match(/(^|[\s_/-])(SFXSAI|MABDC)([\s_/-]|$)/i);
            if (!campusMatch) {
                return undefined;
            }
            const campus = campusMatch[2].toUpperCase();
            if (campus === 'SFXSAI') {
                return 'SFXSAI';
            }
            if (campus === 'MABDC') {
                return 'MABDC';
            }
            return undefined;
        };
        const matchesSectionIdentifier = (studentSection, section) => {
            const normalizedStudentSection = normalizeSectionValue(studentSection);
            if (!normalizedStudentSection) {
                return false;
            }
            const normalizedSectionName = normalizeSectionValue(section.sectionName);
            const normalizedSectionId = normalizeSectionValue(section.id);
            const normalizedSectionGrade = normalizeSectionValue(section.gradeLevel);
            if (normalizedStudentSection === normalizedSectionName ||
                normalizedStudentSection === normalizedSectionId) {
                return true;
            }
            return (normalizedStudentSection === `${normalizedSectionName}-${normalizedSectionGrade}` ||
                normalizedStudentSection === `${normalizedSectionName} ${normalizedSectionGrade}` ||
                normalizedStudentSection.endsWith(`-${normalizedSectionName}`) ||
                normalizedStudentSection.endsWith(` ${normalizedSectionName}`) ||
                normalizedStudentSection === normalizedSectionName ||
                normalizedStudentSection.startsWith(`${normalizedSectionName}-`) ||
                normalizedStudentSection.startsWith(`${normalizedSectionName} `) ||
                normalizedStudentSection.includes(`-${normalizedSectionName}-`) ||
                normalizedStudentSection.includes(` ${normalizedSectionName}-`) ||
                normalizedStudentSection.includes(` ${normalizedSectionName} `) ||
                normalizedStudentSection.includes(`-${normalizedSectionName} `));
        };
        const studentAssignedToSection = (student, section) => {
            if (!student.section || !section.gradeLevel) {
                return false;
            }
            if (matchesSectionIdentifier(student.section, section)) {
                return (0, standard_sections_util_1.normalizeStandardGradeLevel)(student.gradeLevel) === (0, standard_sections_util_1.normalizeStandardGradeLevel)(section.gradeLevel);
            }
            const studentCampus = extractSectionCampus(student.section);
            const sectionCampus = extractSectionCampus(section.sectionName);
            if (!studentCampus || !sectionCampus || studentCampus !== sectionCampus) {
                return false;
            }
            if (!isCampusOnlySectionName(section.sectionName)) {
                return (0, standard_sections_util_1.normalizeStandardGradeLevel)(student.gradeLevel) === (0, standard_sections_util_1.normalizeStandardGradeLevel)(section.gradeLevel);
            }
            return false;
        };
        const computeSectionEnrollment = (section) => {
            return students.filter(student => studentAssignedToSection(student, section)).length;
        };
        return sections.map((section) => {
            const enrolled = computeSectionEnrollment(section);
            const capacity = section.capacity ?? 0;
            return {
                ...section,
                gradeLevel: (0, standard_sections_util_1.normalizeStandardGradeLevel)(section.gradeLevel),
                enrolled,
                availableSlots: Math.max(capacity - enrolled, 0),
                status: sectionStatusFromCapacity(capacity, enrolled),
            };
        });
    }
    async getTeachers() {
        return this.drizzle.db.query.user.findMany({
            where: (0, drizzle_orm_1.eq)(schema.user.role, 'TEACHER'),
            with: {
                teacherProfiles: true,
            },
        });
    }
    async findOne(id) {
        return this.drizzle.db.query.section.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.section.id, id),
            with: {
                teacherClassAssignments: true,
            },
        });
    }
    async update(id, data) {
        const payload = {
            ...data,
            gradeLevel: data?.gradeLevel ? (0, standard_sections_util_1.normalizeStandardGradeLevel)(data.gradeLevel) : data?.gradeLevel,
        };
        const [updated] = await this.drizzle.db
            .update(schema.section)
            .set(payload)
            .where((0, drizzle_orm_1.eq)(schema.section.id, id))
            .returning();
        return updated;
    }
    async remove(id) {
        const [deleted] = await this.drizzle.db.delete(schema.section).where((0, drizzle_orm_1.eq)(schema.section.id, id)).returning();
        return deleted;
    }
    async batchAssign(sectionId, studentIds) {
        const section = await this.drizzle.db.query.section.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.section.id, sectionId),
        });
        if (!section)
            throw new Error('Section not found');
        if (studentIds.length > 0) {
            await this.drizzle.db
                .update(schema.student)
                .set({ section: section.sectionName, enrollmentStatus: 'Assigned' })
                .where((0, drizzle_orm_1.inArray)(schema.student.id, studentIds))
                .returning();
        }
        const newEnrolled = section.enrolled + studentIds.length;
        const newAvailable = section.capacity - newEnrolled;
        const [updated] = await this.drizzle.db
            .update(schema.section)
            .set({
            enrolled: newEnrolled,
            availableSlots: newAvailable,
        })
            .where((0, drizzle_orm_1.eq)(schema.section.id, sectionId))
            .returning();
        return updated;
    }
};
exports.SectionsService = SectionsService;
exports.SectionsService = SectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], SectionsService);
//# sourceMappingURL=sections.service.js.map