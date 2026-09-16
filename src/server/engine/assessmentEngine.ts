import {
  SCHOLARSHIP_SCENARIO,
  ScenarioCondition,
  ConditionStatus,
  IssueType,
  OverallDecision
} from './scenarioSchema.js';

export interface ApplicantData {
  id?: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  email: string;
  stateOfResidency: string;
  institutionName: string;
  enrolledCredits: number;
  reportedIncome: number;
  reportedGpa: number;
  hasDuplicateScholarship: boolean;
  duplicateScholarshipDetails?: string;
  submittedAt: string; // ISO
}

export interface SubmittedEvidence {
  id: string;
  typeId: string; // matches EvidenceRequirement.typeId
  fileName: string;
  fileSize?: string;
  ocrStatus: 'processed' | 'low_confidence' | 'unreadable';
  confidenceScore: number; // 0.0 - 1.0
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

export class AssessmentEngine {
  /**
   * Main assessment entry point. Evaluates all conditions, checks cross-document consistency,
   * detects low-confidence OCR, and computes the overall rollup decision.
   */
  public evaluate(
    applicant: ApplicantData,
    evidenceList: SubmittedEvidence[],
    customScenario = SCHOLARSHIP_SCENARIO
  ): AssessmentOutput {
    // 1. Detect Cross-Document Conflicts first
    const detectedConflicts = this.detectCrossDocumentConflicts(applicant, evidenceList);

    // 2. Evaluate each scenario condition independently
    const conditionResults: ConditionEvaluationResult[] = customScenario.conditions.map(condition => {
      return this.evaluateCondition(condition, applicant, evidenceList, detectedConflicts, customScenario);
    });

    // 3. Calculate summary counters
    const satisfiedCount = conditionResults.filter(c => c.status === 'satisfied').length;
    const notSatisfiedCount = conditionResults.filter(c => c.status === 'not_satisfied').length;
    const insufficientCount = conditionResults.filter(c => c.status === 'insufficient_evidence').length;
    const needsReviewCount = conditionResults.filter(c => c.status === 'needs_review').length;

    // 4. Determine overall decision via strict precedence logic
    let overallDecision: OverallDecision = 'sufficient_to_proceed';
    let decisionRationale = '';

    if (needsReviewCount > 0 || detectedConflicts.length > 0) {
      // PRECEDENCE 1: Any contradiction, unreadable document, or borderline flag requires human review
      overallDecision = 'needs_human_review';
      const reviewReasons = conditionResults
        .filter(c => c.status === 'needs_review')
        .map(c => `${c.title} (${c.issue || 'flagged'})`);
      
      const conflictMsg = detectedConflicts.length > 0 
        ? `${detectedConflicts.length} cross-document contradiction(s) detected` 
        : '';
      const parts = [...reviewReasons, conflictMsg].filter(Boolean);
      decisionRationale = `Application flagged for administrative human review: ${parts.join('; ')}.`;
    } else if (notSatisfiedCount > 0) {
      // PRECEDENCE 2: Conclusive statutory failure (e.g. GPA < 3.20 or Income > $45k)
      overallDecision = 'condition_not_satisfied';
      const failedConditions = conditionResults
        .filter(c => c.status === 'not_satisfied')
        .map(c => c.title);
      decisionRationale = `Applicant does not satisfy mandatory statutory requirements: ${failedConditions.join(', ')}.`;
    } else if (insufficientCount > 0) {
      // PRECEDENCE 3: Missing evidence
      overallDecision = 'more_evidence_needed';
      const missingConditions = conditionResults
        .filter(c => c.status === 'insufficient_evidence')
        .map(c => c.title);
      decisionRationale = `Mandatory supporting documentation is incomplete for: ${missingConditions.join(', ')}.`;
    } else {
      // PRECEDENCE 4: All criteria verified and satisfied
      overallDecision = 'sufficient_to_proceed';
      decisionRationale = 'All statutory eligibility criteria verified with sufficient, authentic supporting evidence. Application approved to proceed.';
    }

    const overallSummary = this.buildSummaryHeader(overallDecision, satisfiedCount, conditionResults.length);

    return {
      scenarioId: customScenario.id,
      scenarioTitle: customScenario.title,
      evaluatedAt: new Date().toISOString(),
      overallDecision,
      overallSummary,
      conditionResults,
      conflicts: detectedConflicts,
      metrics: {
        totalConditions: conditionResults.length,
        satisfiedCount,
        notSatisfiedCount,
        insufficientEvidenceCount: insufficientCount,
        needsReviewCount
      },
      decisionRationale
    };
  }

