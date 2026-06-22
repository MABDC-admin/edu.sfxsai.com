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
exports.TeacherService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../drizzle/schema"));
const crypto = __importStar(require("crypto"));
const WEEKDAY_SORT = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
};
let TeacherService = class TeacherService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    async getPortalState(user) {
        return this.buildPortalState(user);
    }
    async buildPortalState(user) {
        const teacherUserId = this.requireTeacherUserId(user);
        const account = await this.drizzle.db.query.user.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.user.id, teacherUserId),
            columns: { id: true, email: true, avatarUrl: true },
        });
        if (!account) {
            throw new common_1.NotFoundException('Teacher account not found.');
        }
        const profile = await this.drizzle.db.query.teacherProfile.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.teacherProfile.teacherUserId, teacherUserId),
        });
        const classes = await this.drizzle.db.query.teacherClassAssignment.findMany({
            where: (0, drizzle_orm_1.eq)(schema.teacherClassAssignment.teacherUserId, teacherUserId),
            orderBy: [(0, drizzle_orm_1.asc)(schema.teacherClassAssignment.sectionName), (0, drizzle_orm_1.asc)(schema.teacherClassAssignment.subject)],
            with: { section: true },
        });
        const students = await this.loadAssignedStudents(classes, profile?.assignedGradeLevel);
        const studentIdsByClass = this.mapStudentIdsByClass(classes, students);
        const attendanceClassIds = this.canonicalAttendanceClassIds(classes);
        const [attendance, grades, resources, dlls, announcements, messages, scheduleEntries] = await Promise.all([
            this.drizzle.db.query.teacherAttendanceRecord.findMany({
                where: (0, drizzle_orm_1.eq)(schema.teacherAttendanceRecord.teacherUserId, teacherUserId),
                orderBy: [(0, drizzle_orm_1.desc)(schema.teacherAttendanceRecord.date), (0, drizzle_orm_1.desc)(schema.teacherAttendanceRecord.updatedAt)],
            }),
            this.drizzle.db.query.teacherGradeRecord.findMany({
                where: (0, drizzle_orm_1.eq)(schema.teacherGradeRecord.teacherUserId, teacherUserId),
                orderBy: [(0, drizzle_orm_1.asc)(schema.teacherGradeRecord.classId), (0, drizzle_orm_1.asc)(schema.teacherGradeRecord.studentId), (0, drizzle_orm_1.asc)(schema.teacherGradeRecord.quarter)],
            }),
            this.drizzle.db.query.teacherResource.findMany({
                where: (0, drizzle_orm_1.eq)(schema.teacherResource.teacherUserId, teacherUserId),
                orderBy: [(0, drizzle_orm_1.desc)(schema.teacherResource.uploadedAt)],
            }),
            this.drizzle.db.query.teacherLessonLog.findMany({
                where: (0, drizzle_orm_1.eq)(schema.teacherLessonLog.teacherUserId, teacherUserId),
                orderBy: [(0, drizzle_orm_1.desc)(schema.teacherLessonLog.date)],
            }),
            this.drizzle.db.query.teacherAnnouncement.findMany({
                where: (0, drizzle_orm_1.eq)(schema.teacherAnnouncement.teacherUserId, teacherUserId),
                orderBy: [(0, drizzle_orm_1.desc)(schema.teacherAnnouncement.postedAt)],
            }),
            this.drizzle.db.query.teacherDirectMessage.findMany({
                where: (0, drizzle_orm_1.eq)(schema.teacherDirectMessage.teacherUserId, teacherUserId),
                orderBy: [(0, drizzle_orm_1.desc)(schema.teacherDirectMessage.sentAt)],
            }),
            this.drizzle.db.query.teacherScheduleEntry.findMany({
                where: (0, drizzle_orm_1.eq)(schema.teacherScheduleEntry.teacherUserId, teacherUserId),
                orderBy: [(0, drizzle_orm_1.asc)(schema.teacherScheduleEntry.weekdaySort), (0, drizzle_orm_1.asc)(schema.teacherScheduleEntry.startTime), (0, drizzle_orm_1.asc)(schema.teacherScheduleEntry.title)],
            }),
        ]);
        return {
            teacher: {
                name: profile?.name ?? account.email ?? user.email ?? 'Teacher',
                email: profile?.email ?? account.email ?? user.email ?? '',
                department: profile?.department ?? '',
                phone: profile?.phone ?? '',
                advisoryClass: profile?.advisoryClass ?? 'No advisory class assigned',
                assignedGradeLevel: profile?.assignedGradeLevel ?? null,
                avatarUrl: account.avatarUrl ?? '',
            },
            classes: classes.map(item => ({
                id: item.id,
                section: item.sectionName,
                subject: item.subject,
                schedule: item.schedule,
                room: item.room ?? '',
                studentIds: studentIdsByClass.get(item.id) ?? [],
                gradeLevel: item.section?.gradeLevel ? parseInt(item.section.gradeLevel.replace(/\D/g, ''), 10) : (profile?.assignedGradeLevel ? parseInt(profile.assignedGradeLevel.replace(/\D/g, ''), 10) : undefined),
            })),
            students: students.map(student => ({
                id: student.id,
                name: this.studentName(student),
                studentNo: student.studentNo,
                gradeLevel: student.gradeLevel,
                gender: student.gender ?? '',
                guardian: student.guardian ?? '',
                contactNo: student.contactNo ?? '',
                contact: student.contactNo ?? '',
                photoUrl: student.photoUrl ?? '',
            })),
            attendance: attendance.filter(record => attendanceClassIds.has(record.classId)).map(record => ({
                id: record.id,
                classId: record.classId,
                studentId: record.studentId,
                date: this.toDateOnly(new Date(record.date)),
                status: record.status,
                reason: record.reason ?? '',
            })),
            grades: grades.map(record => ({
                id: record.id,
                classId: record.classId,
                studentId: record.studentId,
                quarter: record.quarter,
                written: record.written,
                performance: record.performance,
                exam: record.exam,
            })),
            resources: resources.map(record => ({
                id: record.id,
                classId: record.classId,
                title: record.title,
                type: record.type,
                subject: record.subject,
                size: record.size,
                uploadedAt: this.toDateOnly(new Date(record.uploadedAt)),
            })),
            dlls: dlls.map(record => ({
                id: record.id,
                classId: record.classId,
                date: this.toDateOnly(new Date(record.date)),
                objectives: record.objectives,
                activities: record.activities,
                materials: record.materials,
                remarks: record.remarks ?? '',
            })),
            announcements: announcements.map(record => ({
                id: record.id,
                audience: record.audience,
                title: record.title,
                body: record.body,
                postedAt: this.toDateOnly(new Date(record.postedAt)),
            })),
            messages: messages.map(record => ({
                id: record.id,
                thread: record.thread,
                sender: record.sender,
                audience: record.audience,
                message: record.message,
                sentAt: new Date(record.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            })),
            scheduleEntries: scheduleEntries.map(record => ({
                id: record.id,
                weekday: record.weekday,
                title: record.title,
                startTime: record.startTime,
            })),
        };
    }
    async updateProfile(teacherUserId, profile) {
        const name = this.requireText(profile.name, 'Teacher name is required.');
        const email = this.requireText(profile.email, 'Teacher email is required.');
        const payload = {
            name,
            email,
            department: profile.department?.trim() ?? '',
            phone: profile.phone?.trim() ?? '',
            advisoryClass: profile.advisoryClass?.trim() ?? '',
            assignedGradeLevel: profile.assignedGradeLevel?.trim() ?? null,
            updatedAt: new Date().toISOString(),
        };
        return this.drizzle.db.insert(schema.teacherProfile)
            .values({
            id: crypto.randomUUID(),
            teacherUserId,
            ...payload,
            createdAt: new Date().toISOString(),
        })
            .onConflictDoUpdate({
            target: [schema.teacherProfile.teacherUserId],
            set: payload,
        });
    }
    async markAttendance(teacherUserId, body) {
        const classId = await this.resolveAttendanceClassId(teacherUserId, this.requireText(body.classId, 'Class is required.'));
        const studentId = this.requireText(body.studentId, 'Student is required.');
        const dateStr = this.parseDate(body.date, 'Attendance date is required.').toISOString();
        const status = this.requireOneOf(body.status, ['Present', 'Absent', 'Late', 'Excused'], 'Attendance status is invalid.');
        const reason = status === 'Absent' || status === 'Excused'
            ? (body.reason ?? '').trim()
            : '';
        return this.drizzle.db.insert(schema.teacherAttendanceRecord)
            .values({
            id: crypto.randomUUID(),
            teacherUserId,
            classId,
            studentId,
            date: dateStr,
            status,
            reason,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
            .onConflictDoUpdate({
            target: [schema.teacherAttendanceRecord.teacherUserId, schema.teacherAttendanceRecord.classId, schema.teacherAttendanceRecord.studentId, schema.teacherAttendanceRecord.date],
            set: { status, reason, updatedAt: new Date().toISOString() },
        });
    }
    async resolveAttendanceClassId(teacherUserId, classId) {
        const selectedClass = await this.drizzle.db.query.teacherClassAssignment.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherClassAssignment.id, classId), (0, drizzle_orm_1.eq)(schema.teacherClassAssignment.teacherUserId, teacherUserId)),
        });
        if (!selectedClass) {
            throw new common_1.ForbiddenException('Class is not assigned to this teacher.');
        }
        const sameCohort = await this.drizzle.db.query.teacherClassAssignment.findMany({
            where: selectedClass.sectionId
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherClassAssignment.teacherUserId, teacherUserId), (0, drizzle_orm_1.eq)(schema.teacherClassAssignment.sectionId, selectedClass.sectionId))
                : (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherClassAssignment.teacherUserId, teacherUserId), (0, drizzle_orm_1.eq)(schema.teacherClassAssignment.sectionName, selectedClass.sectionName)),
            orderBy: [(0, drizzle_orm_1.asc)(schema.teacherClassAssignment.sectionName), (0, drizzle_orm_1.asc)(schema.teacherClassAssignment.subject)],
        });
        return sameCohort[0]?.id ?? classId;
    }
    async upsertGrade(teacherUserId, body) {
        const classId = this.requireText(body.classId, 'Class is required.');
        const studentId = this.requireText(body.studentId, 'Student is required.');
        const quarter = this.requireOneOf(body.quarter, ['Q1', 'Q2', 'Q3', 'Q4'], 'Quarter is invalid.');
        const data = {
            written: this.nullableScore(body.written),
            performance: this.nullableScore(body.performance),
            exam: this.nullableScore(body.exam),
            updatedAt: new Date().toISOString(),
        };
        return this.drizzle.db.insert(schema.teacherGradeRecord)
            .values({
            id: crypto.randomUUID(),
            teacherUserId,
            classId,
            studentId,
            quarter,
            ...data,
            createdAt: new Date().toISOString(),
        })
            .onConflictDoUpdate({
            target: [schema.teacherGradeRecord.teacherUserId, schema.teacherGradeRecord.classId, schema.teacherGradeRecord.studentId, schema.teacherGradeRecord.quarter],
            set: data,
        });
    }
    async bulkUpsertGrades(teacherUserId, body) {
        if (!body.grades || body.grades.length === 0)
            return;
        const values = body.grades.map(g => ({
            id: crypto.randomUUID(),
            teacherUserId,
            classId: this.requireText(g.classId, 'Class is required.'),
            studentId: this.requireText(g.studentId, 'Student is required.'),
            quarter: this.requireOneOf(g.quarter, ['Q1', 'Q2', 'Q3', 'Q4'], 'Quarter is invalid.'),
            written: this.nullableScore(g.written),
            performance: this.nullableScore(g.performance),
            exam: this.nullableScore(g.exam),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));
        return this.drizzle.db.insert(schema.teacherGradeRecord)
            .values(values)
            .onConflictDoUpdate({
            target: [schema.teacherGradeRecord.teacherUserId, schema.teacherGradeRecord.classId, schema.teacherGradeRecord.studentId, schema.teacherGradeRecord.quarter],
            set: {
                written: (0, drizzle_orm_1.sql) `EXCLUDED.written`,
                performance: (0, drizzle_orm_1.sql) `EXCLUDED.performance`,
                exam: (0, drizzle_orm_1.sql) `EXCLUDED.exam`,
                updatedAt: new Date().toISOString(),
            },
        });
    }
    async createResource(teacherUserId, body) {
        return this.drizzle.db.insert(schema.teacherResource).values({
            id: crypto.randomUUID(),
            teacherUserId,
            classId: this.requireText(body.classId, 'Class is required.'),
            title: this.requireText(body.title, 'Resource title is required.'),
            type: this.requireOneOf(body.type, ['PDF', 'Video', 'Document', 'Link'], 'Resource type is invalid.'),
            subject: this.requireText(body.subject, 'Subject is required.'),
            size: body.size?.trim() || 'Pending upload',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    async updateResource(teacherUserId, id, body) {
        const data = { updatedAt: new Date().toISOString() };
        if (body.title)
            data.title = body.title.trim();
        if (body.type)
            data.type = body.type;
        if (body.subject)
            data.subject = body.subject.trim();
        if (body.size)
            data.size = body.size.trim();
        const result = await this.drizzle.db.update(schema.teacherResource)
            .set(data)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherResource.id, id), (0, drizzle_orm_1.eq)(schema.teacherResource.teacherUserId, teacherUserId)))
            .returning();
        this.assertOwnedDelete(result.length);
        return { updated: true };
    }
    async deleteResource(teacherUserId, id) {
        const result = await this.drizzle.db.delete(schema.teacherResource)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherResource.id, id), (0, drizzle_orm_1.eq)(schema.teacherResource.teacherUserId, teacherUserId)))
            .returning();
        this.assertOwnedDelete(result.length);
        return { deleted: true };
    }
    async createLessonLog(teacherUserId, body) {
        return this.drizzle.db.insert(schema.teacherLessonLog).values({
            id: crypto.randomUUID(),
            teacherUserId,
            classId: this.requireText(body.classId, 'Class is required.'),
            date: this.parseDate(body.date, 'Lesson date is required.').toISOString(),
            objectives: this.requireText(body.objectives, 'Learning objectives are required.'),
            activities: this.requireText(body.activities, 'Activities are required.'),
            materials: this.requireText(body.materials, 'Materials are required.'),
            remarks: body.remarks?.trim() ?? '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    async updateLessonLog(teacherUserId, id, body) {
        const data = { updatedAt: new Date().toISOString() };
        if (body.date)
            data.date = this.parseDate(body.date, 'Lesson date is required.').toISOString();
        if (body.objectives)
            data.objectives = body.objectives.trim();
        if (body.activities)
            data.activities = body.activities.trim();
        if (body.materials)
            data.materials = body.materials.trim();
        if (body.remarks)
            data.remarks = body.remarks.trim();
        const result = await this.drizzle.db.update(schema.teacherLessonLog)
            .set(data)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherLessonLog.id, id), (0, drizzle_orm_1.eq)(schema.teacherLessonLog.teacherUserId, teacherUserId)))
            .returning();
        this.assertOwnedDelete(result.length);
        return { updated: true };
    }
    async deleteLessonLog(teacherUserId, id) {
        const result = await this.drizzle.db.delete(schema.teacherLessonLog)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherLessonLog.id, id), (0, drizzle_orm_1.eq)(schema.teacherLessonLog.teacherUserId, teacherUserId)))
            .returning();
        this.assertOwnedDelete(result.length);
        return { deleted: true };
    }
    async createAnnouncement(teacherUserId, body) {
        return this.drizzle.db.insert(schema.teacherAnnouncement).values({
            id: crypto.randomUUID(),
            teacherUserId,
            audience: this.requireText(body.audience, 'Audience is required.'),
            title: this.requireText(body.title, 'Announcement title is required.'),
            body: this.requireText(body.body, 'Announcement body is required.'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    async updateAnnouncement(teacherUserId, id, body) {
        const data = { updatedAt: new Date().toISOString() };
        if (body.audience)
            data.audience = body.audience.trim();
        if (body.title)
            data.title = body.title.trim();
        if (body.body)
            data.body = body.body.trim();
        const result = await this.drizzle.db.update(schema.teacherAnnouncement)
            .set(data)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherAnnouncement.id, id), (0, drizzle_orm_1.eq)(schema.teacherAnnouncement.teacherUserId, teacherUserId)))
            .returning();
        this.assertOwnedDelete(result.length);
        return { updated: true };
    }
    async deleteAnnouncement(teacherUserId, id) {
        const result = await this.drizzle.db.delete(schema.teacherAnnouncement)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherAnnouncement.id, id), (0, drizzle_orm_1.eq)(schema.teacherAnnouncement.teacherUserId, teacherUserId)))
            .returning();
        this.assertOwnedDelete(result.length);
        return { deleted: true };
    }
    async sendMessage(teacherUserId, body) {
        return this.drizzle.db.insert(schema.teacherDirectMessage).values({
            id: crypto.randomUUID(),
            teacherUserId,
            thread: this.requireText(body.thread, 'Thread is required.'),
            sender: 'You',
            audience: this.requireOneOf(body.audience, ['Student', 'Parent', 'Admin'], 'Message audience is invalid.'),
            message: this.requireText(body.message, 'Message is required.'),
            createdAt: new Date().toISOString(),
        });
    }
    async createScheduleEntry(teacherUserId, body) {
        const weekday = this.requireWeekday(body.weekday);
        const title = this.requireText(body.title, 'Schedule title is required.');
        const startTime = this.requireTime(body.startTime);
        return this.drizzle.db.insert(schema.teacherScheduleEntry).values({
            id: crypto.randomUUID(),
            teacherUserId,
            weekday,
            weekdaySort: WEEKDAY_SORT[weekday],
            title,
            startTime,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    async updateScheduleEntry(teacherUserId, id, body) {
        const weekday = this.requireWeekday(body.weekday);
        const title = this.requireText(body.title, 'Schedule title is required.');
        const startTime = this.requireTime(body.startTime);
        const result = await this.drizzle.db.update(schema.teacherScheduleEntry)
            .set({
            weekday,
            weekdaySort: WEEKDAY_SORT[weekday],
            title,
            startTime,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherScheduleEntry.id, id), (0, drizzle_orm_1.eq)(schema.teacherScheduleEntry.teacherUserId, teacherUserId)))
            .returning();
        this.assertOwnedDelete(result.length);
        return { updated: true };
    }
    async deleteScheduleEntry(teacherUserId, id) {
        const result = await this.drizzle.db.delete(schema.teacherScheduleEntry)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.teacherScheduleEntry.id, id), (0, drizzle_orm_1.eq)(schema.teacherScheduleEntry.teacherUserId, teacherUserId)))
            .returning();
        this.assertOwnedDelete(result.length);
        return { deleted: true };
    }
    requireTeacherUserId(user) {
        const id = user.sub ?? user.userId ?? user.id;
        if (!id) {
            throw new common_1.ForbiddenException('Teacher account is required.');
        }
        return id;
    }
    async loadAssignedStudents(classes, assignedGradeLevel) {
        if (!classes.length) {
            return [];
        }
        const sections = Array.from(new Set(classes.map(item => item.sectionName).filter(Boolean)));
        const conditions = [(0, drizzle_orm_1.inArray)(schema.student.section, sections)];
        if (assignedGradeLevel) {
            conditions.push((0, drizzle_orm_1.eq)(schema.student.gradeLevel, assignedGradeLevel));
        }
        return this.drizzle.db.query.student.findMany({
            where: (0, drizzle_orm_1.and)(...conditions),
            orderBy: [(0, drizzle_orm_1.asc)(schema.student.gradeLevel), (0, drizzle_orm_1.asc)(schema.student.lastName), (0, drizzle_orm_1.asc)(schema.student.firstName)],
        });
    }
    mapStudentIdsByClass(classes, students) {
        const map = new Map();
        for (const sectionClass of classes) {
            const ids = students
                .filter(student => student.section === sectionClass.sectionName)
                .map(student => student.id);
            map.set(sectionClass.id, ids);
        }
        return map;
    }
    canonicalAttendanceClassIds(classes) {
        const ids = new Set();
        const seen = new Set();
        for (const sectionClass of classes) {
            const key = sectionClass.sectionId || sectionClass.sectionName.trim().toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                ids.add(sectionClass.id);
            }
        }
        return ids;
    }
    studentName(student) {
        return [student.firstName, student.middleName, student.lastName]
            .map(part => part?.trim())
            .filter(Boolean)
            .join(' ');
    }
    toDateOnly(date) {
        return date.toISOString().slice(0, 10);
    }
    parseDate(value, message) {
        const text = this.requireText(value, message);
        const date = new Date(`${text}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException(message);
        }
        return date;
    }
    requireText(value, message) {
        const text = value?.trim();
        if (!text) {
            throw new common_1.BadRequestException(message);
        }
        return text;
    }
    requireOneOf(value, allowed, message) {
        if (!value || !allowed.includes(value)) {
            throw new common_1.BadRequestException(message);
        }
        return value;
    }
    requireWeekday(value) {
        return this.requireOneOf(value, Object.keys(WEEKDAY_SORT), 'Schedule day must be Monday to Friday.');
    }
    requireTime(value) {
        const text = this.requireText(value, 'Schedule time is required.');
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) {
            throw new common_1.BadRequestException('Schedule time must use HH:mm format.');
        }
        return text;
    }
    nullableScore(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const score = Number(value);
        if (!Number.isFinite(score) || score < 0 || score > 100) {
            throw new common_1.BadRequestException('Grade scores must be between 0 and 100.');
        }
        return score;
    }
    async getStudentAcademicProfile(teacherUserId, studentId) {
        const student = await this.drizzle.db.query.student.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.student.id, studentId),
            with: {
                academicRecords: true,
                studentCoreValues: true,
                studentHealthProfiles: true,
            }
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found.');
        }
        const attendance = await this.drizzle.db.query.teacherAttendanceRecord.findMany({
            where: (0, drizzle_orm_1.eq)(schema.teacherAttendanceRecord.studentId, studentId),
            orderBy: [(0, drizzle_orm_1.asc)(schema.teacherAttendanceRecord.date)]
        });
        const grades = await this.drizzle.db.query.teacherGradeRecord.findMany({
            where: (0, drizzle_orm_1.eq)(schema.teacherGradeRecord.studentId, studentId),
            orderBy: [(0, drizzle_orm_1.asc)(schema.teacherGradeRecord.quarter)]
        });
        return {
            student: {
                ...student,
                coreValues: student.studentCoreValues,
                healthProfiles: student.studentHealthProfiles,
            },
            attendance,
            grades
        };
    }
    assertOwnedDelete(count) {
        if (count < 1) {
            throw new common_1.ForbiddenException('Record not found for this teacher.');
        }
    }
};
exports.TeacherService = TeacherService;
exports.TeacherService = TeacherService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], TeacherService);
//# sourceMappingURL=teacher.service.js.map