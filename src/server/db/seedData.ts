import { ClearGovDatabase, StoredApplication } from './database.js';
import { AssessmentEngine, ApplicantData, SubmittedEvidence } from '../engine/assessmentEngine.js';
import { ExplanationEngine } from '../engine/explanationEngine.js';
import { NextStepEngine } from '../engine/nextStepEngine.js';
import { SCHOLARSHIP_SCENARIO } from '../engine/scenarioSchema.js';

export interface SeedProfile {
  applicant: ApplicantData;
  evidence: SubmittedEvidence[];
  label: string;
  expectedOutcome: string;
}

export const SEED_APPLICATIONS: SeedProfile[] = [
  // 1. CLEAN PASS CASE -> sufficient_to_proceed
  {
    label: "Case 1: Clean Pass (All Criteria Verified)",
    expectedOutcome: "sufficient_to_proceed",
    applicant: {
      id: "CG-2026-001",
      fullName: "Elena Vance",
      dateOfBirth: "2002-04-18",
      email: "elena.vance@student.stateu.edu",
      stateOfResidency: "CA",
      institutionName: "State University of Technology",
      enrolledCredits: 15,
      reportedIncome: 28500,
      reportedGpa: 3.82,
      hasDuplicateScholarship: false,
      submittedAt: "2026-09-02T14:22:10Z"
    },
    evidence: [
      {
        id: "ev-001-id",
        typeId: "state_id_residency",
        fileName: "Vance_Elena_State_Driver_License.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.98,
        extractedData: {
          fullName: "Elena Vance",
          dateOfBirth: "2002-04-18",
          state: "CA",
          issuanceDate: "2021-06-15"
        },
        uploadTimestamp: "2026-09-02T14:15:00Z"
      },
      {
        id: "ev-001-enroll",
        typeId: "enrollment_verification",
        fileName: "StateTech_Official_Enrollment_Letter.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.97,
        extractedData: {
          institutionName: "State University of Technology",
          enrolledCredits: 15,
          term: "Fall 2026",
          studentName: "Elena Vance",
          dateOfBirth: "2002-04-18"
        },
        uploadTimestamp: "2026-09-02T14:16:30Z"
      },
      {
        id: "ev-001-tax",
        typeId: "income_proof",
        fileName: "Form_1040_Tax_Return_2025_Signed.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.95,
        extractedData: {
          annualIncome: 28500,
          taxYear: "2025",
          filingStatus: "Single"
        },
        uploadTimestamp: "2026-09-02T14:18:00Z"
      },
      {
        id: "ev-001-trans",
        typeId: "academic_transcript",
        fileName: "Vance_Elena_Official_Transcript.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.96,
        extractedData: {
          cumulativeGpa: 3.82,
          gradingScale: "4.0",
          institutionName: "State University of Technology"
        },
        uploadTimestamp: "2026-09-02T14:19:15Z"
      },
      {
        id: "ev-001-aid",
        typeId: "aid_declaration",
        fileName: "Financial_Aid_Declaration_Signed.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.99,
        extractedData: {
          hasDuplicateAward: false
        },
        uploadTimestamp: "2026-09-02T14:20:00Z"
      }
    ]
  },

  // 2. MISSING EVIDENCE CASE -> more_evidence_needed
  {
    label: "Case 2: Missing Evidence (Omitted Tax/Income Proof)",
    expectedOutcome: "more_evidence_needed",
    applicant: {
      id: "CG-2026-002",
      fullName: "Marcus Chen",
      dateOfBirth: "2003-08-11",
      email: "marcus.chen@campus.edu",
      stateOfResidency: "CA",
      institutionName: "Pacific Coast University",
      enrolledCredits: 14,
      reportedIncome: 22000,
      reportedGpa: 3.55,
      hasDuplicateScholarship: false,
      submittedAt: "2026-09-05T11:05:40Z"
    },
    evidence: [
      {
        id: "ev-002-id",
        typeId: "state_id_residency",
        fileName: "Chen_Marcus_RealID.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.96,
        extractedData: {
          fullName: "Marcus Chen",
          dateOfBirth: "2003-08-11",
          state: "CA"
        },
        uploadTimestamp: "2026-09-05T10:50:00Z"
      },
      {
        id: "ev-002-enroll",
        typeId: "enrollment_verification",
        fileName: "Registrar_Verification_Fall2026.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.94,
        extractedData: {
          institutionName: "Pacific Coast University",
          enrolledCredits: 14,
          term: "Fall 2026",
          studentName: "Marcus Chen",
          dateOfBirth: "2003-08-11"
        },
        uploadTimestamp: "2026-09-05T10:52:00Z"
      },
      // INTENTIONALLY OMITTED: income_proof
      {
        id: "ev-002-trans",
        typeId: "academic_transcript",
        fileName: "Official_Academic_Record_Chen.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.95,
        extractedData: {
          cumulativeGpa: 3.55,
          gradingScale: "4.0",
          institutionName: "Pacific Coast University"
        },
        uploadTimestamp: "2026-09-05T10:55:00Z"
      },
      {
        id: "ev-002-aid",
        typeId: "aid_declaration",
        fileName: "Aid_NonDuplication_Affidavit.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.98,
        extractedData: {
          hasDuplicateAward: false
        },
        uploadTimestamp: "2026-09-05T10:58:00Z"
      }
    ]
  },

  // 3. CONTRADICTORY EVIDENCE CASE -> needs_human_review
  {
    label: "Case 3: Contradictory Evidence (DOB & Income Mismatch)",
    expectedOutcome: "needs_human_review",
    applicant: {
      id: "CG-2026-003",
      fullName: "Aaliyah Patel",
      dateOfBirth: "1999-05-12",
      email: "aaliyah.patel@metro.edu",
      stateOfResidency: "CA",
      institutionName: "Metropolitan State College",
      enrolledCredits: 16,
      reportedIncome: 24000,
      reportedGpa: 3.40,
      hasDuplicateScholarship: false,
      submittedAt: "2026-09-08T09:14:22Z"
    },
    evidence: [
      {
        id: "ev-003-id",
        typeId: "state_id_residency",
        fileName: "Patel_Aaliyah_Driver_License.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.97,
        extractedData: {
          fullName: "Aaliyah Patel",
          dateOfBirth: "1999-05-12", // CONFLICT WITH ENROLLMENT
          state: "CA"
        },
        uploadTimestamp: "2026-09-08T09:02:00Z"
      },
      {
        id: "ev-003-enroll",
        typeId: "enrollment_verification",
        fileName: "Registrar_Enrollment_Confirmation.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.95,
        extractedData: {
          institutionName: "Metropolitan State College",
          enrolledCredits: 16,
          term: "Fall 2026",
          studentName: "Aaliyah Patel",
          dateOfBirth: "2003-11-04" // CONFLICT: 2003 vs 1999 on ID!
        },
        uploadTimestamp: "2026-09-08T09:05:00Z"
      },
      {
        id: "ev-003-tax",
        typeId: "income_proof",
        fileName: "IRS_Tax_Transcript_2025.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.93,
        extractedData: {
          annualIncome: 34500, // Discrepancy from 24000 reported
          taxYear: "2025"
        },
        uploadTimestamp: "2026-09-08T09:07:00Z"
      },
      {
        id: "ev-003-trans",
        typeId: "academic_transcript",
        fileName: "Metro_Official_Transcript.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.96,
        extractedData: {
          cumulativeGpa: 3.40,
          gradingScale: "4.0",
          institutionName: "Metropolitan State College"
        },
        uploadTimestamp: "2026-09-08T09:09:00Z"
      },
      {
        id: "ev-003-aid",
        typeId: "aid_declaration",
        fileName: "Audit_Declaration_Signed.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.98,
        extractedData: {
          hasDuplicateAward: false
        },
        uploadTimestamp: "2026-09-08T09:11:00Z"
      }
    ]
  },

  // 4. STATUTORY CONDITION NOT SATISFIED -> condition_not_satisfied (GPA < 3.20)
  {
    label: "Case 4: Disqualified Criteria (GPA 2.65 below 3.20 cutoff)",
    expectedOutcome: "condition_not_satisfied",
    applicant: {
      id: "CG-2026-004",
      fullName: "Devon Miller",
      dateOfBirth: "2001-12-03",
      email: "devon.miller@statepoly.edu",
      stateOfResidency: "CA",
      institutionName: "State Polytechnic University",
      enrolledCredits: 13,
      reportedIncome: 31000,
      reportedGpa: 2.65,
      hasDuplicateScholarship: false,
      submittedAt: "2026-09-10T16:30:00Z"
    },
    evidence: [
      {
        id: "ev-004-id",
        typeId: "state_id_residency",
        fileName: "Miller_Devon_State_ID.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.98,
        extractedData: {
          fullName: "Devon Miller",
          dateOfBirth: "2001-12-03",
          state: "CA"
        },
        uploadTimestamp: "2026-09-10T16:15:00Z"
      },
      {
        id: "ev-004-enroll",
        typeId: "enrollment_verification",
        fileName: "StatePoly_Enrollment_Verification.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.96,
        extractedData: {
          institutionName: "State Polytechnic University",
          enrolledCredits: 13,
          term: "Fall 2026",
          studentName: "Devon Miller",
          dateOfBirth: "2001-12-03"
        },
        uploadTimestamp: "2026-09-10T16:17:00Z"
      },
      {
        id: "ev-004-tax",
        typeId: "income_proof",
        fileName: "Miller_2025_Tax_Return.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.95,
        extractedData: {
          annualIncome: 31000,
          taxYear: "2025"
        },
        uploadTimestamp: "2026-09-10T16:20:00Z"
      },
      {
        id: "ev-004-trans",
        typeId: "academic_transcript",
        fileName: "Official_Transcript_StatePoly.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.97,
        extractedData: {
          cumulativeGpa: 2.65, // STATUTORY FAILURE: 2.65 < 3.20 minimum
          gradingScale: "4.0",
          institutionName: "State Polytechnic University"
        },
        uploadTimestamp: "2026-09-10T16:22:00Z"
      },
      {
        id: "ev-004-aid",
        typeId: "aid_declaration",
        fileName: "Aid_Declaration_Certified.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.99,
        extractedData: {
          hasDuplicateAward: false
        },
        uploadTimestamp: "2026-09-10T16:24:00Z"
      }
    ]
  },

  // 5. BORDERLINE INCOME CASE -> needs_human_review (requires confirmation)
  {
    label: "Case 5: Borderline Income ($44,200 within 5% of $45k cap)",
    expectedOutcome: "needs_human_review",
    applicant: {
      id: "CG-2026-005",
      fullName: "Sophia Ramos",
      dateOfBirth: "2002-09-19",
      email: "sophia.ramos@baycollege.edu",
      stateOfResidency: "CA",
      institutionName: "Bay Area Community College",
      enrolledCredits: 12,
      reportedIncome: 44200,
      reportedGpa: 3.65,
      hasDuplicateScholarship: false,
      submittedAt: "2026-09-12T13:45:00Z"
    },
    evidence: [
      {
        id: "ev-005-id",
        typeId: "state_id_residency",
        fileName: "Ramos_Sophia_RealID.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.98,
        extractedData: {
          fullName: "Sophia Ramos",
          dateOfBirth: "2002-09-19",
          state: "CA"
        },
        uploadTimestamp: "2026-09-12T13:30:00Z"
      },
      {
        id: "ev-005-enroll",
        typeId: "enrollment_verification",
        fileName: "Registrar_FullTime_Cert.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.96,
        extractedData: {
          institutionName: "Bay Area Community College",
          enrolledCredits: 12,
          term: "Fall 2026",
          studentName: "Sophia Ramos",
          dateOfBirth: "2002-09-19"
        },
        uploadTimestamp: "2026-09-12T13:32:00Z"
      },
      {
        id: "ev-005-tax",
        typeId: "income_proof",
        fileName: "Ramos_W2_and_Form1040.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.94,
        extractedData: {
          annualIncome: 44200, // BORDERLINE: $42,750 - $45,000 range
          taxYear: "2025"
        },
        uploadTimestamp: "2026-09-12T13:35:00Z"
      },
      {
        id: "ev-005-trans",
        typeId: "academic_transcript",
        fileName: "Official_Transcript_BACC.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.97,
        extractedData: {
          cumulativeGpa: 3.65,
          gradingScale: "4.0",
          institutionName: "Bay Area Community College"
        },
        uploadTimestamp: "2026-09-12T13:38:00Z"
      },
      {
        id: "ev-005-aid",
        typeId: "aid_declaration",
        fileName: "Aid_Declaration_SophiaRamos.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.98,
        extractedData: {
          hasDuplicateAward: false
        },
        uploadTimestamp: "2026-09-12T13:40:00Z"
      }
    ]
  },

  // 6. UNREADABLE / LOW CONFIDENCE OCR -> needs_human_review (unreadable)
  {
    label: "Case 6: Unreadable Evidence (Blurred Scan OCR 42%)",
    expectedOutcome: "needs_human_review",
    applicant: {
      id: "CG-2026-006",
      fullName: "Liam O'Connor",
      dateOfBirth: "2003-01-25",
      email: "liam.oconnor@valleyuni.edu",
      stateOfResidency: "CA",
      institutionName: "Central Valley University",
      enrolledCredits: 15,
      reportedIncome: 26000,
      reportedGpa: 3.45,
      hasDuplicateScholarship: false,
      submittedAt: "2026-09-14T10:10:00Z"
    },
    evidence: [
      {
        id: "ev-006-id",
        typeId: "state_id_residency",
        fileName: "OConnor_StateID.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.98,
        extractedData: {
          fullName: "Liam O'Connor",
          dateOfBirth: "2003-01-25",
          state: "CA"
        },
        uploadTimestamp: "2026-09-14T10:00:00Z"
      },
      {
        id: "ev-006-enroll",
        typeId: "enrollment_verification",
        fileName: "CVU_Enrollment_Proof.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.95,
        extractedData: {
          institutionName: "Central Valley University",
          enrolledCredits: 15,
          term: "Fall 2026",
          studentName: "Liam O'Connor",
          dateOfBirth: "2003-01-25"
        },
        uploadTimestamp: "2026-09-14T10:02:00Z"
      },
      {
        id: "ev-006-tax",
        typeId: "income_proof",
        fileName: "Income_Bank_Statements_3Mo.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.93,
        extractedData: {
          annualIncome: 26000,
          taxYear: "2025"
        },
        uploadTimestamp: "2026-09-14T10:05:00Z"
      },
      {
        id: "ev-006-trans",
        typeId: "academic_transcript",
        fileName: "Mobile_Photo_Transcript_Blurred.jpg",
        ocrStatus: "low_confidence", // UNREADABLE SCAN: 0.42 confidence
        confidenceScore: 0.42,
        extractedData: {
          cumulativeGpa: 3.45,
          institutionName: "Central Valley University"
        },
        uploadTimestamp: "2026-09-14T10:07:00Z"
      },
      {
        id: "ev-006-aid",
        typeId: "aid_declaration",
        fileName: "Aid_Declaration_LiamOConnor.pdf",
        ocrStatus: "processed",
        confidenceScore: 0.97,
        extractedData: {
          hasDuplicateAward: false
        },
        uploadTimestamp: "2026-09-14T10:09:00Z"
      }
    ]
  }
];

