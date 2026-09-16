import { dbInstance, StoredApplication } from '../db/database.js';
import { AssessmentEngine, ApplicantData, SubmittedEvidence, AssessmentOutput } from '../engine/assessmentEngine.js';
import { ExplanationEngine, ExplanationNotice } from '../engine/explanationEngine.js';
import { NextStepEngine, NextStepPlan } from '../engine/nextStepEngine.js';
import { SCHOLARSHIP_SCENARIO, ScenarioDefinition } from '../engine/scenarioSchema.js';

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
}

export class ApplicationService {
  private assessmentEngine = new AssessmentEngine();
  private explanationEngine = new ExplanationEngine();
  private nextStepEngine = new NextStepEngine();

  public getScenario(): ScenarioDefinition {
    return SCHOLARSHIP_SCENARIO;
  }

  public async evaluateLive(
    applicant: ApplicantData,
    evidenceList: SubmittedEvidence[],
    options: { preferLlm?: boolean; apiKey?: string } = {}
  ): Promise<{
    assessment: AssessmentOutput;
    explanation: ExplanationNotice;
    nextSteps: NextStepPlan;
  }> {
    const assessment = this.assessmentEngine.evaluate(applicant, evidenceList, SCHOLARSHIP_SCENARIO);
    const explanation = await this.explanationEngine.generateExplanation(assessment, applicant, options);
    const nextSteps = this.nextStepEngine.generateNextSteps(assessment, applicant);

    return { assessment, explanation, nextSteps };
  }

  public async submitApplication(
    applicant: ApplicantData,
    evidenceList: SubmittedEvidence[],
    options: { preferLlm?: boolean; apiKey?: string } = {}
  ): Promise<FullApplicationResponse> {
    const appId = applicant.id || `CG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    applicant.id = appId;
    if (!applicant.submittedAt) {
      applicant.submittedAt = new Date().toISOString();
    }

    const { assessment, explanation, nextSteps } = await this.evaluateLive(applicant, evidenceList, options);

    let initialStatus = 'submitted';
    switch (assessment.overallDecision) {
      case 'sufficient_to_proceed':
        initialStatus = 'proceeding';
        break;
      case 'more_evidence_needed':
        initialStatus = 'needs_more_info';
        break;
      case 'needs_human_review':
        initialStatus = 'needs_review';
        break;
      case 'condition_not_satisfied':
        initialStatus = 'rejected';
        break;
    }

    const now = new Date().toISOString();
    const storedApp: StoredApplication = {
      id: appId,
      applicant_name: applicant.fullName,
      applicant_email: applicant.email,
      scenario_id: SCHOLARSHIP_SCENARIO.id,
      status: initialStatus,
      overall_decision: assessment.overallDecision,
      applicant_data_json: JSON.stringify(applicant),
      evidence_list_json: JSON.stringify(evidenceList),
      assessment_json: JSON.stringify(assessment),
      explanation_json: JSON.stringify(explanation),
      next_steps_json: JSON.stringify(nextSteps),
      reviewer_notes: null,
      reviewer_action: null,
      reviewer_action_timestamp: null,
      created_at: applicant.submittedAt || now,
      updated_at: now
    };

    dbInstance.saveApplication(storedApp);
    dbInstance.addAuditLog(
      appId,
      'applicant',
      'APPLICATION_SUBMITTED',
      `Application submitted by citizen ${applicant.fullName}. Automated decision: ${assessment.overallDecision}`
    );

    return this.mapStoredToFull(storedApp);
  }

  public getApplication(id: string): FullApplicationResponse | null {
    const stored = dbInstance.getApplication(id);
    if (!stored) return null;
    return this.mapStoredToFull(stored);
  }

  public listApplications(filterStatus?: string): FullApplicationResponse[] {
    const rawList = filterStatus 
      ? dbInstance.getApplicationsByStatus(filterStatus)
      : dbInstance.getAllApplications();
    return rawList.map(item => this.mapStoredToFull(item));
  }

  public mapStoredToFull(stored: StoredApplication): FullApplicationResponse {
    return {
      id: stored.id,
      applicant: JSON.parse(stored.applicant_data_json),
      evidence: JSON.parse(stored.evidence_list_json),
      assessment: JSON.parse(stored.assessment_json),
      explanation: JSON.parse(stored.explanation_json),
      nextSteps: JSON.parse(stored.next_steps_json),
      status: stored.status,
      overallDecision: stored.overall_decision,
      reviewerNotes: stored.reviewer_notes,
      reviewerAction: stored.reviewer_action,
      reviewerActionTimestamp: stored.reviewer_action_timestamp,
      createdAt: stored.created_at,
      updatedAt: stored.updated_at
    };
  }
}

export const applicationService = new ApplicationService();
