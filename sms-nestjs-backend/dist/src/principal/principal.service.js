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
exports.PrincipalService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const schema = __importStar(require("../drizzle/schema"));
const ABSENT_LIKE_STATUSES = new Set(['absent', 'late', 'excused']);
function compactName(parts) {
    return parts
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function learnerName(student) {
    return compactName([student.firstName, student.middleName, student.lastName]) || student.name || 'Unnamed learner';
}
function average(values) {
    const usable = values.filter(value => Number.isFinite(value));
    if (!usable.length) {
        return 0;
    }
    return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}
function gradeAverage(record) {
    return average([Number(record.written ?? 0), Number(record.performance ?? 0), Number(record.exam ?? 0)]);
}
function attendanceRate(records) {
    if (!records.length) {
        return 0;
    }
    const presentLike = records.filter(record => !ABSENT_LIKE_STATUSES.has(String(record.status ?? '').toLowerCase())).length;
    return Math.round((presentLike / records.length) * 100);
}
function calendarVisible(event, academicYearId) {
    return !event.academicYearId || event.academicYearId === academicYearId;
}
function groupBy(items, getKey) {
    return items.reduce((groups, item) => {
        const key = getKey(item);
        if (!key) {
            return groups;
        }
        groups.set(key, [...(groups.get(key) ?? []), item]);
        return groups;
    }, new Map());
}
let PrincipalService = class PrincipalService {
    drizzle;
    constructor(drizzle) {
        this.drizzle = drizzle;
    }
    async getOverview(academicYearId, principal) {
        if (!academicYearId) {
            throw new common_1.BadRequestException('academicYearId is required.');
        }
        const academicYear = await this.drizzle.db.query.academicYear.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.academicYear.id, academicYearId),
        });
        if (!academicYear) {
            throw new common_1.BadRequestException('Academic year was not found.');
        }
        const [students, sections, teachers, teacherClassAssignments, attendanceRecords, gradeRecords, academicRecords, calendarEvents,] = await Promise.all([
            this.drizzle.db.query.student.findMany({
                where: (0, drizzle_orm_1.eq)(schema.student.academicYearId, academicYearId),
            }),
            this.drizzle.db.query.section.findMany({
                where: (0, drizzle_orm_1.eq)(schema.section.academicYearId, academicYearId),
            }),
            this.drizzle.db.query.user.findMany({
                with: {
                    teacherProfiles: true,
                },
            }),
            this.drizzle.db.query.teacherClassAssignment.findMany({
                where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.teacherClassAssignment.academicYearId, academicYearId), (0, drizzle_orm_1.isNull)(schema.teacherClassAssignment.academicYearId)),
                orderBy: [(0, drizzle_orm_1.asc)(schema.teacherClassAssignment.sectionName), (0, drizzle_orm_1.asc)(schema.teacherClassAssignment.subject)],
            }),
            this.drizzle.db.query.teacherAttendanceRecord.findMany({
                orderBy: [(0, drizzle_orm_1.asc)(schema.teacherAttendanceRecord.date)],
            }),
            this.drizzle.db.query.teacherGradeRecord.findMany({
                orderBy: [(0, drizzle_orm_1.asc)(schema.teacherGradeRecord.classId), (0, drizzle_orm_1.asc)(schema.teacherGradeRecord.studentId), (0, drizzle_orm_1.asc)(schema.teacherGradeRecord.quarter)],
            }),
            this.drizzle.db.query.academicRecord.findMany({
                where: (0, drizzle_orm_1.eq)(schema.academicRecord.academicYearId, academicYearId),
            }),
            this.drizzle.db.query.calendarEvent.findMany({
                orderBy: [(0, drizzle_orm_1.asc)(schema.calendarEvent.eventDate)],
            }),
        ]);
        const liveClassIds = new Set(teacherClassAssignments.map((assignment) => assignment.id));
        const scopedAttendance = attendanceRecords.filter((record) => liveClassIds.has(record.classId));
        const scopedGrades = gradeRecords.filter((record) => liveClassIds.has(record.classId));
        const principalTeachers = teachers.filter((user) => user.role === 'TEACHER' || user.teacherProfiles?.length);
        return {
            academicYear,
            principalProfile: {
                id: principal?.id ?? '',
                name: principal?.name ?? principal?.email ?? 'Principal',
                email: principal?.email ?? '',
                title: 'Principal',
            },
            students,
            sections,
            teachers: principalTeachers,
            attendanceRecords: scopedAttendance,
            gradeRecords: scopedGrades,
            academicRecords,
            calendarEvents: calendarEvents.filter((event) => calendarVisible(event, academicYearId)),
            alerts: this.buildAlerts(students, sections, principalTeachers, scopedAttendance, scopedGrades),
        };
    }
    buildAlerts(students, sections, teachers, attendance, grades) {
        const alerts = [];
        const gradesByStudent = groupBy(grades, record => record.studentId);
        const attendanceByStudent = groupBy(attendance, record => record.studentId);
        students.forEach(student => {
            const studentGrades = gradesByStudent.get(student.id) ?? [];
            const studentAttendance = attendanceByStudent.get(student.id) ?? [];
            const studentAverage = average(studentGrades.map(gradeAverage));
            const studentAttendanceRate = attendanceRate(studentAttendance);
            if (studentGrades.length && studentAverage < 75) {
                alerts.push({
                    id: `student-grade-${student.id}`,
                    severity: 'High',
                    title: `${learnerName(student)} academic intervention`,
                    detail: `Learner average is ${studentAverage}.`,
                    owner: student.section || 'Academic Office',
                });
            }
            if (studentAttendance.length && studentAttendanceRate < 85) {
                alerts.push({
                    id: `student-attendance-${student.id}`,
                    severity: 'Medium',
                    title: `${learnerName(student)} attendance watch`,
                    detail: `Attendance rate is ${studentAttendanceRate}%.`,
                    owner: student.section || 'Academic Office',
                });
            }
        });
        sections.forEach(section => {
            const liveEnrollment = students.filter(student => student.section === section.sectionName).length;
            const enrolled = Number(section.enrolled ?? liveEnrollment);
            const capacity = Number(section.capacity ?? 0);
            if (capacity > 0 && enrolled >= capacity) {
                alerts.push({
                    id: `section-capacity-${section.id}`,
                    severity: 'Low',
                    title: `${section.sectionName} at capacity`,
                    detail: `${enrolled} of ${capacity} seats are occupied.`,
                    owner: section.adviser || 'Registrar',
                });
            }
        });
        teachers.forEach(teacher => {
            const profile = teacher.teacherProfiles?.[0];
            const teacherName = profile?.name || teacher.name || teacher.email || 'Unnamed teacher';
            const status = String(profile?.accountStatus ?? 'Active');
            if (status.toLowerCase() !== 'active') {
                alerts.push({
                    id: `teacher-status-${teacher.id}`,
                    severity: 'Medium',
                    title: `${teacherName} account review`,
                    detail: `Teacher status is ${status}.`,
                    owner: 'Principal Office',
                });
            }
        });
        return alerts.slice(0, 12);
    }
};
exports.PrincipalService = PrincipalService;
exports.PrincipalService = PrincipalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService])
], PrincipalService);
//# sourceMappingURL=principal.service.js.map