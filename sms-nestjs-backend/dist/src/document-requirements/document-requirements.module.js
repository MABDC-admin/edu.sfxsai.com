"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRequirementsModule = void 0;
const common_1 = require("@nestjs/common");
const document_requirements_service_1 = require("./document-requirements.service");
const document_requirements_controller_1 = require("./document-requirements.controller");
const drizzle_module_1 = require("../drizzle/drizzle.module");
let DocumentRequirementsModule = class DocumentRequirementsModule {
};
exports.DocumentRequirementsModule = DocumentRequirementsModule;
exports.DocumentRequirementsModule = DocumentRequirementsModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule],
        controllers: [document_requirements_controller_1.DocumentRequirementsController],
        providers: [document_requirements_service_1.DocumentRequirementsService],
    })
], DocumentRequirementsModule);
//# sourceMappingURL=document-requirements.module.js.map