  /**
   * Cross-Document Consistency Check.
   * Compares data points across multiple documents and against self-reported profile data.
   */
  public detectCrossDocumentConflicts(
    applicant: ApplicantData,
    evidenceList: SubmittedEvidence[]
  ): CrossDocumentConflict[] {
    const conflicts: CrossDocumentConflict[] = [];

    // Check 1: Date of Birth cross-check across Government ID, Enrollment Letter, and Profile
    const idDoc = evidenceList.find(e => e.typeId === 'state_id_residency');
    const enrollDoc = evidenceList.find(e => e.typeId === 'enrollment_verification');

    if (idDoc?.extractedData.dateOfBirth && enrollDoc?.extractedData.dateOfBirth) {
      const idDob = idDoc.extractedData.dateOfBirth.trim();
      const enrollDob = enrollDoc.extractedData.dateOfBirth.trim();

      if (idDob !== enrollDob) {
        conflicts.push({
          field: 'date_of_birth',
          severity: 'high',
          description: `Date of Birth discrepancy between Government ID (${idDob}) and College Enrollment Verification (${enrollDob}).`,
          documents: [
            { documentName: idDoc.fileName, documentType: 'state_id_residency', value: idDob },
            { documentName: enrollDoc.fileName, documentType: 'enrollment_verification', value: enrollDob }
          ]
        });
      }
    }

    // Check 2: Income Cross-Check (Reported vs Document Extracted)
    const incomeDoc = evidenceList.find(e => e.typeId === 'income_proof');
    if (incomeDoc?.extractedData.annualIncome !== undefined && applicant.reportedIncome !== undefined) {
      const diff = Math.abs(incomeDoc.extractedData.annualIncome - applicant.reportedIncome);
      // Flag if discrepancy is greater than 20% or more than $6,000 difference
      if (diff > 6000 && diff / (applicant.reportedIncome || 1) > 0.20) {
        conflicts.push({
          field: 'annual_income',
          severity: 'high',
          description: `Declared annual income ($${applicant.reportedIncome.toLocaleString()}) conflicts with verified tax document ($${incomeDoc.extractedData.annualIncome.toLocaleString()}).`,
          documents: [
            { documentName: 'Applicant Application Form', documentType: 'self_reported', value: `$${applicant.reportedIncome.toLocaleString()}` },
            { documentName: incomeDoc.fileName, documentType: 'income_proof', value: `$${incomeDoc.extractedData.annualIncome.toLocaleString()}` }
          ]
        });
      }
    }

    // Check 3: Academic GPA Cross-Check (Self-reported vs Official Transcript)
    const transcriptDoc = evidenceList.find(e => e.typeId === 'academic_transcript');
    if (transcriptDoc?.extractedData.cumulativeGpa !== undefined && applicant.reportedGpa !== undefined) {
      const delta = Math.abs(transcriptDoc.extractedData.cumulativeGpa - applicant.reportedGpa);
      if (delta >= 0.30) {
        conflicts.push({
          field: 'cumulative_gpa',
          severity: 'medium',
          description: `Self-reported GPA (${applicant.reportedGpa.toFixed(2)}) deviates significantly from official transcript (${transcriptDoc.extractedData.cumulativeGpa.toFixed(2)}).`,
          documents: [
            { documentName: 'Applicant Form', documentType: 'self_reported', value: applicant.reportedGpa.toFixed(2) },
            { documentName: transcriptDoc.fileName, documentType: 'academic_transcript', value: transcriptDoc.extractedData.cumulativeGpa.toFixed(2) }
          ]
        });
      }
    }

    return conflicts;
  }

