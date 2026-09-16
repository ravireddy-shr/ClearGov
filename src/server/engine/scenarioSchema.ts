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

export const SCHOLARSHIP_SCENARIO: ScenarioDefinition = {
  id: 'state_higher_ed_scholarship_2026',
  title: 'State Merit & Need-Based Higher Education Scholarship',
  jurisdiction: 'Department of Higher Education & Public Opportunity',
  programCycle: 'Academic Year 2026–2027',
  description: 'A comprehensive state scholarship providing up to $12,500 in tuition assistance for eligible in-state undergraduate scholars demonstrating academic excellence and verifiable economic need.',
  deadlineIso: '2026-10-15T23:59:59Z',
  evidenceTypes: [
    {
      typeId: 'state_id_residency',
      name: "Government ID / Proof of Residency",
      description: "State Driver's License, Real ID card, or State Residency Affidavit showing legal name, DOB, and state residency.",
      acceptedFormats: ['PDF', 'PNG', 'JPEG'],
      mandatoryFields: ['full_name', 'dob', 'state', 'document_id']
    },
    {
      typeId: 'enrollment_verification',
      name: "College Enrollment Verification",
      description: "Official Letter from Registrar or National Student Clearinghouse documenting full-time enrollment (>=12 credits).",
      acceptedFormats: ['PDF'],
      mandatoryFields: ['institution_name', 'enrolled_credits', 'term', 'student_name']
    },
    {
      typeId: 'income_proof',
      name: "Household Income Verification",
      description: "IRS 1040 Tax Return (Line 11 Adjusted Gross Income) or Certified 3-Month Bank Statements confirming household annual income.",
      acceptedFormats: ['PDF'],
      mandatoryFields: ['annual_income', 'tax_year', 'filing_status']
    },
    {
      typeId: 'academic_transcript',
      name: "Official Academic Transcript",
      description: "Official post-secondary or high school transcript with cumulative Grade Point Average (GPA).",
      acceptedFormats: ['PDF', 'PNG'],
      mandatoryFields: ['cumulative_gpa', 'grading_scale', 'institution_name']
    },
    {
      typeId: 'aid_declaration',
      name: "Financial Aid & Scholarship Audit Form",
      description: "Certified declaration verifying applicant is not receiving concurrent full tuition waivers.",
      acceptedFormats: ['PDF'],
      mandatoryFields: ['duplicate_award_status', 'reporting_year']
    }
  ],
  conditions: [
    {
      id: 'residency_citizenship',
      code: 'COND-01',
      title: 'In-State Residency & Legal Status',
      category: 'legal',
      description: 'Applicant must be a verifiable permanent resident or citizen residing in the state.',
      requiredEvidenceTypes: ['state_id_residency'],
      ruleDescription: 'Evidence must verify residency within the state jurisdiction and match applicant identity without expired validity.',
      explanationTemplates: {
        satisfied: 'Verified in-state residency via official government identification.',
        not_satisfied: 'Submitted documentation indicates residency outside the eligible state jurisdiction.',
        insufficient_evidence: 'Missing required Government ID or Proof of Residency.',
        needs_review: 'Identity or residency record contains discrepancies requiring manual verification.'
      }
    },
    {
      id: 'enrollment_status',
      code: 'COND-02',
      title: 'Full-Time Accredited Enrollment',
      category: 'academic',
      description: 'Applicant must be enrolled full-time (minimum 12 credits) at an accredited higher education institution for 2026–2027.',
      requiredEvidenceTypes: ['enrollment_verification'],
      thresholds: { minCredits: 12 },
      ruleDescription: 'Registrar document must confirm enrolled credits >= 12 for the active academic cycle at an accredited college.',
      explanationTemplates: {
        satisfied: 'Verified active full-time enrollment ({credits} credit units) at {institution}.',
        not_satisfied: 'Enrolled in only {credits} credits, which is below the mandatory full-time threshold of 12 credits.',
        insufficient_evidence: 'Missing official Enrollment Verification from the registrar.',
        needs_review: 'Enrollment verification data is ambiguous, conflicting, or unreadable.'
      }
    },
    {
      id: 'income_threshold',
      code: 'COND-03',
      title: 'Household Income Eligibility Cap',
      category: 'financial',
      description: 'Annual household gross income must not exceed $45,000. Values within 5% ($42,750 – $45,000) require human confirmation.',
      requiredEvidenceTypes: ['income_proof'],
      thresholds: {
        maxIncome: 45000,
        borderlineMargin: 0.05, // 5%
        borderlineThreshold: 42750
      },
      ruleDescription: 'Verified annual income must be <= $45,000. If between $42,750 and $45,000, flag for human verification.',
      explanationTemplates: {
        satisfied: 'Verified household income of ${income} is within the need-based cap of $45,000.',
        not_satisfied: 'Verified household income of ${income} exceeds the statutory limit of $45,000.',
        insufficient_evidence: 'Missing verified Tax Return (Form 1040) or Certified Bank Statement.',
        needs_review: 'Reported household income of ${income} is within 5% of the statutory cutoff ($42,750–$45,000) or figures conflict across documents.'
      }
    },
    {
      id: 'academic_merit',
      code: 'COND-04',
      title: 'Minimum Academic Merit (GPA ≥ 3.20)',
      category: 'academic',
      description: 'Applicant must demonstrate cumulative GPA of 3.20 or higher on a 4.0 grading scale.',
      requiredEvidenceTypes: ['academic_transcript'],
      thresholds: { minGpa: 3.20 },
      ruleDescription: 'Cumulative GPA on official transcript must be >= 3.20.',
      explanationTemplates: {
        satisfied: 'Verified cumulative GPA of {gpa} exceeds the 3.20 minimum academic standard.',
        not_satisfied: 'Verified cumulative GPA of {gpa} does not meet the mandatory 3.20 threshold.',
        insufficient_evidence: 'Missing official academic transcript.',
        needs_review: 'Transcript GPA is unreadable, blurred, or contradicts self-reported academic history.'
      }
    },
    {
      id: 'non_duplication',
      code: 'COND-05',
      title: 'Non-Duplication of Full Tuition Awards',
      category: 'financial',
      description: 'Applicant must not hold active concurrent full-tuition grants from another state or federal program.',
      requiredEvidenceTypes: ['aid_declaration'],
      ruleDescription: 'Aid audit must confirm zero duplicate state-funded comprehensive awards.',
      explanationTemplates: {
        satisfied: 'Confirmed applicant has no disqualifying duplicate full-tuition funding awards.',
        not_satisfied: 'Applicant is already receiving a duplicate full-tuition award ({duplicateAwardDetails}).',
        insufficient_evidence: 'Missing Financial Aid & Scholarship Audit Form.',
        needs_review: 'Pending institutional awards require reviewer clarification regarding duplicate coverage.'
      }
    },
    {
      id: 'deadline_compliance',
      code: 'COND-06',
      title: 'Timely Submission Prior to Deadline',
      category: 'procedural',
      description: 'Application and primary documentation must be submitted on or before October 15, 2026 (23:59:59 UTC).',
      requiredEvidenceTypes: [],
      ruleDescription: 'Submission timestamp <= 2026-10-15T23:59:59Z.',
      explanationTemplates: {
        satisfied: 'Application was submitted in compliance with the program cycle deadline.',
        not_satisfied: 'Application was submitted after the statutory program cutoff deadline.',
        insufficient_evidence: 'Submission timestamp could not be validated.',
        needs_review: 'Submission timestamp discrepancy requires procedural review.'
      }
    }
  ]
};
