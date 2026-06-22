import { DrizzleService } from '../drizzle/drizzle.service';
type ToolIntent = 'learner_record' | 'billing_assessment' | 'student_masterlist';
interface AiToolUser {
    userId?: string;
    email?: string;
    role?: string;
}
interface AiToolContext {
    intent: ToolIntent;
    content: string;
    directResponse?: string;
}
export declare class AiToolContextService {
    private readonly drizzle;
    constructor(drizzle: DrizzleService);
    resolve(user: AiToolUser, messages: Array<{
        role: string;
        content: string;
    }>): Promise<AiToolContext | null>;
    detectIntent(message: string): ToolIntent | null;
    private detectRoleFallbackIntent;
    private isInstructionalQuestion;
    private looksLikeBareLearnerLookup;
    private allowedRolesForIntent;
    extractLearnerName(message: string, intent: ToolIntent): string;
    extractMasterlistGrade(message: string): string | undefined;
    private extractLooseLookupName;
    private renderAccessDeniedResponse;
    private findLearners;
    private buildLearnerRecordContext;
    private buildBillingContext;
    private buildStudentMasterlistContext;
    private renderLearnerRecordResponse;
    private renderBillingAssessmentResponse;
    private renderKeyValueTable;
    private renderMarkdownTable;
    private tableCell;
    private formatValue;
    private formatDate;
    private formatMoney;
    private fullName;
    private parseToolCommand;
    private isExactLearnerMatch;
    private renderNoLearnerResponse;
    private renderLearnerChoices;
    private learnerMatchScore;
    private normalizeSearch;
    private levenshtein;
    private escapeHtml;
}
export {};