  /**
   * Evaluates an individual scenario condition.
   */
  private evaluateCondition(
    condition: ScenarioCondition,
    applicant: ApplicantData,
    evidenceList: SubmittedEvidence[],
    conflicts: CrossDocumentConflict[],
    scenario: typeof SCHOLARSHIP_SCENARIO
  ): ConditionEvaluationResult {
    // 1. Check if condition is impacted by a detected cross-document conflict
    if (condition.id === 'residency_citizenship' && conflicts.some(c => c.field === 'date_of_birth')) {
      const conflict = conflicts.find(c => c.field === 'date_of_birth')!;
      const matchingEvidence = evidenceList.filter(e => condition.requiredEvidenceTypes.includes(e.typeId));
      return {
        condition_id: condition.id,
        code: condition.code,
        title: condition.title,
        category: condition.category,
        status: 'needs_review',
        evidence_used: matchingEvidence.map(e => e.fileName),
        reasoning: `Contradiction detected: ${conflict.description}`,
        issue: 'contradictory',
        metrics: {
          actualValue: conflict.documents.map(d => `${d.documentName}: ${d.value}`).join(' vs ')
        }
      };
    }

    if (condition.id === 'academic_merit' && conflicts.some(c => c.field === 'cumulative_gpa')) {
      const conflict = conflicts.find(c => c.field === 'cumulative_gpa')!;
      const transcriptDoc = evidenceList.find(e => e.typeId === 'academic_transcript');
      return {
        condition_id: condition.id,
        code: condition.code,
        title: condition.title,
        category: condition.category,
        status: 'needs_review',
        evidence_used: transcriptDoc ? [transcriptDoc.fileName] : [],
        reasoning: `Contradiction detected: ${conflict.description}`,
        issue: 'contradictory',
        metrics: {
          actualValue: conflict.documents.map(d => `${d.documentName}: ${d.value}`).join(' vs ')
        }
      };
    }

    if (condition.id === 'income_threshold' && conflicts.some(c => c.field === 'annual_income')) {
      const conflict = conflicts.find(c => c.field === 'annual_income')!;
      const incomeDoc = evidenceList.find(e => e.typeId === 'income_proof');
      return {
        condition_id: condition.id,
        code: condition.code,
        title: condition.title,
        category: condition.category,
        status: 'needs_review',
        evidence_used: incomeDoc ? [incomeDoc.fileName] : [],
        reasoning: `Contradiction detected: ${conflict.description}`,
        issue: 'contradictory',
        metrics: {
          actualValue: conflict.documents.map(d => `${d.documentName}: ${d.value}`).join(' vs ')
        }
      };
    }

    // 2. Identify required evidence for this condition
    const requiredTypes = condition.requiredEvidenceTypes;
    
    // Procedural conditions with no uploaded evidence (like deadline compliance)
    if (requiredTypes.length === 0) {
      if (condition.id === 'deadline_compliance') {
        const subDate = new Date(applicant.submittedAt || new Date().toISOString());
        const deadlineDate = new Date(scenario.deadlineIso);
        const isBeforeDeadline = subDate.getTime() <= deadlineDate.getTime();
        return {
          condition_id: condition.id,
          code: condition.code,
          title: condition.title,
          category: condition.category,
          status: isBeforeDeadline ? 'satisfied' : 'not_satisfied',
          evidence_used: ['System Submission Timestamp'],
          reasoning: isBeforeDeadline
            ? `Application submitted on ${subDate.toLocaleDateString()} at ${subDate.toLocaleTimeString()} UTC, satisfying the ${deadlineDate.toLocaleDateString()} cutoff.`
            : `Application submitted on ${subDate.toLocaleDateString()}, which is after the cutoff deadline (${deadlineDate.toLocaleDateString()}).`,
          issue: null,
          metrics: {
            thresholdValue: scenario.deadlineIso,
            actualValue: applicant.submittedAt
          }
        };
      }
    }

    // Check if required evidence is missing
    const matchingEvidence = evidenceList.filter(e => requiredTypes.includes(e.typeId));
    if (matchingEvidence.length === 0) {
      return {
        condition_id: condition.id,
        code: condition.code,
        title: condition.title,
        category: condition.category,
        status: 'insufficient_evidence',
        evidence_used: [],
        reasoning: `Missing required evidence: ${condition.title} requires submission of ${requiredTypes.join(', ')}.`,
        issue: 'missing'
      };
    }

    // Check if any matching evidence has unreadable / low confidence OCR
    const unreadableDoc = matchingEvidence.find(e => e.ocrStatus === 'low_confidence' || e.ocrStatus === 'unreadable' || e.confidenceScore < 0.70);
    if (unreadableDoc) {
      return {
        condition_id: condition.id,
        code: condition.code,
        title: condition.title,
        category: condition.category,
        status: 'needs_review',
        evidence_used: [unreadableDoc.fileName],
        reasoning: `Evidence file "${unreadableDoc.fileName}" has low OCR readability (confidence ${(unreadableDoc.confidenceScore * 100).toFixed(0)}% < 70% threshold). Manual document inspection required.`,
        issue: 'unreadable',
        metrics: {
          confidenceScore: unreadableDoc.confidenceScore
        }
      };
    }

    // 3. Condition-Specific Evaluation Rules
    switch (condition.id) {
      case 'residency_citizenship': {
        const idDoc = matchingEvidence[0];
        const state = idDoc.extractedData.state || applicant.stateOfResidency;
        const validStates = ['CA', 'California', 'ST', 'State'];
        const isResident = validStates.includes(state);

        if (isResident) {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'satisfied',
            evidence_used: [idDoc.fileName],
            reasoning: `State ID/residency record confirms legal residency in state (${state}). Document verified without discrepancies.`,
            issue: null,
            metrics: { actualValue: state, thresholdValue: 'Resident in State' }
          };
        } else {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'not_satisfied',
            evidence_used: [idDoc.fileName],
            reasoning: `Documentation indicates residency in "${state}". Applicant does not satisfy the in-state residency requirement.`,
            issue: null,
            metrics: { actualValue: state, thresholdValue: 'Resident in State' }
          };
        }
      }

