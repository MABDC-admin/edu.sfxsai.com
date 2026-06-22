"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearnerMovementsModule = void 0;
const common_1 = require("@nestjs/common");
const learner_movements_service_1 = require("./learner-movements.service");
const learner_movements_controller_1 = require("./learner-movements.controller");
const drizzle_module_1 = require("../drizzle/drizzle.module");
let LearnerMovementsModule = class LearnerMovementsModule {
};
exports.LearnerMovementsModule = LearnerMovementsModule;
exports.LearnerMovementsModule = LearnerMovementsModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule],
        controllers: [learner_movements_controller_1.LearnerMovementsController],
        providers: [learner_movements_service_1.LearnerMovementsService],
    })
], LearnerMovementsModule);
//# sourceMappingURL=learner-movements.module.js.map