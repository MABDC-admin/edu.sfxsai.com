"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../auth/roles.decorator");
const teacher_service_1 = require("./teacher.service");
const ai_service_1 = require("../ai/ai.service");
let TeacherController = class TeacherController {
    teacherService;
    aiService;
    constructor(teacherService, aiService) {
        this.teacherService = teacherService;
        this.aiService = aiService;
    }
    teacherUserId(req) {
        return this.teacherService.requireTeacherUserId(req.user ?? {});
    }
    getPortal(req) {
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async updateProfile(req, body) {
        await this.teacherService.updateProfile(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async markAttendance(req, body) {
        await this.teacherService.markAttendance(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async upsertGrade(req, body) {
        await this.teacherService.upsertGrade(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async bulkUpsertGrades(req, body) {
        await this.teacherService.bulkUpsertGrades(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async createResource(req, body) {
        await this.teacherService.createResource(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async updateResource(req, id, body) {
        await this.teacherService.updateResource(this.teacherUserId(req), id, body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async deleteResource(req, id) {
        await this.teacherService.deleteResource(this.teacherUserId(req), id);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async createLessonLog(req, body) {
        await this.teacherService.createLessonLog(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async updateLessonLog(req, id, body) {
        await this.teacherService.updateLessonLog(this.teacherUserId(req), id, body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async deleteLessonLog(req, id) {
        await this.teacherService.deleteLessonLog(this.teacherUserId(req), id);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async createAnnouncement(req, body) {
        await this.teacherService.createAnnouncement(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async updateAnnouncement(req, id, body) {
        await this.teacherService.updateAnnouncement(this.teacherUserId(req), id, body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async deleteAnnouncement(req, id) {
        await this.teacherService.deleteAnnouncement(this.teacherUserId(req), id);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async sendMessage(req, body) {
        await this.teacherService.sendMessage(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async createScheduleEntry(req, body) {
        await this.teacherService.createScheduleEntry(this.teacherUserId(req), body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async updateScheduleEntry(req, id, body) {
        await this.teacherService.updateScheduleEntry(this.teacherUserId(req), id, body);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async deleteScheduleEntry(req, id) {
        await this.teacherService.deleteScheduleEntry(this.teacherUserId(req), id);
        return this.teacherService.getPortalState(req.user ?? {});
    }
    async getStudentAcademicProfile(req, studentId) {
        return this.teacherService.getStudentAcademicProfile(this.teacherUserId(req), studentId);
    }
    async getStudentAcademicInsights(req, studentId) {
        const profile = await this.teacherService.getStudentAcademicProfile(this.teacherUserId(req), studentId);
        const insights = await this.aiService.getStudentAcademicInsights(profile);
        return { insights };
    }
    async getAnalyticsInsights(req) {
        const state = await this.teacherService.getPortalState(req.user ?? {});
        const insights = await this.aiService.getTeacherAnalyticsInsights(state);
        return { insights };
    }
};
exports.TeacherController = TeacherController;
__decorate([
    (0, common_1.Get)('portal'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "getPortal", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('attendance'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "markAttendance", null);
__decorate([
    (0, common_1.Post)('grades'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "upsertGrade", null);
__decorate([
    (0, common_1.Post)('grades/bulk'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "bulkUpsertGrades", null);
__decorate([
    (0, common_1.Post)('resources'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "createResource", null);
__decorate([
    (0, common_1.Patch)('resources/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "updateResource", null);
__decorate([
    (0, common_1.Delete)('resources/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "deleteResource", null);
__decorate([
    (0, common_1.Post)('dlls'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "createLessonLog", null);
__decorate([
    (0, common_1.Patch)('dlls/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "updateLessonLog", null);
__decorate([
    (0, common_1.Delete)('dlls/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "deleteLessonLog", null);
__decorate([
    (0, common_1.Post)('announcements'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Patch)('announcements/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "updateAnnouncement", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('schedule-entries'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "createScheduleEntry", null);
__decorate([
    (0, common_1.Patch)('schedule-entries/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "updateScheduleEntry", null);
__decorate([
    (0, common_1.Delete)('schedule-entries/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "deleteScheduleEntry", null);
__decorate([
    (0, common_1.Get)('students/:studentId/academic-profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getStudentAcademicProfile", null);
__decorate([
    (0, common_1.Get)('students/:studentId/academic-insights'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getStudentAcademicInsights", null);
__decorate([
    (0, common_1.Get)('analytics/insights'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherController.prototype, "getAnalyticsInsights", null);
exports.TeacherController = TeacherController = __decorate([
    (0, common_1.Controller)('teacher'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __metadata("design:paramtypes", [teacher_service_1.TeacherService,
        ai_service_1.AiService])
], TeacherController);
//# sourceMappingURL=teacher.controller.js.map