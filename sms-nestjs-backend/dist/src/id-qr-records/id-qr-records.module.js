"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdQrRecordsModule = void 0;
const common_1 = require("@nestjs/common");
const id_qr_records_service_1 = require("./id-qr-records.service");
const id_qr_records_controller_1 = require("./id-qr-records.controller");
const drizzle_module_1 = require("../drizzle/drizzle.module");
let IdQrRecordsModule = class IdQrRecordsModule {
};
exports.IdQrRecordsModule = IdQrRecordsModule;
exports.IdQrRecordsModule = IdQrRecordsModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule],
        controllers: [id_qr_records_controller_1.IdQrRecordsController],
        providers: [id_qr_records_service_1.IdQrRecordsService],
    })
], IdQrRecordsModule);
//# sourceMappingURL=id-qr-records.module.js.map