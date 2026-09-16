import { AssessmentEngine } from '../engine/assessmentEngine.js';
import { ExplanationEngine } from '../engine/explanationEngine.js';
import { NextStepEngine } from '../engine/nextStepEngine.js';
import { SCHOLARSHIP_SCENARIO } from '../engine/scenarioSchema.js';
import { SEED_APPLICATIONS } from '../db/seedData.js';

async function runVerification() {
  console.log('================================================================');
  console.log('       CLEARGOV RULES & ASSESSMENT ENGINE VERIFICATION          ');
  console.log('================================================================\n');

  const assessmentEngine = new AssessmentEngine();
  const explanationEngine = new ExplanationEngine();
  const nextStepEngine = new NextStepEngine();

  let passedAll = true;

  for (let i = 0; i < SEED_APPLICATIONS.length; i++) {
    const seed = SEED_APPLICATIONS[i];
    console.log(`[TEST CASE ${i + 1}] ${seed.label}`);
    console.log(`Applicant: ${seed.applicant.fullName} (${seed.applicant.id})`);

    const assessment = assessmentEngine.evaluate(seed.applicant, seed.evidence, SCHOLARSHIP_SCENARIO);
    const explanation = await explanationEngine.generateExplanation(assessment, seed.applicant);
    const nextSteps = nextStepEngine.generateNextSteps(assessment, seed.applicant);

    const actualOutcome = assessment.overallDecision;
    const isSuccess = actualOutcome === seed.expectedOutcome;

    if (!isSuccess) {
      passedAll = false;
      console.error(`  FAIL: Expected "${seed.expectedOutcome}" but got "${actualOutcome}"`);
    } else {
      console.log(`  PASS: Evaluated to "${actualOutcome}" as expected.`);
    }

    console.log(`  - Conditions Satisfied: ${assessment.metrics.satisfiedCount}/${assessment.metrics.totalConditions}`);
    console.log(`  - Conflicts Detected: ${assessment.conflicts.length}`);
    if (assessment.conflicts.length > 0) {
      assessment.conflicts.forEach(c => console.log(`    * [Conflict] ${c.description}`));
    }
    console.log(`  - Primary Next Step: "${nextSteps.primaryAction.title}" (Priority ${nextSteps.primaryAction.priority})`);
    console.log(`  - Explanation Headline: "${explanation.headline}"`);
    console.log(`  - Established: ${explanation.established.length} | Unestablished: ${explanation.unestablished.length} | Issues: ${explanation.issuesAndConflicts.length}`);
    console.log('----------------------------------------------------------------\n');
  }

  if (passedAll) {
    console.log('>>> ALL 6 SEED CASES PASSED RIGOROUS REASONING ENGINE ASSERTIONS! <<<\n');
  } else {
    console.error('>>> SOME TEST CASES FAILED. Please review the errors above. <<<\n');
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Verification script error:', err);
  process.exit(1);
});
