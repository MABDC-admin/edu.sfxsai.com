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
exports.AdminTeachersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const drizzle_service_1 = require("../drizzle/drizzle.service");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../drizzle/schema"));
const crypto = __importStar(require("crypto"));
let AdminTeachersService = class AdminTeachersService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    async findAll() {
        const users = await this.drizzle.db.query.user.findMany({
            with: {
                teacherProfiles: true,
                teacherClassAssignments: {
                    orderBy: [(0, drizzle_orm_1.asc)(schema.teacherClassAssignment.sectionName), (0, drizzle_orm_1.asc)(schema.teacherClassAssignment.subject)],
                },
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema.user.createdAt)],
        });
        const teachers = users.filter(u => u.role === 'TEACHER' || u.teacherProfiles.length > 0);
        return teachers.map(teacher => this.toRecord(teacher));
    }
    async create(input) {
        const fullName = this.requireText(input.fullName, 'Full name is required.');
        const email = this.requireEmail(input.email);
        const password = this.requireText(input.password, 'Password is required.');
        const subjects = this.requireSubjects(input.subjects);
        const hashed = await bcrypt.hash(password, 10);
        const existing = await this.drizzle.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema.user.email, email) });
        if (existing) {
            throw new common_1.BadRequestException('Teacher email already exists.');
        }
        const userId = crypto.randomUUID();
        await this.drizzle.db.transaction(async (tx) => {
            await tx.insert(schema.user).values({
                id: userId,
                email,
                password: hashed,
                role: input.role === 'Admin' ? 'ADMIN' : 'TEACHER',
                avatarUrl: input.profilePhotoUrl?.trim() || null,
            });
            await tx.insert(schema.teacherProfile).values({
                id: crypto.randomUUID(),
                teacherUserId: userId,
                updatedAt: new Date().toISOString(),
                ...this.profileData(fullName, email, subjects, input),
            });
            const classes = this.classAssignments(subjects, input);
            if (classes.length) {
                await tx.insert(schema.teacherClassAssignment).values(classes.map(c => ({
                    id: crypto.randomUUID(),
                    teacherUserId: userId,
                    ...c,
                    updatedAt: new Date().toISOString(),
                })));
            }
        });
        const created = await this.drizzle.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, userId),
            with: { teacherProfiles: true, teacherClassAssignments: true },
        });
        return this.toRecord(created);
    }
    async update(id, input) {
        const user = await this.drizzle.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, id),
            with: { teacherProfiles: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('Teacher account not found.');
        }
        const existingProfile = user.teacherProfiles?.[0];
        const fullName = input.fullName?.trim() || existingProfile?.name || user.email;
        const email = input.email?.trim().toLowerCase() || user.email;
        const subjects = input.subjects?.length ? input.subjects : this.splitSubjects(existingProfile?.subjects);
        const mergedInput = {
            contactNumber: existingProfile?.phone ?? '',
            role: existingProfile?.adminRole ?? (user.role === 'ADMIN' ? 'Admin' : 'Teacher'),
            assignedGradeLevel: existingProfile?.assignedGradeLevel ?? '',
            sectionAssignment: existingProfile?.sectionAssignment ?? '',
            advisoryClass: existingProfile?.advisoryClass ?? '',
            subjects,
            profilePhotoUrl: user.avatarUrl ?? '',
            accountStatus: existingProfile?.accountStatus ?? 'Active',
            totalClassesHandled: existingProfile?.totalClassesHandled ?? Math.max(1, subjects.length),
            numberOfStudents: existingProfile?.numberOfStudents ?? 0,
            weeklyHours: existingProfile?.weeklyHours ?? Math.max(6, subjects.length * 5),
            ...input,
        };
        await this.drizzle.db.transaction(async (tx) => {
            await tx.update(schema.user).set({
                email,
                role: mergedInput.role === 'Admin' ? 'ADMIN' : 'TEACHER',
                avatarUrl: mergedInput.profilePhotoUrl || null,
            }).where((0, drizzle_orm_1.eq)(schema.user.id, id));
            const profilePayload = this.profileData(fullName, email, subjects, mergedInput);
            await tx.insert(schema.teacherProfile)
                .values({
                id: crypto.randomUUID(),
                teacherUserId: id,
                updatedAt: new Date().toISOString(),
                ...profilePayload,
            })
                .onConflictDoUpdate({
                target: [schema.teacherProfile.teacherUserId],
                set: { ...profilePayload, updatedAt: new Date().toISOString() },
            });
            if (input.subjects) {
                await tx.delete(schema.teacherClassAssignment).where((0, drizzle_orm_1.eq)(schema.teacherClassAssignment.teacherUserId, id));
                const classes = this.classAssignments(subjects, mergedInput);
                if (classes.length) {
                    await tx.insert(schema.teacherClassAssignment).values(classes.map(c => ({
                        id: crypto.randomUUID(),
                        teacherUserId: id,
                        ...c,
                        updatedAt: new Date().toISOString(),
                    })));
                }
            }
        });
        const updated = await this.drizzle.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, id),
            with: { teacherProfiles: true, teacherClassAssignments: true },
        });
        return this.toRecord(updated);
    }
    async resetPassword(id, password) {
        const nextPassword = this.requireText(password, 'Password is required.');
        const user = await this.drizzle.db.query.user.findFirst({ where: (0, drizzle_orm_1.eq)(schema.user.id, id) });
        if (!user) {
            throw new common_1.NotFoundException('Teacher account not found.');
        }
        const hashed = await bcrypt.hash(nextPassword, 10);
        await this.drizzle.db.update(schema.user).set({
            password: hashed,
        }).where((0, drizzle_orm_1.eq)(schema.user.id, id));
        const updated = await this.drizzle.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, id),
            with: { teacherProfiles: true, teacherClassAssignments: true },
        });
        return this.toRecord(updated);
    }
    profileData(fullName, email, subjects, input) {
        return {
            name: fullName,
            email,
            phone: input.contactNumber?.trim() ?? '',
            department: subjects[0] ?? '',
            advisoryClass: input.advisoryClass?.trim() ?? '',
            assignedGradeLevel: input.assignedGradeLevel?.trim() ?? null,
            accountStatus: input.accountStatus ?? 'Active',
            adminRole: input.role ?? 'Teacher',
            sectionAssignment: input.sectionAssignment?.trim() ?? '',
            subjects: subjects.join('|'),
            totalClassesHandled: Number(input.totalClassesHandled ?? Math.max(1, subjects.length)),
            numberOfStudents: Number(input.numberOfStudents ?? 0),
            weeklyHours: Number(input.weeklyHours ?? Math.max(6, subjects.length * 5)),
        };
    }
    classAssignments(subjects, input) {
        const sectionName = input.sectionAssignment?.trim() || input.advisoryClass?.trim() || input.assignedGradeLevel?.trim() || 'Unassigned';
        return subjects.map(subject => ({
            sectionName,
            subject,
            schedule: 'TBA',
            room: '',
        }));
    }
    toRecord(user) {
        const profile = user?.teacherProfiles?.[0];
        const subjects = this.splitSubjects(profile?.subjects);
        const classSubjects = user?.teacherClassAssignments?.map((item) => item.subject).filter(Boolean) ?? [];
        const effectiveSubjects = subjects.length ? subjects : [...new Set(classSubjects)];
        return {
            id: user.id,
            fullName: profile?.name ?? user.email,
            email: profile?.email ?? user.email,
            contactNumber: profile?.phone ?? '',
            assignedGradeLevel: profile?.assignedGradeLevel ?? '',
            advisoryClass: profile?.advisoryClass ?? '',
            subjects: effectiveSubjects,
            accountStatus: profile?.accountStatus ?? 'Active',
            role: profile?.adminRole ?? (user.role === 'ADMIN' ? 'Admin' : 'Teacher'),
            dateCreated: this.toDateOnly(user.createdAt),
            profilePhotoUrl: user.avatarUrl ?? '',
            sectionAssignment: profile?.sectionAssignment ?? '',
            totalClassesHandled: profile?.totalClassesHandled ?? user.teacherClassAssignments?.length ?? 0,
            numberOfStudents: profile?.numberOfStudents ?? 0,
            weeklyHours: profile?.weeklyHours ?? 0,
            loginHistory: ['Stored in Neon-backed PostgreSQL'],
        };
    }
    splitSubjects(subjects) {
        return (subjects ?? '').split('|').map(subject => subject.trim()).filter(Boolean);
    }
    requireText(value, message) {
        const text = value?.trim();
        if (!text) {
            throw new common_1.BadRequestException(message);
        }
        return text;
    }
    requireEmail(value) {
        const email = this.requireText(value, 'Email address is required.').toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new common_1.BadRequestException('Enter a valid email address.');
        }
        return email;
    }
    requireSubjects(subjects) {
        const list = (subjects ?? []).map(subject => subject.trim()).filter(Boolean);
        if (!list.length) {
            throw new common_1.BadRequestException('At least one subject is required.');
        }
        return list;
    }
    toDateOnly(value) {
        if (!value)
            return '';
        return new Date(value).toISOString().slice(0, 10);
    }
};
exports.AdminTeachersService = AdminTeachersService;
exports.AdminTeachersService = AdminTeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], AdminTeachersService);
//# sourceMappingURL=admin-teachers.service.js.map