export async function seedDatabase(db: ClearGovDatabase) {
  const assessmentEngine = new AssessmentEngine();
  const explanationEngine = new ExplanationEngine();
  const nextStepEngine = new NextStepEngine();

  for (const seed of SEED_APPLICATIONS) {
    const assessment = assessmentEngine.evaluate(seed.applicant, seed.evidence, SCHOLARSHIP_SCENARIO);
    const explanation = await explanationEngine.generateExplanation(assessment, seed.applicant);
    const nextSteps = nextStepEngine.generateNextSteps(assessment, seed.applicant);

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

    const storedApp: StoredApplication = {
      id: seed.applicant.id || `CG-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      applicant_name: seed.applicant.fullName,
      applicant_email: seed.applicant.email,
      scenario_id: SCHOLARSHIP_SCENARIO.id,
      status: initialStatus,
      overall_decision: assessment.overallDecision,
      applicant_data_json: JSON.stringify(seed.applicant),
      evidence_list_json: JSON.stringify(seed.evidence),
      assessment_json: JSON.stringify(assessment),
      explanation_json: JSON.stringify(explanation),
      next_steps_json: JSON.stringify(nextSteps),
      reviewer_notes: null,
      reviewer_action: null,
      reviewer_action_timestamp: null,
      created_at: seed.applicant.submittedAt,
      updated_at: seed.applicant.submittedAt
    };

    db.saveApplication(storedApp);
    db.addAuditLog(
      storedApp.id,
      'system',
      'INTAKE_AND_ASSESSMENT',
      `Application intake completed. Assessment evaluated status: "${assessment.overallDecision}". Rationale: ${assessment.decisionRationale}`
    );
  }

  console.log(`Database seeded with ${SEED_APPLICATIONS.length} diverse test cases.`);
}