      case 'enrollment_status': {
        const enrollDoc = matchingEvidence[0];
        const credits = enrollDoc.extractedData.enrolledCredits ?? applicant.enrolledCredits;
        const institution = enrollDoc.extractedData.institutionName || applicant.institutionName;
        const minCredits = condition.thresholds?.minCredits ?? 12;

        if (credits >= minCredits) {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'satisfied',
            evidence_used: [enrollDoc.fileName],
            reasoning: `Official enrollment letter from ${institution} verifies active full-time enrollment in ${credits} credit hours (minimum required: ${minCredits}).`,
            issue: null,
            metrics: { actualValue: credits, thresholdValue: minCredits }
          };
        } else {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'not_satisfied',
            evidence_used: [enrollDoc.fileName],
            reasoning: `Enrollment document shows ${credits} credit units, which is below the statutory full-time requirement of ${minCredits} credits.`,
            issue: null,
            metrics: { actualValue: credits, thresholdValue: minCredits }
          };
        }
      }

      case 'income_threshold': {
        const incomeDoc = matchingEvidence[0];
        const verifiedIncome = incomeDoc.extractedData.annualIncome ?? applicant.reportedIncome;
        const maxIncome = condition.thresholds?.maxIncome ?? 45000;
        const borderlineThreshold = condition.thresholds?.borderlineThreshold ?? 42750; // within 5%

        if (verifiedIncome > maxIncome) {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'not_satisfied',
            evidence_used: [incomeDoc.fileName],
            reasoning: `Verified household income of $${verifiedIncome.toLocaleString()} exceeds the statutory program maximum limit of $${maxIncome.toLocaleString()}.`,
            issue: null,
            metrics: { actualValue: verifiedIncome, thresholdValue: maxIncome }
          };
        } else if (verifiedIncome >= borderlineThreshold) {
          // BORDERLINE CASE: within 5% of threshold
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'needs_review',
            evidence_used: [incomeDoc.fileName],
            reasoning: `Verified household income of $${verifiedIncome.toLocaleString()} is within 5% of the statutory cap ($${borderlineThreshold.toLocaleString()}–$${maxIncome.toLocaleString()}). Requires human reviewer verification of deductions.`,
            issue: 'requires_confirmation',
            metrics: {
              actualValue: verifiedIncome,
              thresholdValue: maxIncome,
              discrepancyDelta: maxIncome - verifiedIncome
            }
          };
        } else {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'satisfied',
            evidence_used: [incomeDoc.fileName],
            reasoning: `Verified household income of $${verifiedIncome.toLocaleString()} is below the statutory limit of $${maxIncome.toLocaleString()}.`,
            issue: null,
            metrics: { actualValue: verifiedIncome, thresholdValue: maxIncome }
          };
        }
      }

      case 'academic_merit': {
        const transcriptDoc = matchingEvidence[0];
        const verifiedGpa = transcriptDoc.extractedData.cumulativeGpa ?? applicant.reportedGpa;
        const minGpa = condition.thresholds?.minGpa ?? 3.20;

        if (verifiedGpa >= minGpa) {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'satisfied',
            evidence_used: [transcriptDoc.fileName],
            reasoning: `Transcript confirms cumulative GPA of ${verifiedGpa.toFixed(2)}, which meets and exceeds the academic requirement of ${minGpa.toFixed(2)}.`,
            issue: null,
            metrics: { actualValue: verifiedGpa, thresholdValue: minGpa }
          };
        } else {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'not_satisfied',
            evidence_used: [transcriptDoc.fileName],
            reasoning: `Transcript cumulative GPA of ${verifiedGpa.toFixed(2)} does not meet the mandatory minimum threshold of ${minGpa.toFixed(2)}.`,
            issue: null,
            metrics: { actualValue: verifiedGpa, thresholdValue: minGpa }
          };
        }
      }

      case 'non_duplication': {
        const aidDoc = matchingEvidence[0];
        const hasDuplicate = aidDoc.extractedData.hasDuplicateAward ?? applicant.hasDuplicateScholarship;
        const details = aidDoc.extractedData.duplicateAwardDetails || applicant.duplicateScholarshipDetails || 'Duplicate Full State Tuition Grant';

        if (!hasDuplicate) {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'satisfied',
            evidence_used: [aidDoc.fileName],
            reasoning: 'Financial aid declaration confirms applicant has no active concurrent state/comprehensive tuition grants.',
            issue: null,
            metrics: { actualValue: 'No duplicate funding' }
          };
        } else {
          return {
            condition_id: condition.id,
            code: condition.code,
            title: condition.title,
            category: condition.category,
            status: 'not_satisfied',
            evidence_used: [aidDoc.fileName],
            reasoning: `Audit form indicates applicant holds an active full duplicate grant: "${details}". Double-funding is prohibited by administrative code.`,
            issue: null,
            metrics: { actualValue: details }
          };
        }
      }

      default:
        return {
          condition_id: condition.id,
          code: condition.code,
          title: condition.title,
          category: condition.category,
          status: 'satisfied',
          evidence_used: matchingEvidence.map(e => e.fileName),
          reasoning: 'Condition verified.',
          issue: null
        };
    }
  }

  private buildSummaryHeader(decision: OverallDecision, satisfied: number, total: number): string {
    switch (decision) {
      case 'sufficient_to_proceed':
        return `Eligible to Proceed (${satisfied}/${total} conditions verified). All requirements satisfied.`;
      case 'condition_not_satisfied':
        return `Statutory Condition Unmet (${satisfied}/${total} satisfied). Conclusive non-satisfaction of eligibility criteria.`;
      case 'more_evidence_needed':
        return `Incomplete Evidence (${satisfied}/${total} verified). Required documentation missing.`;
      case 'needs_human_review':
        return `Manual Administrative Review Required. Cross-document discrepancy, borderline value, or unreadable evidence detected.`;
    }
  }
}
