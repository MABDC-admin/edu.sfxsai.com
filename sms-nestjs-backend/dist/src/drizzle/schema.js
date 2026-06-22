"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentHealthProfile = exports.studentCoreValues = exports.teacherScheduleEntry = exports.calendarEvent = exports.teacherProfile = exports.teacherDirectMessage = exports.teacherAnnouncement = exports.teacherLessonLog = exports.teacherResource = exports.teacherGradeRecord = exports.teacherClassAssignment = exports.teacherAttendanceRecord = exports.chatMessage = exports.chatConversation = exports.academicRecord = exports.user = exports.prismaMigrations = exports.studentSibling = exports.studentAssessmentLineItem = exports.studentFee = exports.studentAssessment = exports.student = exports.section = exports.paymentReceiptAudit = exports.storedFile = exports.payment = exports.academicYear = exports.enrollmentApplication = exports.learnerMovement = exports.integrationLog = exports.idQrRecord = exports.feeType = exports.feeTemplateLineItem = exports.feeTemplate = exports.documentRequirement = exports.documentRequest = exports.depEdForm = exports.behaviorRecord = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.behaviorRecord = (0, pg_core_1.pgTable)("BehaviorRecord", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    incidentType: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)().notNull(),
    date: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    actionTaken: (0, pg_core_1.text)(),
    reportedBy: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "BehaviorRecord_studentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.depEdForm = (0, pg_core_1.pgTable)("DepEdForm", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    formCode: (0, pg_core_1.text)().notNull(),
    formName: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    scope: (0, pg_core_1.text)().notNull(),
    status: (0, pg_core_1.text)().notNull(),
    lastGenerated: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    academicYearId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("DepEdForm_formCode_key").using("btree", table.formCode.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "DepEdForm_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.documentRequest = (0, pg_core_1.pgTable)("DocumentRequest", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    requestNo: (0, pg_core_1.text)().notNull(),
    studentName: (0, pg_core_1.text)().notNull(),
    documentType: (0, pg_core_1.text)().notNull(),
    paymentStatus: (0, pg_core_1.text)().notNull(),
    requestStatus: (0, pg_core_1.text)().notNull(),
    requestedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    releaseDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
    academicYearId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.index)("DocumentRequest_academicYearId_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("DocumentRequest_academicYearId_requestStatus_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.requestStatus.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("DocumentRequest_requestNo_key").using("btree", table.requestNo.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "DocumentRequest_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.documentRequirement = (0, pg_core_1.pgTable)("DocumentRequirement", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentName: (0, pg_core_1.text)().notNull(),
    studentNo: (0, pg_core_1.text)().notNull(),
    requirement: (0, pg_core_1.text)().notNull(),
    status: (0, pg_core_1.text)().notNull(),
    uploadedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    verifiedBy: (0, pg_core_1.text)(),
    remarks: (0, pg_core_1.text)(),
    academicYearId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "DocumentRequirement_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.feeTemplate = (0, pg_core_1.pgTable)("FeeTemplate", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    academicYearId: (0, pg_core_1.text)().notNull(),
    gradeLevel: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    isActive: (0, pg_core_1.boolean)().default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("FeeTemplate_academicYearId_gradeLevel_name_key").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.gradeLevel.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "FeeTemplate_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.feeTemplateLineItem = (0, pg_core_1.pgTable)("FeeTemplateLineItem", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    feeTemplateId: (0, pg_core_1.text)().notNull(),
    feeTypeId: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)().notNull(),
    amount: (0, pg_core_1.doublePrecision)().notNull(),
    sortOrder: (0, pg_core_1.integer)().default(0).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.feeTemplateId],
        foreignColumns: [exports.feeTemplate.id],
        name: "FeeTemplateLineItem_feeTemplateId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.feeTypeId],
        foreignColumns: [exports.feeType.id],
        name: "FeeTemplateLineItem_feeTypeId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.feeType = (0, pg_core_1.pgTable)("FeeType", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    isActive: (0, pg_core_1.boolean)().default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("FeeType_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);
