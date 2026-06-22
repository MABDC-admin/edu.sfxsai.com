"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTeachersModule = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../drizzle/drizzle.module");
const admin_teachers_controller_1 = require("./admin-teachers.controller");
const admin_teachers_service_1 = require("./admin-teachers.service");
let AdminTeachersModule = class AdminTeachersModule {
};
exports.AdminTeachersModule = AdminTeachersModule;
exports.AdminTeachersModule = AdminTeachersModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule],
        controllers: [admin_teachers_controller_1.AdminTeachersController],
        providers: [admin_teachers_service_1.AdminTeachersService],
    })
], AdminTeachersModule);
//# sourceMappingURL=admin-teachers.module.js.map