export declare const behaviorRecordRelations: import("drizzle-orm/relations").Relations<"BehaviorRecord", {
    student: import("drizzle-orm/relations").One<"Student", true>;
}>;
export declare const studentRelations: import("drizzle-orm/relations").Relations<"Student", {
    behaviorRecords: import("drizzle-orm/relations").Many<"BehaviorRecord">;
    payments: import("drizzle-orm/relations").Many<"Payment">;
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
    studentAssessments: import("drizzle-orm/relations").Many<"StudentAssessment">;
    studentFees: import("drizzle-orm/relations").Many<"StudentFee">;
    studentSiblings: import("drizzle-orm/relations").Many<"StudentSibling">;
    users: import("drizzle-orm/relations").Many<"User">;
    academicRecords: import("drizzle-orm/relations").Many<"AcademicRecord">;
    studentCoreValues: import("drizzle-orm/relations").Many<"StudentCoreValues">;
    studentHealthProfiles: import("drizzle-orm/relations").Many<"StudentHealthProfile">;
}>;
export declare const depEdFormRelations: import("drizzle-orm/relations").Relations<"DepEdForm", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
}>;
export declare const academicYearRelations: import("drizzle-orm/relations").Relations<"AcademicYear", {
    depEdForms: import("drizzle-orm/relations").Many<"DepEdForm">;
    documentRequests: import("drizzle-orm/relations").Many<"DocumentRequest">;
    documentRequirements: import("drizzle-orm/relations").Many<"DocumentRequirement">;
    feeTemplates: import("drizzle-orm/relations").Many<"FeeTemplate">;
    idQrRecords: import("drizzle-orm/relations").Many<"IdQrRecord">;
    learnerMovements: import("drizzle-orm/relations").Many<"LearnerMovement">;
    enrollmentApplications: import("drizzle-orm/relations").Many<"EnrollmentApplication">;
    payments: import("drizzle-orm/relations").Many<"Payment">;
    sections: import("drizzle-orm/relations").Many<"Section">;
    students: import("drizzle-orm/relations").Many<"Student">;
    studentAssessments: import("drizzle-orm/relations").Many<"StudentAssessment">;
    academicRecords: import("drizzle-orm/relations").Many<"AcademicRecord">;
    teacherClassAssignments: import("drizzle-orm/relations").Many<"TeacherClassAssignment">;
    calendarEvents: import("drizzle-orm/relations").Many<"CalendarEvent">;
}>;
export declare const documentRequestRelations: import("drizzle-orm/relations").Relations<"DocumentRequest", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
}>;
export declare const documentRequirementRelations: import("drizzle-orm/relations").Relations<"DocumentRequirement", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
}>;
export declare const feeTemplateRelations: import("drizzle-orm/relations").Relations<"FeeTemplate", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", true>;
    feeTemplateLineItems: import("drizzle-orm/relations").Many<"FeeTemplateLineItem">;
    studentAssessments: import("drizzle-orm/relations").Many<"StudentAssessment">;
}>;
export declare const feeTemplateLineItemRelations: import("drizzle-orm/relations").Relations<"FeeTemplateLineItem", {
    feeTemplate: import("drizzle-orm/relations").One<"FeeTemplate", true>;
    feeType: import("drizzle-orm/relations").One<"FeeType", true>;
    studentAssessmentLineItems: import("drizzle-orm/relations").Many<"StudentAssessmentLineItem">;
}>;
export declare const feeTypeRelations: import("drizzle-orm/relations").Relations<"FeeType", {
    feeTemplateLineItems: import("drizzle-orm/relations").Many<"FeeTemplateLineItem">;
    studentAssessmentLineItems: import("drizzle-orm/relations").Many<"StudentAssessmentLineItem">;
}>;
export declare const idQrRecordRelations: import("drizzle-orm/relations").Relations<"IdQrRecord", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
}>;
export declare const integrationLogRelations: import("drizzle-orm/relations").Relations<"IntegrationLog", {
    user: import("drizzle-orm/relations").One<"User", false>;
}>;
export declare const userRelations: import("drizzle-orm/relations").Relations<"User", {
    integrationLogs: import("drizzle-orm/relations").Many<"IntegrationLog">;
    payments: import("drizzle-orm/relations").Many<"Payment">;
    paymentReceiptAudits: import("drizzle-orm/relations").Many<"PaymentReceiptAudit">;
    studentAssessments_createdById: import("drizzle-orm/relations").Many<"StudentAssessment">;
    studentAssessments_updatedById: import("drizzle-orm/relations").Many<"StudentAssessment">;
    student: import("drizzle-orm/relations").One<"Student", false>;
    chatConversations: import("drizzle-orm/relations").Many<"ChatConversation">;
    chatMessages: import("drizzle-orm/relations").Many<"ChatMessage">;
    teacherAttendanceRecords: import("drizzle-orm/relations").Many<"TeacherAttendanceRecord">;
    teacherClassAssignments: import("drizzle-orm/relations").Many<"TeacherClassAssignment">;
    teacherGradeRecords: import("drizzle-orm/relations").Many<"TeacherGradeRecord">;
    teacherResources: import("drizzle-orm/relations").Many<"TeacherResource">;
    teacherLessonLogs: import("drizzle-orm/relations").Many<"TeacherLessonLog">;
    teacherAnnouncements: import("drizzle-orm/relations").Many<"TeacherAnnouncement">;
    teacherDirectMessages: import("drizzle-orm/relations").Many<"TeacherDirectMessage">;
    teacherProfiles: import("drizzle-orm/relations").Many<"TeacherProfile">;
    teacherScheduleEntries: import("drizzle-orm/relations").Many<"TeacherScheduleEntry">;
}>;
export declare const learnerMovementRelations: import("drizzle-orm/relations").Relations<"LearnerMovement", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
}>;
export declare const enrollmentApplicationRelations: import("drizzle-orm/relations").Relations<"EnrollmentApplication", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
}>;
export declare const paymentRelations: import("drizzle-orm/relations").Relations<"Payment", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", true>;
    user: import("drizzle-orm/relations").One<"User", false>;
    studentAssessment: import("drizzle-orm/relations").One<"StudentAssessment", true>;
    student: import("drizzle-orm/relations").One<"Student", true>;
    paymentReceiptAudits: import("drizzle-orm/relations").Many<"PaymentReceiptAudit">;
}>;
export declare const studentAssessmentRelations: import("drizzle-orm/relations").Relations<"StudentAssessment", {
    payments: import("drizzle-orm/relations").Many<"Payment">;
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", true>;
    user_createdById: import("drizzle-orm/relations").One<"User", false>;
    feeTemplate: import("drizzle-orm/relations").One<"FeeTemplate", false>;
    student: import("drizzle-orm/relations").One<"Student", true>;
    user_updatedById: import("drizzle-orm/relations").One<"User", false>;
    studentAssessmentLineItems: import("drizzle-orm/relations").Many<"StudentAssessmentLineItem">;
}>;
export declare const paymentReceiptAuditRelations: import("drizzle-orm/relations").Relations<"PaymentReceiptAudit", {
    user: import("drizzle-orm/relations").One<"User", false>;
    payment: import("drizzle-orm/relations").One<"Payment", true>;
}>;
export declare const sectionRelations: import("drizzle-orm/relations").Relations<"Section", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
    teacherClassAssignments: import("drizzle-orm/relations").Many<"TeacherClassAssignment">;
}>;
export declare const studentFeeRelations: import("drizzle-orm/relations").Relations<"StudentFee", {
    student: import("drizzle-orm/relations").One<"Student", true>;
}>;
export declare const studentAssessmentLineItemRelations: import("drizzle-orm/relations").Relations<"StudentAssessmentLineItem", {
    feeType: import("drizzle-orm/relations").One<"FeeType", true>;
    feeTemplateLineItem: import("drizzle-orm/relations").One<"FeeTemplateLineItem", false>;
    studentAssessment: import("drizzle-orm/relations").One<"StudentAssessment", true>;
}>;
export declare const studentSiblingRelations: import("drizzle-orm/relations").Relations<"StudentSibling", {
    student: import("drizzle-orm/relations").One<"Student", true>;
}>;
export declare const academicRecordRelations: import("drizzle-orm/relations").Relations<"AcademicRecord", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
    student: import("drizzle-orm/relations").One<"Student", false>;
}>;
export declare const chatConversationRelations: import("drizzle-orm/relations").Relations<"ChatConversation", {
    user: import("drizzle-orm/relations").One<"User", true>;
    chatMessages: import("drizzle-orm/relations").Many<"ChatMessage">;
}>;
export declare const chatMessageRelations: import("drizzle-orm/relations").Relations<"ChatMessage", {
    chatConversation: import("drizzle-orm/relations").One<"ChatConversation", true>;
    user: import("drizzle-orm/relations").One<"User", false>;
}>;
export declare const teacherAttendanceRecordRelations: import("drizzle-orm/relations").Relations<"TeacherAttendanceRecord", {
    user: import("drizzle-orm/relations").One<"User", true>;
}>;
export declare const teacherClassAssignmentRelations: import("drizzle-orm/relations").Relations<"TeacherClassAssignment", {
    user: import("drizzle-orm/relations").One<"User", true>;
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
    section: import("drizzle-orm/relations").One<"Section", false>;
}>;
export declare const teacherGradeRecordRelations: import("drizzle-orm/relations").Relations<"TeacherGradeRecord", {
    user: import("drizzle-orm/relations").One<"User", true>;
}>;
export declare const teacherResourceRelations: import("drizzle-orm/relations").Relations<"TeacherResource", {
    user: import("drizzle-orm/relations").One<"User", true>;
}>;
export declare const teacherLessonLogRelations: import("drizzle-orm/relations").Relations<"TeacherLessonLog", {
    user: import("drizzle-orm/relations").One<"User", true>;
}>;
export declare const teacherAnnouncementRelations: import("drizzle-orm/relations").Relations<"TeacherAnnouncement", {
    user: import("drizzle-orm/relations").One<"User", true>;
}>;
export declare const teacherDirectMessageRelations: import("drizzle-orm/relations").Relations<"TeacherDirectMessage", {
    user: import("drizzle-orm/relations").One<"User", true>;
}>;
export declare const teacherProfileRelations: import("drizzle-orm/relations").Relations<"TeacherProfile", {
    user: import("drizzle-orm/relations").One<"User", true>;
}>;
export declare const calendarEventRelations: import("drizzle-orm/relations").Relations<"CalendarEvent", {
    academicYear: import("drizzle-orm/relations").One<"AcademicYear", false>;
}>;
export declare const teacherScheduleEntryRelations: import("drizzle-orm/relations").Relations<"TeacherScheduleEntry", {
    user: import("drizzle-orm/relations").One<"User", true>;
}>;
export declare const studentCoreValuesRelations: import("drizzle-orm/relations").Relations<"StudentCoreValues", {
    student: import("drizzle-orm/relations").One<"Student", true>;
}>;
export declare const studentHealthProfileRelations: import("drizzle-orm/relations").Relations<"StudentHealthProfile", {
    student: import("drizzle-orm/relations").One<"Student", true>;
}>;