exports.idQrRecord = (0, pg_core_1.pgTable)("IdQrRecord", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentName: (0, pg_core_1.text)().notNull(),
    studentNo: (0, pg_core_1.text)().notNull(),
    gradeSection: (0, pg_core_1.text)(),
    qrStatus: (0, pg_core_1.text)().notNull(),
    idStatus: (0, pg_core_1.text)().notNull(),
    lastPrinted: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
    remarks: (0, pg_core_1.text)(),
    academicYearId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("IdQrRecord_studentNo_key").using("btree", table.studentNo.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "IdQrRecord_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.integrationLog = (0, pg_core_1.pgTable)("IntegrationLog", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    action: (0, pg_core_1.text)().notNull(),
    sourceModule: (0, pg_core_1.text)().notNull(),
    targetModule: (0, pg_core_1.text)().notNull(),
    studentId: (0, pg_core_1.text)(),
    academicYearId: (0, pg_core_1.text)(),
    status: (0, pg_core_1.text)().notNull(),
    message: (0, pg_core_1.text)(),
    performedById: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.performedById],
        foreignColumns: [exports.user.id],
        name: "IntegrationLog_performedById_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.learnerMovement = (0, pg_core_1.pgTable)("LearnerMovement", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentName: (0, pg_core_1.text)().notNull(),
    movementType: (0, pg_core_1.text)().notNull(),
    from: (0, pg_core_1.text)(),
    to: (0, pg_core_1.text)(),
    effectiveDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    status: (0, pg_core_1.text)().notNull(),
    requestedBy: (0, pg_core_1.text)(),
    academicYearId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "LearnerMovement_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.enrollmentApplication = (0, pg_core_1.pgTable)("EnrollmentApplication", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    applicationNo: (0, pg_core_1.text)().notNull(),
    studentName: (0, pg_core_1.text)().notNull(),
    gradeLevel: (0, pg_core_1.text)().notNull(),
    studentType: (0, pg_core_1.text)().notNull(),
    status: (0, pg_core_1.text)().notNull(),
    documentStatus: (0, pg_core_1.text)().notNull(),
    financeStatus: (0, pg_core_1.text)().notNull(),
    submittedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    reviewedBy: (0, pg_core_1.text)(),
    remarks: (0, pg_core_1.text)(),
    academicYearId: (0, pg_core_1.text)(),
    section: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.index)("EnrollmentApplication_academicYearId_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("EnrollmentApplication_academicYearId_status_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("EnrollmentApplication_applicationNo_key").using("btree", table.applicationNo.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "EnrollmentApplication_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.academicYear = (0, pg_core_1.pgTable)("AcademicYear", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    code: (0, pg_core_1.text)().notNull(),
    startDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    endDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    isActive: (0, pg_core_1.boolean)().default(false).notNull(),
    remarks: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("AcademicYear_code_key").using("btree", table.code.asc().nullsLast().op("text_ops")),
]);
exports.payment = (0, pg_core_1.pgTable)("Payment", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentAssessmentId: (0, pg_core_1.text)().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    academicYearId: (0, pg_core_1.text)().notNull(),
    receiptNumber: (0, pg_core_1.text)().notNull(),
    method: (0, pg_core_1.text)().notNull(),
    amount: (0, pg_core_1.doublePrecision)().notNull(),
    paymentDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    remarks: (0, pg_core_1.text)(),
    encodedById: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("Payment_academicYearId_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("Payment_academicYearId_paymentDate_idx").using("btree", table.academicYearId.asc().nullsLast().op("timestamp_ops"), table.paymentDate.asc().nullsLast().op("timestamp_ops")),
    (0, pg_core_1.uniqueIndex)("Payment_academicYearId_receiptNumber_key").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.receiptNumber.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "Payment_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.encodedById],
        foreignColumns: [exports.user.id],
        name: "Payment_encodedById_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.studentAssessmentId],
        foreignColumns: [exports.studentAssessment.id],
        name: "Payment_studentAssessmentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "Payment_studentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.storedFile = (0, pg_core_1.pgTable)("StoredFile", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    ownerType: (0, pg_core_1.text)().notNull(),
    ownerId: (0, pg_core_1.text)(),
    category: (0, pg_core_1.text)().notNull(),
    originalName: (0, pg_core_1.text)().notNull(),
    storedName: (0, pg_core_1.text)().notNull(),
    mimeType: (0, pg_core_1.text)().notNull(),
    size: (0, pg_core_1.integer)().notNull(),
    relativePath: (0, pg_core_1.text)().notNull(),
    publicUrl: (0, pg_core_1.text)().notNull(),
    uploadedById: (0, pg_core_1.text)(),
    uploadedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    (0, pg_core_1.index)("StoredFile_ownerType_ownerId_category_idx").using("btree", table.ownerType.asc().nullsLast().op("text_ops"), table.ownerId.asc().nullsLast().op("text_ops"), table.category.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("StoredFile_uploadedById_idx").using("btree", table.uploadedById.asc().nullsLast().op("text_ops")),
]);
exports.paymentReceiptAudit = (0, pg_core_1.pgTable)("PaymentReceiptAudit", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    paymentId: (0, pg_core_1.text)().notNull(),
    oldReceiptNumber: (0, pg_core_1.text)().notNull(),
    newReceiptNumber: (0, pg_core_1.text)().notNull(),
    editedById: (0, pg_core_1.text)(),
    editedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.editedById],
        foreignColumns: [exports.user.id],
        name: "PaymentReceiptAudit_editedById_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.paymentId],
        foreignColumns: [exports.payment.id],
        name: "PaymentReceiptAudit_paymentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.section = (0, pg_core_1.pgTable)("Section", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    gradeLevel: (0, pg_core_1.text)().notNull(),
    sectionName: (0, pg_core_1.text)().notNull(),
    adviser: (0, pg_core_1.text)(),
    room: (0, pg_core_1.text)(),
    capacity: (0, pg_core_1.integer)().notNull(),
    enrolled: (0, pg_core_1.integer)().default(0).notNull(),
    availableSlots: (0, pg_core_1.integer)().notNull(),
    status: (0, pg_core_1.text)().notNull(),
    academicYearId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.index)("Section_academicYearId_gradeLevel_sectionName_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.gradeLevel.asc().nullsLast().op("text_ops"), table.sectionName.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("Section_academicYearId_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "Section_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.student = (0, pg_core_1.pgTable)("Student", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentNo: (0, pg_core_1.text)().notNull(),
    lrn: (0, pg_core_1.text)().notNull(),
    firstName: (0, pg_core_1.text)().notNull(),
    middleName: (0, pg_core_1.text)(),
    lastName: (0, pg_core_1.text)().notNull(),
    suffix: (0, pg_core_1.text)(),
    birthdate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
    gender: (0, pg_core_1.text)(),
    motherTongue: (0, pg_core_1.text)(),
    dialect: (0, pg_core_1.text)(),
    gradeLevel: (0, pg_core_1.text)().notNull(),
    section: (0, pg_core_1.text)(),
    adviser: (0, pg_core_1.text)(),
    studentType: (0, pg_core_1.text)().notNull(),
    enrollmentStatus: (0, pg_core_1.text)().notNull(),
    documentStatus: (0, pg_core_1.text)().notNull(),
    financeStatus: (0, pg_core_1.text)().notNull(),
    guardian: (0, pg_core_1.text)(),
    contactNo: (0, pg_core_1.text)(),
    address: (0, pg_core_1.text)(),
    motherName: (0, pg_core_1.text)(),
    motherContact: (0, pg_core_1.text)(),
    fatherName: (0, pg_core_1.text)(),
    fatherContact: (0, pg_core_1.text)(),
    phAddress: (0, pg_core_1.text)(),
    uaeAddress: (0, pg_core_1.text)(),
    previousSchool: (0, pg_core_1.text)(),
    lastUpdated: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    academicYearId: (0, pg_core_1.text)(),
    photoFileId: (0, pg_core_1.text)(),
    photoUrl: (0, pg_core_1.text)(),
    enrollmentSubmittedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
}, (table) => [
    (0, pg_core_1.index)("Student_academicYearId_enrollmentStatus_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.enrollmentStatus.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("Student_academicYearId_gradeLevel_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.gradeLevel.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("Student_academicYearId_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("Student_lrn_key").using("btree", table.lrn.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("Student_studentNo_key").using("btree", table.studentNo.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "Student_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.studentAssessment = (0, pg_core_1.pgTable)("StudentAssessment", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    academicYearId: (0, pg_core_1.text)().notNull(),
    feeTemplateId: (0, pg_core_1.text)(),
    regularDiscountPercent: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    siblingDiscountPercent: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    scholarshipDiscountPercent: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    grossAmount: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    discountAmount: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    netAmount: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    paidAmount: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    balance: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    financeStatus: (0, pg_core_1.text)().default('With Balance').notNull(),
    createdById: (0, pg_core_1.text)(),
    updatedById: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("StudentAssessment_academicYearId_financeStatus_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.financeStatus.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("StudentAssessment_academicYearId_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("StudentAssessment_studentId_academicYearId_key").using("btree", table.studentId.asc().nullsLast().op("text_ops"), table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "StudentAssessment_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.createdById],
        foreignColumns: [exports.user.id],
        name: "StudentAssessment_createdById_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.feeTemplateId],
        foreignColumns: [exports.feeTemplate.id],
        name: "StudentAssessment_feeTemplateId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "StudentAssessment_studentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.updatedById],
        foreignColumns: [exports.user.id],
        name: "StudentAssessment_updatedById_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.studentFee = (0, pg_core_1.pgTable)("StudentFee", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    feeType: (0, pg_core_1.text)().notNull(),
    amount: (0, pg_core_1.doublePrecision)().notNull(),
    status: (0, pg_core_1.text)().notNull(),
    dueDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
    paidDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "StudentFee_studentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.studentAssessmentLineItem = (0, pg_core_1.pgTable)("StudentAssessmentLineItem", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentAssessmentId: (0, pg_core_1.text)().notNull(),
    feeTypeId: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)().notNull(),
    amount: (0, pg_core_1.doublePrecision)().notNull(),
    sourceFeeTemplateLineItemId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.feeTypeId],
        foreignColumns: [exports.feeType.id],
        name: "StudentAssessmentLineItem_feeTypeId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.sourceFeeTemplateLineItemId],
        foreignColumns: [exports.feeTemplateLineItem.id],
        name: "StudentAssessmentLineItem_sourceFeeTemplateLineItemId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.studentAssessmentId],
        foreignColumns: [exports.studentAssessment.id],
        name: "StudentAssessmentLineItem_studentAssessmentId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.studentSibling = (0, pg_core_1.pgTable)("StudentSibling", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    siblingName: (0, pg_core_1.text)().notNull(),
    relationship: (0, pg_core_1.text)(),
    gradeLevel: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "StudentSibling_studentId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.prismaMigrations = (0, pg_core_1.pgTable)("_prisma_migrations", {
    id: (0, pg_core_1.varchar)({ length: 36 }).primaryKey().notNull(),
    checksum: (0, pg_core_1.varchar)({ length: 64 }).notNull(),
    finishedAt: (0, pg_core_1.timestamp)("finished_at", { withTimezone: true, mode: 'string' }),
    migrationName: (0, pg_core_1.varchar)("migration_name", { length: 255 }).notNull(),
    logs: (0, pg_core_1.text)(),
    rolledBackAt: (0, pg_core_1.timestamp)("rolled_back_at", { withTimezone: true, mode: 'string' }),
    startedAt: (0, pg_core_1.timestamp)("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    appliedStepsCount: (0, pg_core_1.integer)("applied_steps_count").default(0).notNull(),
});
exports.user = (0, pg_core_1.pgTable)("User", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    email: (0, pg_core_1.text)().notNull(),
    password: (0, pg_core_1.text)().notNull(),
    role: (0, pg_core_1.text)().default('ADMIN').notNull(),
    studentId: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    avatarFileId: (0, pg_core_1.text)(),
    avatarUrl: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("User_studentId_key").using("btree", table.studentId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "User_studentId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.academicRecord = (0, pg_core_1.pgTable)("AcademicRecord", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentName: (0, pg_core_1.text)().notNull(),
    gradeLevel: (0, pg_core_1.text)().notNull(),
    section: (0, pg_core_1.text)(),
    schoolYear: (0, pg_core_1.text)().notNull(),
    generalAverage: (0, pg_core_1.text)(),
    remarks: (0, pg_core_1.text)(),
    status: (0, pg_core_1.text)().notNull(),
    academicYearId: (0, pg_core_1.text)(),
    studentId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "AcademicRecord_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "AcademicRecord_studentId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.chatConversation = (0, pg_core_1.pgTable)("ChatConversation", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    ownerUserId: (0, pg_core_1.text)().notNull(),
    subject: (0, pg_core_1.text)().default('SFXSAI Support Chat').notNull(),
    status: (0, pg_core_1.text)().default('OPEN').notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("ChatConversation_ownerUserId_status_idx").using("btree", table.ownerUserId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.ownerUserId],
        foreignColumns: [exports.user.id],
        name: "ChatConversation_ownerUserId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.chatMessage = (0, pg_core_1.pgTable)("ChatMessage", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    conversationId: (0, pg_core_1.text)().notNull(),
    senderUserId: (0, pg_core_1.text)(),
    senderName: (0, pg_core_1.text)().notNull(),
    senderRole: (0, pg_core_1.text)().notNull(),
    body: (0, pg_core_1.text)().notNull(),
    source: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    readAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
}, (table) => [
    (0, pg_core_1.index)("ChatMessage_conversationId_createdAt_idx").using("btree", table.conversationId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("ChatMessage_senderUserId_idx").using("btree", table.senderUserId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.conversationId],
        foreignColumns: [exports.chatConversation.id],
        name: "ChatMessage_conversationId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.senderUserId],
        foreignColumns: [exports.user.id],
        name: "ChatMessage_senderUserId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.teacherAttendanceRecord = (0, pg_core_1.pgTable)("TeacherAttendanceRecord", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    classId: (0, pg_core_1.text)().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    date: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    status: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    reason: (0, pg_core_1.text)().default('').notNull(),
}, (table) => [
    (0, pg_core_1.index)("TeacherAttendanceRecord_teacherUserId_classId_idx").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops"), table.classId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("TeacherAttendanceRecord_teacherUserId_classId_studentId_dat_key").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops"), table.classId.asc().nullsLast().op("text_ops"), table.studentId.asc().nullsLast().op("timestamp_ops"), table.date.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherAttendanceRecord_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.teacherClassAssignment = (0, pg_core_1.pgTable)("TeacherClassAssignment", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    academicYearId: (0, pg_core_1.text)(),
    sectionId: (0, pg_core_1.text)(),
    sectionName: (0, pg_core_1.text)().notNull(),
    subject: (0, pg_core_1.text)().notNull(),
    schedule: (0, pg_core_1.text)().notNull(),
    room: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("TeacherClassAssignment_academicYearId_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("TeacherClassAssignment_sectionId_idx").using("btree", table.sectionId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("TeacherClassAssignment_teacherUserId_idx").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherClassAssignment_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "TeacherClassAssignment_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.sectionId],
        foreignColumns: [exports.section.id],
        name: "TeacherClassAssignment_sectionId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.teacherGradeRecord = (0, pg_core_1.pgTable)("TeacherGradeRecord", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    classId: (0, pg_core_1.text)().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    quarter: (0, pg_core_1.text)().notNull(),
    written: (0, pg_core_1.doublePrecision)(),
    performance: (0, pg_core_1.doublePrecision)(),
    exam: (0, pg_core_1.doublePrecision)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("TeacherGradeRecord_teacherUserId_classId_idx").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops"), table.classId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("TeacherGradeRecord_teacherUserId_classId_studentId_quarter_key").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops"), table.classId.asc().nullsLast().op("text_ops"), table.studentId.asc().nullsLast().op("text_ops"), table.quarter.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherGradeRecord_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.teacherResource = (0, pg_core_1.pgTable)("TeacherResource", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    classId: (0, pg_core_1.text)().notNull(),
    title: (0, pg_core_1.text)().notNull(),
    type: (0, pg_core_1.text)().notNull(),
    subject: (0, pg_core_1.text)().notNull(),
    size: (0, pg_core_1.text)().default('Pending upload').notNull(),
    uploadedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("TeacherResource_teacherUserId_classId_idx").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops"), table.classId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherResource_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.teacherLessonLog = (0, pg_core_1.pgTable)("TeacherLessonLog", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    classId: (0, pg_core_1.text)().notNull(),
    date: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    objectives: (0, pg_core_1.text)().notNull(),
    activities: (0, pg_core_1.text)().notNull(),
    materials: (0, pg_core_1.text)().notNull(),
    remarks: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("TeacherLessonLog_teacherUserId_classId_date_idx").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops"), table.classId.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherLessonLog_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.teacherAnnouncement = (0, pg_core_1.pgTable)("TeacherAnnouncement", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    audience: (0, pg_core_1.text)().notNull(),
    title: (0, pg_core_1.text)().notNull(),
    body: (0, pg_core_1.text)().notNull(),
    postedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("TeacherAnnouncement_teacherUserId_postedAt_idx").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops"), table.postedAt.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherAnnouncement_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.teacherDirectMessage = (0, pg_core_1.pgTable)("TeacherDirectMessage", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    thread: (0, pg_core_1.text)().notNull(),
    sender: (0, pg_core_1.text)().notNull(),
    audience: (0, pg_core_1.text)().notNull(),
    message: (0, pg_core_1.text)().notNull(),
    sentAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    (0, pg_core_1.index)("TeacherDirectMessage_teacherUserId_sentAt_idx").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops"), table.sentAt.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherDirectMessage_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.teacherProfile = (0, pg_core_1.pgTable)("TeacherProfile", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    email: (0, pg_core_1.text)().notNull(),
    department: (0, pg_core_1.text)(),
    phone: (0, pg_core_1.text)(),
    advisoryClass: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    accountStatus: (0, pg_core_1.text)().default('Active').notNull(),
    adminRole: (0, pg_core_1.text)().default('Teacher').notNull(),
    sectionAssignment: (0, pg_core_1.text)(),
    subjects: (0, pg_core_1.text)().default('').notNull(),
    totalClassesHandled: (0, pg_core_1.integer)().default(0).notNull(),
    numberOfStudents: (0, pg_core_1.integer)().default(0).notNull(),
    weeklyHours: (0, pg_core_1.integer)().default(0).notNull(),
    assignedGradeLevel: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("TeacherProfile_teacherUserId_key").using("btree", table.teacherUserId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherProfile_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.calendarEvent = (0, pg_core_1.pgTable)("CalendarEvent", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    title: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    eventDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    endDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
    eventType: (0, pg_core_1.text)().notNull(),
    color: (0, pg_core_1.text)(),
    academicYearId: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("CalendarEvent_academicYearId_eventDate_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops"), table.eventDate.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.index)("CalendarEvent_academicYearId_idx").using("btree", table.academicYearId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.academicYearId],
        foreignColumns: [exports.academicYear.id],
        name: "CalendarEvent_academicYearId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.teacherScheduleEntry = (0, pg_core_1.pgTable)("TeacherScheduleEntry", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    teacherUserId: (0, pg_core_1.text)().notNull(),
    weekday: (0, pg_core_1.text)().notNull(),
    weekdaySort: (0, pg_core_1.integer)().notNull(),
    title: (0, pg_core_1.text)().notNull(),
    startTime: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("TeacherScheduleEntry_teacherUserId_weekdaySort_idx").using("btree", table.teacherUserId.asc().nullsLast().op("int4_ops"), table.weekdaySort.asc().nullsLast().op("int4_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.teacherUserId],
        foreignColumns: [exports.user.id],
        name: "TeacherScheduleEntry_teacherUserId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.studentCoreValues = (0, pg_core_1.pgTable)("StudentCoreValues", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    schoolYear: (0, pg_core_1.text)().notNull(),
    quarter: (0, pg_core_1.text)().notNull(),
    makaDiyos: (0, pg_core_1.text)().notNull(),
    makatao: (0, pg_core_1.text)().notNull(),
    makakalikasan: (0, pg_core_1.text)().notNull(),
    makabansa: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("StudentCoreValues_studentId_idx").using("btree", table.studentId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("StudentCoreValues_studentId_schoolYear_quarter_key").using("btree", table.studentId.asc().nullsLast().op("text_ops"), table.schoolYear.asc().nullsLast().op("text_ops"), table.quarter.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "StudentCoreValues_studentId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
exports.studentHealthProfile = (0, pg_core_1.pgTable)("StudentHealthProfile", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    studentId: (0, pg_core_1.text)().notNull(),
    schoolYear: (0, pg_core_1.text)().notNull(),
    recordType: (0, pg_core_1.text)().notNull(),
    heightMeters: (0, pg_core_1.doublePrecision)().notNull(),
    weightKg: (0, pg_core_1.doublePrecision)().notNull(),
    bmi: (0, pg_core_1.doublePrecision)().notNull(),
    bmiCategory: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.index)("StudentHealthProfile_studentId_idx").using("btree", table.studentId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("StudentHealthProfile_studentId_schoolYear_recordType_key").using("btree", table.studentId.asc().nullsLast().op("text_ops"), table.schoolYear.asc().nullsLast().op("text_ops"), table.recordType.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.studentId],
        foreignColumns: [exports.student.id],
        name: "StudentHealthProfile_studentId_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
//# sourceMappingURL=schema.js.map