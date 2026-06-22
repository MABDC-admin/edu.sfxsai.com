"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentHealthProfileRelations = exports.studentCoreValuesRelations = exports.teacherScheduleEntryRelations = exports.calendarEventRelations = exports.teacherProfileRelations = exports.teacherDirectMessageRelations = exports.teacherAnnouncementRelations = exports.teacherLessonLogRelations = exports.teacherResourceRelations = exports.teacherGradeRecordRelations = exports.teacherClassAssignmentRelations = exports.teacherAttendanceRecordRelations = exports.chatMessageRelations = exports.chatConversationRelations = exports.academicRecordRelations = exports.studentSiblingRelations = exports.studentAssessmentLineItemRelations = exports.studentFeeRelations = exports.sectionRelations = exports.paymentReceiptAuditRelations = exports.studentAssessmentRelations = exports.paymentRelations = exports.enrollmentApplicationRelations = exports.learnerMovementRelations = exports.userRelations = exports.integrationLogRelations = exports.idQrRecordRelations = exports.feeTypeRelations = exports.feeTemplateLineItemRelations = exports.feeTemplateRelations = exports.documentRequirementRelations = exports.documentRequestRelations = exports.academicYearRelations = exports.depEdFormRelations = exports.studentRelations = exports.behaviorRecordRelations = void 0;
const relations_1 = require("drizzle-orm/relations");
const schema_1 = require("./schema");
exports.behaviorRecordRelations = (0, relations_1.relations)(schema_1.behaviorRecord, ({ one }) => ({
    student: one(schema_1.student, {
        fields: [schema_1.behaviorRecord.studentId],
        references: [schema_1.student.id]
    }),
}));
exports.studentRelations = (0, relations_1.relations)(schema_1.student, ({ one, many }) => ({
    behaviorRecords: many(schema_1.behaviorRecord),
    payments: many(schema_1.payment),
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.student.academicYearId],
        references: [schema_1.academicYear.id]
    }),
    studentAssessments: many(schema_1.studentAssessment),
    studentFees: many(schema_1.studentFee),
    studentSiblings: many(schema_1.studentSibling),
    users: many(schema_1.user),
    academicRecords: many(schema_1.academicRecord),
    studentCoreValues: many(schema_1.studentCoreValues),
    studentHealthProfiles: many(schema_1.studentHealthProfile),
}));
exports.depEdFormRelations = (0, relations_1.relations)(schema_1.depEdForm, ({ one }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.depEdForm.academicYearId],
        references: [schema_1.academicYear.id]
    }),
}));
exports.academicYearRelations = (0, relations_1.relations)(schema_1.academicYear, ({ many }) => ({
    depEdForms: many(schema_1.depEdForm),
    documentRequests: many(schema_1.documentRequest),
    documentRequirements: many(schema_1.documentRequirement),
    feeTemplates: many(schema_1.feeTemplate),
    idQrRecords: many(schema_1.idQrRecord),
    learnerMovements: many(schema_1.learnerMovement),
    enrollmentApplications: many(schema_1.enrollmentApplication),
    payments: many(schema_1.payment),
    sections: many(schema_1.section),
    students: many(schema_1.student),
    studentAssessments: many(schema_1.studentAssessment),
    academicRecords: many(schema_1.academicRecord),
    teacherClassAssignments: many(schema_1.teacherClassAssignment),
    calendarEvents: many(schema_1.calendarEvent),
}));
exports.documentRequestRelations = (0, relations_1.relations)(schema_1.documentRequest, ({ one }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.documentRequest.academicYearId],
        references: [schema_1.academicYear.id]
    }),
}));
exports.documentRequirementRelations = (0, relations_1.relations)(schema_1.documentRequirement, ({ one }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.documentRequirement.academicYearId],
        references: [schema_1.academicYear.id]
    }),
}));
exports.feeTemplateRelations = (0, relations_1.relations)(schema_1.feeTemplate, ({ one, many }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.feeTemplate.academicYearId],
        references: [schema_1.academicYear.id]
    }),
    feeTemplateLineItems: many(schema_1.feeTemplateLineItem),
    studentAssessments: many(schema_1.studentAssessment),
}));
exports.feeTemplateLineItemRelations = (0, relations_1.relations)(schema_1.feeTemplateLineItem, ({ one, many }) => ({
    feeTemplate: one(schema_1.feeTemplate, {
        fields: [schema_1.feeTemplateLineItem.feeTemplateId],
        references: [schema_1.feeTemplate.id]
    }),
    feeType: one(schema_1.feeType, {
        fields: [schema_1.feeTemplateLineItem.feeTypeId],
        references: [schema_1.feeType.id]
    }),
    studentAssessmentLineItems: many(schema_1.studentAssessmentLineItem),
}));
exports.feeTypeRelations = (0, relations_1.relations)(schema_1.feeType, ({ many }) => ({
    feeTemplateLineItems: many(schema_1.feeTemplateLineItem),
    studentAssessmentLineItems: many(schema_1.studentAssessmentLineItem),
}));
exports.idQrRecordRelations = (0, relations_1.relations)(schema_1.idQrRecord, ({ one }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.idQrRecord.academicYearId],
        references: [schema_1.academicYear.id]
    }),
}));
exports.integrationLogRelations = (0, relations_1.relations)(schema_1.integrationLog, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.integrationLog.performedById],
        references: [schema_1.user.id]
    }),
}));
exports.userRelations = (0, relations_1.relations)(schema_1.user, ({ one, many }) => ({
    integrationLogs: many(schema_1.integrationLog),
    payments: many(schema_1.payment),
    paymentReceiptAudits: many(schema_1.paymentReceiptAudit),
    studentAssessments_createdById: many(schema_1.studentAssessment, {
        relationName: "studentAssessment_createdById_user_id"
    }),
    studentAssessments_updatedById: many(schema_1.studentAssessment, {
        relationName: "studentAssessment_updatedById_user_id"
    }),
    student: one(schema_1.student, {
        fields: [schema_1.user.studentId],
        references: [schema_1.student.id]
    }),
    chatConversations: many(schema_1.chatConversation),
    chatMessages: many(schema_1.chatMessage),
    teacherAttendanceRecords: many(schema_1.teacherAttendanceRecord),
    teacherClassAssignments: many(schema_1.teacherClassAssignment),
    teacherGradeRecords: many(schema_1.teacherGradeRecord),
    teacherResources: many(schema_1.teacherResource),
    teacherLessonLogs: many(schema_1.teacherLessonLog),
    teacherAnnouncements: many(schema_1.teacherAnnouncement),
    teacherDirectMessages: many(schema_1.teacherDirectMessage),
    teacherProfiles: many(schema_1.teacherProfile),
    teacherScheduleEntries: many(schema_1.teacherScheduleEntry),
}));
exports.learnerMovementRelations = (0, relations_1.relations)(schema_1.learnerMovement, ({ one }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.learnerMovement.academicYearId],
        references: [schema_1.academicYear.id]
    }),
}));
exports.enrollmentApplicationRelations = (0, relations_1.relations)(schema_1.enrollmentApplication, ({ one }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.enrollmentApplication.academicYearId],
        references: [schema_1.academicYear.id]
    }),
}));
exports.paymentRelations = (0, relations_1.relations)(schema_1.payment, ({ one, many }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.payment.academicYearId],
        references: [schema_1.academicYear.id]
    }),
    user: one(schema_1.user, {
        fields: [schema_1.payment.encodedById],
        references: [schema_1.user.id]
    }),
    studentAssessment: one(schema_1.studentAssessment, {
        fields: [schema_1.payment.studentAssessmentId],
        references: [schema_1.studentAssessment.id]
    }),
    student: one(schema_1.student, {
        fields: [schema_1.payment.studentId],
        references: [schema_1.student.id]
    }),
    paymentReceiptAudits: many(schema_1.paymentReceiptAudit),
}));
exports.studentAssessmentRelations = (0, relations_1.relations)(schema_1.studentAssessment, ({ one, many }) => ({
    payments: many(schema_1.payment),
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.studentAssessment.academicYearId],
        references: [schema_1.academicYear.id]
    }),
    user_createdById: one(schema_1.user, {
        fields: [schema_1.studentAssessment.createdById],
        references: [schema_1.user.id],
        relationName: "studentAssessment_createdById_user_id"
    }),
    feeTemplate: one(schema_1.feeTemplate, {
        fields: [schema_1.studentAssessment.feeTemplateId],
        references: [schema_1.feeTemplate.id]
    }),
    student: one(schema_1.student, {
        fields: [schema_1.studentAssessment.studentId],
        references: [schema_1.student.id]
    }),
    user_updatedById: one(schema_1.user, {
        fields: [schema_1.studentAssessment.updatedById],
        references: [schema_1.user.id],
        relationName: "studentAssessment_updatedById_user_id"
    }),
    studentAssessmentLineItems: many(schema_1.studentAssessmentLineItem),
}));
exports.paymentReceiptAuditRelations = (0, relations_1.relations)(schema_1.paymentReceiptAudit, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.paymentReceiptAudit.editedById],
        references: [schema_1.user.id]
    }),
    payment: one(schema_1.payment, {
        fields: [schema_1.paymentReceiptAudit.paymentId],
        references: [schema_1.payment.id]
    }),
}));
exports.sectionRelations = (0, relations_1.relations)(schema_1.section, ({ one, many }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.section.academicYearId],
        references: [schema_1.academicYear.id]
    }),
    teacherClassAssignments: many(schema_1.teacherClassAssignment),
}));
exports.studentFeeRelations = (0, relations_1.relations)(schema_1.studentFee, ({ one }) => ({
    student: one(schema_1.student, {
        fields: [schema_1.studentFee.studentId],
        references: [schema_1.student.id]
    }),
}));
exports.studentAssessmentLineItemRelations = (0, relations_1.relations)(schema_1.studentAssessmentLineItem, ({ one }) => ({
    feeType: one(schema_1.feeType, {
        fields: [schema_1.studentAssessmentLineItem.feeTypeId],
        references: [schema_1.feeType.id]
    }),
    feeTemplateLineItem: one(schema_1.feeTemplateLineItem, {
        fields: [schema_1.studentAssessmentLineItem.sourceFeeTemplateLineItemId],
        references: [schema_1.feeTemplateLineItem.id]
    }),
    studentAssessment: one(schema_1.studentAssessment, {
        fields: [schema_1.studentAssessmentLineItem.studentAssessmentId],
        references: [schema_1.studentAssessment.id]
    }),
}));
exports.studentSiblingRelations = (0, relations_1.relations)(schema_1.studentSibling, ({ one }) => ({
    student: one(schema_1.student, {
        fields: [schema_1.studentSibling.studentId],
        references: [schema_1.student.id]
    }),
}));
exports.academicRecordRelations = (0, relations_1.relations)(schema_1.academicRecord, ({ one }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.academicRecord.academicYearId],
        references: [schema_1.academicYear.id]
    }),
    student: one(schema_1.student, {
        fields: [schema_1.academicRecord.studentId],
        references: [schema_1.student.id]
    }),
}));
exports.chatConversationRelations = (0, relations_1.relations)(schema_1.chatConversation, ({ one, many }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.chatConversation.ownerUserId],
        references: [schema_1.user.id]
    }),
    chatMessages: many(schema_1.chatMessage),
}));
exports.chatMessageRelations = (0, relations_1.relations)(schema_1.chatMessage, ({ one }) => ({
    chatConversation: one(schema_1.chatConversation, {
        fields: [schema_1.chatMessage.conversationId],
        references: [schema_1.chatConversation.id]
    }),
    user: one(schema_1.user, {
        fields: [schema_1.chatMessage.senderUserId],
        references: [schema_1.user.id]
    }),
}));
exports.teacherAttendanceRecordRelations = (0, relations_1.relations)(schema_1.teacherAttendanceRecord, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherAttendanceRecord.teacherUserId],
        references: [schema_1.user.id]
    }),
}));
exports.teacherClassAssignmentRelations = (0, relations_1.relations)(schema_1.teacherClassAssignment, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherClassAssignment.teacherUserId],
        references: [schema_1.user.id]
    }),
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.teacherClassAssignment.academicYearId],
        references: [schema_1.academicYear.id]
    }),
    section: one(schema_1.section, {
        fields: [schema_1.teacherClassAssignment.sectionId],
        references: [schema_1.section.id]
    }),
}));
exports.teacherGradeRecordRelations = (0, relations_1.relations)(schema_1.teacherGradeRecord, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherGradeRecord.teacherUserId],
        references: [schema_1.user.id]
    }),
}));
exports.teacherResourceRelations = (0, relations_1.relations)(schema_1.teacherResource, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherResource.teacherUserId],
        references: [schema_1.user.id]
    }),
}));
exports.teacherLessonLogRelations = (0, relations_1.relations)(schema_1.teacherLessonLog, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherLessonLog.teacherUserId],
        references: [schema_1.user.id]
    }),
}));
exports.teacherAnnouncementRelations = (0, relations_1.relations)(schema_1.teacherAnnouncement, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherAnnouncement.teacherUserId],
        references: [schema_1.user.id]
    }),
}));
exports.teacherDirectMessageRelations = (0, relations_1.relations)(schema_1.teacherDirectMessage, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherDirectMessage.teacherUserId],
        references: [schema_1.user.id]
    }),
}));
exports.teacherProfileRelations = (0, relations_1.relations)(schema_1.teacherProfile, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherProfile.teacherUserId],
        references: [schema_1.user.id]
    }),
}));
exports.calendarEventRelations = (0, relations_1.relations)(schema_1.calendarEvent, ({ one }) => ({
    academicYear: one(schema_1.academicYear, {
        fields: [schema_1.calendarEvent.academicYearId],
        references: [schema_1.academicYear.id]
    }),
}));
exports.teacherScheduleEntryRelations = (0, relations_1.relations)(schema_1.teacherScheduleEntry, ({ one }) => ({
    user: one(schema_1.user, {
        fields: [schema_1.teacherScheduleEntry.teacherUserId],
        references: [schema_1.user.id]
    }),
}));
exports.studentCoreValuesRelations = (0, relations_1.relations)(schema_1.studentCoreValues, ({ one }) => ({
    student: one(schema_1.student, {
        fields: [schema_1.studentCoreValues.studentId],
        references: [schema_1.student.id]
    }),
}));
exports.studentHealthProfileRelations = (0, relations_1.relations)(schema_1.studentHealthProfile, ({ one }) => ({
    student: one(schema_1.student, {
        fields: [schema_1.studentHealthProfile.studentId],
        references: [schema_1.student.id]
    }),
}));
//# sourceMappingURL=relations.js.map