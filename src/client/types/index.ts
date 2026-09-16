export type ConditionStatus = 'satisfied' | 'not_satisfied' | 'insufficient_evidence' | 'needs_review';
export type IssueType = 'missing' | 'unreadable' | 'contradictory' | 'requires_confirmation' | null;
export type OverallDecision = 'sufficient_to_proceed' | 'condition_not_satisfied' | 'more_evidence_needed' | 'needs_human_review';

export interface EvidenceRequirement {
  typeId: string;
  name: string;
  description: string;
  acceptedFormats: string[];
  mandatoryFields: string[];
}

export interface ScenarioCondition {
  id: string;
  code: string;
  title: string;
  category: 'legal' | 'academic' | 'financial' | 'procedural';
  description: string;
  requiredEvidenceTypes: string[];
  ruleDescription: string;
  thresholds?: Record<string, any>;
  explanationTemplates: {
    satisfied: string;
    not_satisfied: string;
    insufficient_evidence: string;
    needs_review: string;
  };
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  jurisdiction: string;
  programCycle: string;
  description: string;
  deadlineIso: string;
  evidenceTypes: EvidenceRequirement[];
  conditions: ScenarioCondition[];
}

export interface ApplicantData {
  id?: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  stateOfResidency: string;
  institutionName: string;
  enrolledCredits: number;
  reportedIncome: number;
  reportedGpa: number;
  hasDuplicateScholarship: boolean;
  duplicateScholarshipDetails?: string;
  submittedAt: string;
}

export interface SubmittedEvidence {
  id: string;
  typeId: string;
  fileName: string;
  fileSize?: string;
  ocrStatus: 'processed' | 'low_confidence' | 'unreadable';
  confidenceScore: number;
  extractedData: {
    fullName?: string;
    dateOfBirth?: string;
    state?: string;
    institutionName?: string;
    enrolledCredits?: number;
    term?: string;
    annualIncome?: number;
    monthlyIncome?: number;
    taxYear?: string;
    cumulativeGpa?: number;
    gradingScale?: string;
    hasDuplicateAward?: boolean;
    duplicateAwardDetails?: string;
    issuanceDate?: string;
  };
  uploadTimestamp: string;
}

export interface ConditionEvaluationResult {
  condition_id: string;
  code: string;
  title: string;
  category: string;
  status: ConditionStatus;
  evidence_used: string[];
  reasoning: string;
  issue: IssueType;
  metrics?: {
    thresholdValue?: any;
    actualValue?: any;
    discrepancyDelta?: any;
    confidenceScore?: number;
  };
}

export interface CrossDocumentConflict {
  field: string;
  documents: {
    documentName: string;
    documentType: string;
    value: any;
  }[];
  description: string;
  severity: 'high' | 'medium';
}

export interface AssessmentOutput {
  scenarioId: string;
  scenarioTitle: string;
  evaluatedAt: string;
  overallDecision: OverallDecision;
  overallSummary: string;
  conditionResults: ConditionEvaluationResult[];
  conflicts: CrossDocumentConflict[];
  metrics: {
    totalConditions: number;
    satisfiedCount: number;
    notSatisfiedCount: number;
    insufficientEvidenceCount: number;
    needsReviewCount: number;
  };
  decisionRationale: string;
}

export interface ExplanationNotice {
  headline: string;
  established: string[];
  unestablished: string[];
  issuesAndConflicts: string[];
  decisionSummary: string;
  fullNoticeText: string;
  generationMethod: 'deterministic_engine' | 'llm_synthesized';
  fallbackReason?: string;
}

export interface ActionStep {
  priority: number;
  type: string;
  title: string;
  description: string;
  conditionCode: string;
  conditionTitle: string;
  requiredEvidenceTypeId?: string;
  suggestedDocuments: string[];
  actionLabel: string;
  deadline?: string;
}

export interface NextStepPlan {
  primaryAction: ActionStep;
  secondaryActions: ActionStep[];
  totalActionsNeeded: number;
  guidanceNote: string;
  statusBadge: string;
}

export interface FullApplicationResponse {
  id: string;
  applicant: ApplicantData;
  evidence: SubmittedEvidence[];
  assessment: AssessmentOutput;
  explanation: ExplanationNotice;
  nextSteps: NextStepPlan;
  status: string;
  overallDecision: string;
  reviewerNotes: string | null;
  reviewerAction: string | null;
  reviewerActionTimestamp: string | null;
  createdAt: string;
  updatedAt: string;
  auditLogs?: {
    id: number;
    application_id: string;
    actor: string;
    action: string;
    details: string;
    timestamp: string;
  }[];
}

export interface PresetCase {
  label: string;
  expectedOutcome: string;
  applicant: ApplicantData;
  evidence: SubmittedEvidence[];
}
