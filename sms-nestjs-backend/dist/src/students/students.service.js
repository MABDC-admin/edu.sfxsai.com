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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema = __importStar(require("../drizzle/schema"));
const standard_sections_util_1 = require("../sections/standard-sections.util");
const DEFAULT_STUDENT_PASSWORD = 'ChangeMe123!';
const DEFAULT_APPROVAL_SECTION = 'SFXSAI';
function toNumber(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'bigint')
        return Number(value);
    return Number(value || 0);
}
function withoutPassword(record) {
    if (!record || !record.users?.length) {
        return record;
    }
    const [firstUser] = record.users;
    if (!firstUser) {
        return { ...record, user: null, users: [] };
    }
    const { password, ...userWithoutPassword } = firstUser;
    void password;
    return {
        ...record,
        user: userWithoutPassword,
        users: [userWithoutPassword],
    };
}
let StudentsService = class StudentsService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    assertCreatePayload(payload) {
        if (!payload?.firstName || !payload?.lastName) {
            throw new common_1.BadRequestException('Student first name and last name are required.');
        }
    }
    normalizeSearchPattern(search) {
        return `%${(search ?? '').trim().replace(/%/g, '\\%')}%`;
    }
    async create(data) {
        this.assertCreatePayload(data);
        const normalizedPayload = {
            ...data,
            gradeLevel: data?.gradeLevel ? (0, standard_sections_util_1.normalizeStandardGradeLevel)(data.gradeLevel) : data.gradeLevel,
        };
        const [{ count: currentCount }] = await this.drizzle.db
            .select({ count: (0, drizzle_orm_1.count)(schema.student.id) })
            .from(schema.student);
        const sequence = (toNumber(currentCount) + 1).toString().padStart(3, '0');
        const studentNo = `STU-2026-${sequence}`;
        const providedLrn = data.lrn && String(data.lrn).trim() !== '' ? data.lrn : `TBA-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
        const [created] = await this.drizzle.db
            .insert(schema.student)
            .values({
            id: crypto.randomUUID(),
            studentNo,
            ...normalizedPayload,
            lrn: providedLrn,
            lastUpdated: new Date().toISOString(),
        })
            .returning();
        return created;
    }
    async findAll(ayId, search) {
        const filters = [];
        if (ayId) {
            filters.push((0, drizzle_orm_1.eq)(schema.student.academicYearId, ayId));
        }
        if (search?.trim()) {
            const pattern = this.normalizeSearchPattern(search);
            const searchFilter = (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema.student.firstName, pattern), (0, drizzle_orm_1.ilike)(schema.student.lastName, pattern), (0, drizzle_orm_1.ilike)(schema.student.lrn, pattern), (0, drizzle_orm_1.ilike)(schema.student.studentNo, pattern));
            if (searchFilter) {
                filters.push(searchFilter);
            }
        }
        const where = filters.length ? (0, drizzle_orm_1.and)(...filters) : undefined;
        return this.drizzle.db.query.student.findMany({
            where,
            orderBy: [(0, drizzle_orm_1.desc)(schema.student.lastUpdated), (0, drizzle_orm_1.asc)(schema.student.firstName)],
            limit: search ? 5 : undefined,
        });
    }
    async findOne(id) {
        const row = await this.drizzle.db.query.student.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.student.id, id),
            with: {
                behaviorRecords: true,
                studentFees: true,
                studentSiblings: true,
                users: true,
            },
        });
        if (!row)
            return null;
        const user = row.users?.[0] ?? null;
        const fees = row.studentFees ?? [];
        const siblings = row.studentSiblings ?? [];
        const withPasswordRemoved = withoutPassword({ ...row, user: user, users: row.users });
        return {
            ...withPasswordRemoved,
            user: withPasswordRemoved?.user ?? null,
            fees,
            siblings,
        };
    }
    async update(id, data) {
        const student = await this.drizzle.db.query.student.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.student.id, id),
            with: { users: true },
        });
        if (!student) {
            throw new common_1.BadRequestException('Student was not found.');
        }
        const nextEnrollment = data.enrollmentStatus;
        const wasOfficial = student.enrollmentStatus === 'Officially Enrolled';
        const nowOfficial = nextEnrollment === 'Officially Enrolled';
        const hasUser = student.users && student.users.length > 0;
        const currentUser = (student.users?.[0] ?? null);
        if (nowOfficial && !wasOfficial && !hasUser) {
            const baseUsername = `${student.firstName?.toLowerCase?.()?.replace(/\s+/g, '') ?? ''}.${student.lastName?.toLowerCase?.()?.replace(/\s+/g, '') ?? ''}`;
            let email = `${baseUsername}@sfxsai.com`;
            let suffix = 1;
            while (await this.drizzle.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema.user.email, email) })) {
                email = `${baseUsername}${suffix++}@sfxsai.com`;
            }
            await this.drizzle.db.insert(schema.user).values({
                id: crypto.randomUUID(),
                email,
                password: await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 10),
                role: 'STUDENT',
                studentId: id,
            });
        }
        const payload = {
            ...data,
            gradeLevel: data?.gradeLevel ? (0, standard_sections_util_1.normalizeStandardGradeLevel)(data.gradeLevel) : data.gradeLevel,
        };
        const [updated] = await this.drizzle.db
            .update(schema.student)
            .set({
            ...payload,
            lastUpdated: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema.student.id, id))
            .returning();
        if (!updated) {
            throw new common_1.BadRequestException('Student was not found.');
        }
        return {
            ...updated,
            user: currentUser,
            users: currentUser ? [currentUser] : [],
        };
    }
    async approveEnrollment(id, data = {}) {
        const student = await this.drizzle.db.query.student.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.student.id, id),
            with: { users: true },
        });
        if (!student) {
            throw new common_1.BadRequestException('Student was not found.');
        }
        const gradeLevel = (0, standard_sections_util_1.normalizeStandardGradeLevel)(student.gradeLevel);
        const requestedCampus = String(data.campus ?? DEFAULT_APPROVAL_SECTION).trim().toUpperCase();
        const targetCampus = requestedCampus === 'MABDC' ? 'MABDC' : DEFAULT_APPROVAL_SECTION;
        let targetSectionName = String(student.section ?? '').trim();
        let targetSection = null;
        if (!targetSectionName && gradeLevel && student.academicYearId) {
            targetSection = await this.drizzle.db.query.section.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.section.academicYearId, student.academicYearId), (0, drizzle_orm_1.eq)(schema.section.gradeLevel, gradeLevel), (0, drizzle_orm_1.eq)(schema.section.sectionName, targetCampus)),
            });
            if (targetSection && (targetSection.availableSlots ?? 0) > 0) {
                targetSectionName = targetSection.sectionName;
            }
        }
        const approved = await this.update(id, {
            enrollmentStatus: 'Officially Enrolled',
            documentStatus: 'Complete',
            gradeLevel,
            ...(targetSectionName ? { section: targetSectionName } : {}),
        });
        if (targetSection && targetSectionName) {
            const nextEnrolled = (targetSection.enrolled ?? 0) + 1;
            const nextAvailableSlots = Math.max((targetSection.capacity ?? 0) - nextEnrolled, 0);
            const nextStatus = nextAvailableSlots <= 0 ? 'Closed' : nextAvailableSlots <= 5 ? 'Nearly Full' : 'Open';
            await this.drizzle.db
                .update(schema.section)
                .set({
                enrolled: nextEnrolled,
                availableSlots: nextAvailableSlots,
                status: nextStatus,
            })
                .where((0, drizzle_orm_1.eq)(schema.section.id, targetSection.id))
                .returning();
        }
        return approved;
    }
    async disableStudent(id, data) {
        const student = await this.drizzle.db.query.student.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.student.id, id),
            with: { users: true },
        });
        if (!student) {
            throw new common_1.BadRequestException('Student was not found.');
        }
        const movementType = String(data.movementType ?? 'Dropout').trim();
        if (movementType !== 'Dropout' && movementType !== 'Transfer Out') {
            throw new common_1.BadRequestException('Disable movement type is invalid.');
        }
        const reason = String(data.reason ?? '').trim();
        if (!reason) {
            throw new common_1.BadRequestException(`${movementType} reason is required.`);
        }
        const enrollmentStatus = movementType === 'Transfer Out' ? 'Transferred Out' : 'Dropped Out';
        const effectiveDate = String(data.effectiveDate || new Date().toISOString());
        const remarks = String(data.remarks ?? '').trim();
        const requestedBy = String(data.requestedBy ?? 'Registrar').trim() || 'Registrar';
        const studentName = [student.firstName, student.middleName, student.lastName]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        const fromSection = [student.gradeLevel, student.section].filter(Boolean).join(' - ') || 'Active masterlist';
        const movementDetail = remarks ? `${enrollmentStatus} - ${reason}; ${remarks}` : `${enrollmentStatus} - ${reason}`;
        if (student.users?.length) {
            await this.drizzle.db.delete(schema.user).where((0, drizzle_orm_1.eq)(schema.user.studentId, id)).returning();
        }
        await this.drizzle.db.insert(schema.learnerMovement).values({
            id: crypto.randomUUID(),
            studentName,
            movementType,
            from: fromSection,
            to: movementDetail,
            effectiveDate,
            status: 'Completed',
            requestedBy,
            academicYearId: student.academicYearId,
        }).returning();
        const [updated] = await this.drizzle.db
            .update(schema.student)
            .set({
            enrollmentStatus,
            financeStatus: 'Frozen',
            section: null,
            adviser: null,
            lastUpdated: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema.student.id, id))
            .returning();
        if (!updated) {
            throw new common_1.BadRequestException('Student was not found.');
        }
        const assessmentWhere = student.academicYearId
            ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.studentAssessment.studentId, id), (0, drizzle_orm_1.eq)(schema.studentAssessment.academicYearId, student.academicYearId))
            : (0, drizzle_orm_1.eq)(schema.studentAssessment.studentId, id);
        await this.drizzle.db
            .update(schema.studentAssessment)
            .set({
            financeStatus: 'Frozen',
            updatedAt: new Date().toISOString(),
        })
            .where(assessmentWhere);
        return {
            ...updated,
            user: null,
            users: [],
        };
    }
    async moveGradeSection(id, data) {
        const student = await this.drizzle.db.query.student.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.student.id, id),
            with: { users: true },
        });
        if (!student) {
            throw new common_1.BadRequestException('Student was not found.');
        }
        const rawGradeLevel = String(data.gradeLevel ?? '').trim();
        const nextGradeLevel = rawGradeLevel ? (0, standard_sections_util_1.normalizeStandardGradeLevel)(rawGradeLevel) : '';
        if (!nextGradeLevel) {
            throw new common_1.BadRequestException('Target grade level is required.');
        }
        const nextSection = String(data.section ?? '').trim();
        if (!nextSection) {
            throw new common_1.BadRequestException('Target section is required.');
        }
        const movementType = String(data.movementType ?? 'Correction').trim();
        const allowedMovementTypes = ['Promotion', 'Correction', 'Retention', 'Transfer Section'];
        if (!allowedMovementTypes.includes(movementType)) {
            throw new common_1.BadRequestException('Learner movement type is invalid.');
        }
        const reason = String(data.reason ?? '').trim();
        if (!reason) {
            throw new common_1.BadRequestException('Movement reason is required.');
        }
        const effectiveDate = String(data.effectiveDate || new Date().toISOString());
        const remarks = String(data.remarks ?? '').trim();
        const requestedBy = String(data.requestedBy ?? 'Registrar').trim() || 'Registrar';
        const nextAcademicYearId = String(data.academicYearId ?? student.academicYearId ?? '').trim() || student.academicYearId;
        const studentName = [student.firstName, student.middleName, student.lastName]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        const fromSection = [student.gradeLevel, student.section].filter(Boolean).join(' - ') || 'Active masterlist';
        const toSection = [nextGradeLevel, nextSection].filter(Boolean).join(' - ');
        const movementDetail = remarks ? `${toSection} - ${reason}; ${remarks}` : `${toSection} - ${reason}`;
        await this.drizzle.db.insert(schema.learnerMovement).values({
            id: crypto.randomUUID(),
            studentName,
            movementType,
            from: fromSection,
            to: movementDetail,
            effectiveDate,
            status: 'Completed',
            requestedBy,
            academicYearId: nextAcademicYearId,
        }).returning();
        const [updated] = await this.drizzle.db
            .update(schema.student)
            .set({
            gradeLevel: nextGradeLevel,
            section: nextSection,
            academicYearId: nextAcademicYearId,
            lastUpdated: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema.student.id, id))
            .returning();
        if (!updated) {
            throw new common_1.BadRequestException('Student was not found.');
        }
        const currentUser = (student.users?.[0] ?? null);
        return {
            ...updated,
            user: currentUser,
            users: currentUser ? [currentUser] : [],
        };
    }
    async dropoutStudent(id, data) {
        return this.disableStudent(id, { ...data, movementType: 'Dropout' });
    }
    remove(id) {
        return this.drizzle.db.delete(schema.student).where((0, drizzle_orm_1.eq)(schema.student.id, id)).returning();
    }
    addBehaviorRecord(studentId, data) {
        return this.drizzle.db.insert(schema.behaviorRecord).values({
            id: crypto.randomUUID(),
            studentId,
            ...data,
        }).returning();
    }
    addStudentFee(studentId, data) {
        return this.drizzle.db.insert(schema.studentFee).values({
            id: crypto.randomUUID(),
            studentId,
            ...data,
        }).returning();
    }
    addStudentSibling(studentId, data) {
        return this.drizzle.db.insert(schema.studentSibling).values({
            id: crypto.randomUUID(),
            studentId,
            ...data,
        }).returning();
    }
    async resetPassword(studentId) {
        const user = await this.drizzle.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.studentId, studentId),
        });
        if (!user) {
            throw new common_1.BadRequestException('Student user account was not found.');
        }
        const [updated] = await this.drizzle.db
            .update(schema.user)
            .set({
            password: await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 10),
        })
            .where((0, drizzle_orm_1.eq)(schema.user.id, user.id))
            .returning();
        if (!updated) {
            throw new common_1.BadRequestException('Student user account was not found.');
        }
        const { password, ...safeUser } = updated;
        void password;
        return safeUser;
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], StudentsService);
//# sourceMappingURL=students.service.js.map