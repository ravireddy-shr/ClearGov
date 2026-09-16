import { AssessmentOutput, ApplicantData } from './assessmentEngine.js';

export interface ActionStep {
  priority: number; // 1 = primary/most urgent
  type: 'upload_document' | 'resolve_conflict' | 'resubmit_unreadable' | 'clarify_borderline' | 'await_reviewer' | 'formal_advisory' | 'completed';
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

export class NextStepEngine {
  /**
   * Generates prioritized, highly concrete next actions directly derived
   * from the Assessment engine's structured findings.
   */
  public generateNextSteps(assessment: AssessmentOutput, applicant: ApplicantData): NextStepPlan {
    const actions: ActionStep[] = [];

    // 1. Check for Cross-Document Contradictions (Top priority if present)
    if (assessment.conflicts.length > 0) {
      for (const conflict of assessment.conflicts) {
        if (conflict.field === 'date_of_birth') {
          actions.push({
            priority: 1,
            type: 'resolve_conflict',
            title: 'Resolve Date of Birth Discrepancy',
            description: `Your State ID shows date of birth ${conflict.documents[0]?.value}, while your College Enrollment Letter indicates ${conflict.documents[1]?.value}. Please obtain an official Registrar correction letter or upload your official birth certificate to reconcile this discrepancy for Condition 1 (In-State Residency & Identity).`,
            conditionCode: 'COND-01',
            conditionTitle: 'In-State Residency & Legal Status',
            suggestedDocuments: ['Registrar Official Correction Letter', 'State Vital Records Birth Certificate'],
            actionLabel: 'Upload Identity Reconciliation Document'
          });
        } else if (conflict.field === 'annual_income') {
          actions.push({
            priority: 1,
            type: 'resolve_conflict',
            title: 'Reconcile Reported Income Discrepancy',
            description: `Your application stated annual income as ${conflict.documents[0]?.value}, but your submitted financial document indicates ${conflict.documents[1]?.value}. Please upload your signed IRS Form 1040 Tax Return with all W-2 schedules to substantiate your household income for Condition 3 (Income Eligibility).`,
            conditionCode: 'COND-03',
            conditionTitle: 'Household Income Eligibility Cap',
            suggestedDocuments: ['IRS Form 1040 Tax Return (Signed)', 'W-2 Wage Statements (All Employers)'],
            actionLabel: 'Upload Tax Return & Schedules'
          });
        } else if (conflict.field === 'cumulative_gpa') {
          actions.push({
            priority: 1,
            type: 'resolve_conflict',
            title: 'Reconcile Academic Record Discrepancy',
            description: `Self-reported GPA (${conflict.documents[0]?.value}) differs from the official transcript record (${conflict.documents[1]?.value}). Please confirm your most recent cumulative GPA with your university registrar for Condition 4 (Academic Merit).`,
            conditionCode: 'COND-04',
            conditionTitle: 'Minimum Academic Merit',
            suggestedDocuments: ['Certified Sealed University Transcript', 'Registrar GPA Certification'],
            actionLabel: 'Upload Updated Certified Transcript'
          });
        }
      }
    }

    // 2. Check for Unreadable / Low-Confidence Evidence
    const unreadableConditions = assessment.conditionResults.filter(c => c.issue === 'unreadable');
    for (const c of unreadableConditions) {
      actions.push({
        priority: 2,
        type: 'resubmit_unreadable',
        title: `Re-upload Clear Legible Copy for ${c.title}`,
        description: `The file submitted for ${c.title} (${c.evidence_used.join(', ')}) could not be read with sufficient optical confidence. Please upload a flat, high-resolution color scan or direct digital PDF exported from your student or banking portal.`,
        conditionCode: c.code,
        conditionTitle: c.title,
        suggestedDocuments: ['Direct Digital Vector PDF', '300 DPI Color Flatbed Scan'],
        actionLabel: 'Upload High-Resolution Replacement'
      });
    }

    // 3. Check for Borderline Income Verification
    const borderlineConditions = assessment.conditionResults.filter(c => c.issue === 'requires_confirmation');
    for (const c of borderlineConditions) {
      actions.push({
        priority: 3,
        type: 'clarify_borderline',
        title: 'Provide Income Verification Paystubs / Deduction Documentation',
        description: `Your verified household income of $${c.metrics?.actualValue?.toLocaleString()} is within 5% of the statutory $45,000 threshold. You may optionally submit proof of medical deductions, dependent allowances, or recent pay stubs to assist the reviewer in confirming statutory compliance.`,
        conditionCode: c.code,
        conditionTitle: c.title,
        suggestedDocuments: ['Most Recent 2 Consecutive Pay Stubs', 'Medical Expense Deduction Schedule', 'Dependent Verification'],
        actionLabel: 'Submit Supplemental Income Verification'
      });
    }

    // 4. Check for Missing Evidence (Insufficient Evidence)
    const missingConditions = assessment.conditionResults.filter(c => c.status === 'insufficient_evidence');
    for (const c of missingConditions) {
      let docName = 'Supporting Documentation';
      let docType = 'general_proof';
      let suggestions = ['Official PDF or Document Scan'];

      if (c.condition_id === 'income_threshold') {
        docName = 'IRS Form 1040 Tax Return or Certified Bank Statement';
        docType = 'income_proof';
        suggestions = ['IRS 1040 Federal Tax Return (Signed)', 'Certified 3-Month Bank Statements'];
      } else if (c.condition_id === 'academic_merit') {
        docName = 'Official Academic Transcript';
        docType = 'academic_transcript';
        suggestions = ['Official University Transcript with Registrar Seal', 'Electronic Parchment/Clearinghouse Transcript'];
      } else if (c.condition_id === 'enrollment_status') {
        docName = 'College Enrollment Verification Letter';
        docType = 'enrollment_verification';
        suggestions = ['Official Registrar Enrollment Certificate (Full-Time >= 12 Credits)'];
      } else if (c.condition_id === 'residency_citizenship') {
        docName = "State Driver's License or Real ID";
        docType = 'state_id_residency';
        suggestions = ["Valid State Driver's License", "State Non-Driver Real ID Card"];
      } else if (c.condition_id === 'non_duplication') {
        docName = 'Financial Aid & Scholarship Audit Form';
        docType = 'aid_declaration';
        suggestions = ['Signed Scholarship Declaration of Non-Duplication'];
      }

      actions.push({
        priority: 2, // High priority
        type: 'upload_document',
        title: `Upload Missing Document for ${c.title}`,
        description: `Please upload a ${docName}, clearly showing all required fields, as mandatory to verify Condition ${c.code} (${c.title}).`,
        conditionCode: c.code,
        conditionTitle: c.title,
        requiredEvidenceTypeId: docType,
        suggestedDocuments: suggestions,
        actionLabel: `Upload ${docName}`
      });
    }

    // 5. Check for Condition Not Satisfied (Statutory Disqualification)
    const unsatisfiedConditions = assessment.conditionResults.filter(c => c.status === 'not_satisfied');
    if (unsatisfiedConditions.length > 0 && actions.length === 0) {
      const primaryUnmet = unsatisfiedConditions[0];
      let advisoryMsg = '';
      if (primaryUnmet.condition_id === 'academic_merit') {
        advisoryMsg = `Your cumulative GPA (${primaryUnmet.metrics?.actualValue?.toFixed(2)}) is below the required 3.20. You may re-apply for the Spring 2027 cycle once current semester grades are posted, or request an Academic Progress Waiver if you experienced documented medical or personal emergencies.`;
      } else if (primaryUnmet.condition_id === 'income_threshold') {
        advisoryMsg = `Your household income ($${primaryUnmet.metrics?.actualValue?.toLocaleString()}) exceeds the program cap of $45,000. You may explore the State General Educational Opportunity Loan or submit an income adjustment appeal if your family recently experienced involuntary job loss.`;
      } else {
        advisoryMsg = `One or more eligibility criteria were not met. You may review program regulations or consult with a financial aid counselor regarding eligibility appeals.`;
      }

      actions.push({
        priority: 4,
        type: 'formal_advisory',
        title: `Review Appeal or Future Cycle Options for ${primaryUnmet.title}`,
        description: advisoryMsg,
        conditionCode: primaryUnmet.code,
        conditionTitle: primaryUnmet.title,
        suggestedDocuments: ['Formal Appeal for Extenuating Circumstances', 'Special Financial Circumstances Form'],
        actionLabel: 'View Appeal & Future Cycle Guidelines'
      });
    }

    // 6. If needs human review and no user action needed
    if (assessment.overallDecision === 'needs_human_review' && actions.length === 0) {
      actions.push({
        priority: 3,
        type: 'await_reviewer',
        title: 'Application is Under Formal Administrative Review',
        description: 'An assigned reviewer from the Scholarship Board is actively evaluating your file. No additional action is needed from you unless you receive a specific request from the reviewer.',
        conditionCode: 'ALL',
        conditionTitle: 'Administrative Review',
        suggestedDocuments: [],
        actionLabel: 'Check Application Status Later'
      });
    }

    // 7. If everything is satisfied
    if (assessment.overallDecision === 'sufficient_to_proceed') {
      actions.push({
        priority: 1,
        type: 'completed',
        title: 'Sign Electronic Scholarship Award Agreement',
        description: 'Your application has successfully satisfied all statutory criteria. Please monitor your registered email for your electronic DocuSign award package within 3-5 business days to confirm payment disbursement.',
        conditionCode: 'AWARD',
        conditionTitle: 'Final Disbursement',
        suggestedDocuments: ['Direct Deposit Authorization Form'],
        actionLabel: 'View Award Information'
      });
    }

    // Sort by priority ascending (1 is highest)
    actions.sort((a, b) => a.priority - b.priority);

    const primaryAction = actions[0];
    const secondaryActions = actions.slice(1);

    let guidanceNote = '';
    let statusBadge = '';

    switch (assessment.overallDecision) {
      case 'sufficient_to_proceed':
        guidanceNote = 'All required evidence has been validated. Proceeding to final stage.';
        statusBadge = 'Proceeding to Award';
        break;
      case 'more_evidence_needed':
        guidanceNote = `Immediate action required: Please submit the ${actions.length} missing document(s) before October 15, 2026.`;
        statusBadge = 'Documentation Incomplete';
        break;
      case 'needs_human_review':
        guidanceNote = 'Your file requires manual reviewer attention. Please follow the instructions below to resolve any flagged discrepancies.';
        statusBadge = 'Manual Review in Progress';
        break;
      case 'condition_not_satisfied':
        guidanceNote = 'Statutory criteria were not satisfied based on official documentation.';
        statusBadge = 'Statutory Criteria Unmet';
        break;
    }

    return {
      primaryAction,
      secondaryActions,
      totalActionsNeeded: actions.filter(a => a.type !== 'completed' && a.type !== 'await_reviewer').length,
      guidanceNote,
      statusBadge
    };
  }
}
