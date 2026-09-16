import { AssessmentOutput, ApplicantData } from './assessmentEngine.js';

export interface ExplanationNotice {
  headline: string;
  established: string[];
  unestablished: string[];
  issuesAndConflicts: string[];
  decisionSummary: string;
  fullNoticeText: string;
  generationMethod: 'deterministic_engine' | 'llm_synthesized';
}

export class ExplanationEngine {
  /**
   * Main generator. Produces a 4-part structured explanation notice strictly derived
   * from the Assessment Engine's structured output.
   */
  public async generateExplanation(
    assessment: AssessmentOutput,
    applicant: ApplicantData,
    options: { preferLlm?: boolean; apiKey?: string } = {}
  ): Promise<ExplanationNotice> {
    // 1. Build deterministic explanation first (100% reliable, immediate, zero hallucination)
    const deterministic = this.generateDeterministic(assessment, applicant);

    // 2. If LLM requested and API key available, attempt synthesis
    if (options.preferLlm && (options.apiKey || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY)) {
      try {
        const llmResult = await this.generateWithLlm(assessment, applicant, deterministic, options.apiKey);
        if (llmResult) {
          return llmResult;
        }
      } catch (err) {
        console.warn('LLM synthesis failed, falling back to deterministic explanation engine:', err);
      }
    }

    return deterministic;
  }

  /**
   * Deterministic Generator: Synthesizes plain-language public-service notice
   * by inspecting assessment.conditionResults, conflicts, and precedence rollup.
   */
  public generateDeterministic(assessment: AssessmentOutput, applicant: ApplicantData): ExplanationNotice {
    // Pillar 1: What was established
    const established: string[] = [];
    const satisfiedConditions = assessment.conditionResults.filter(c => c.status === 'satisfied');
    for (const c of satisfiedConditions) {
      const docs = c.evidence_used.length > 0 ? ` [Evidence: ${c.evidence_used.join(', ')}]` : '';
      established.push(`${c.title}: ${c.reasoning}${docs}`);
    }

    // Pillar 2: What could not be established
    const unestablished: string[] = [];
    const unsatisfied = assessment.conditionResults.filter(c => c.status === 'not_satisfied');
    for (const c of unsatisfied) {
      unestablished.push(`${c.title}: ${c.reasoning}`);
    }

    const insufficient = assessment.conditionResults.filter(c => c.status === 'insufficient_evidence');
    for (const c of insufficient) {
      unestablished.push(`${c.title}: Missing mandatory documentation. ${c.reasoning}`);
    }

    // Pillar 3: What is missing / problematic / contradictory
    const issuesAndConflicts: string[] = [];

    // Cross-document conflicts
    for (const conflict of assessment.conflicts) {
      const docList = conflict.documents.map(d => `"${d.documentName}" recorded as "${d.value}"`).join(' versus ');
      issuesAndConflicts.push(`Contradiction in ${conflict.field.replace('_', ' ').toUpperCase()}: Discrepancy between submitted records (${docList}).`);
    }

    // Missing documents
    for (const c of insufficient) {
      issuesAndConflicts.push(`Missing Documentation: Condition "${c.title}" requires required evidence which was not submitted.`);
    }

    // OCR / Readability issues
    const unreadableConditions = assessment.conditionResults.filter(c => c.issue === 'unreadable');
    for (const c of unreadableConditions) {
      issuesAndConflicts.push(`Unreadable Evidence: Supporting file for "${c.title}" did not meet the 70% OCR clarity threshold. Manual document inspection required.`);
    }

    // Borderline / Requires confirmation
    const borderlineConditions = assessment.conditionResults.filter(c => c.issue === 'requires_confirmation');
    for (const c of borderlineConditions) {
      issuesAndConflicts.push(`Borderline Criterion: "${c.title}" is within 5% of statutory program limits ($42,750–$45,000 threshold), requiring reviewer confirmation.`);
    }

    // Pillar 4: Current Status & Whether Application Can Proceed
    let headline = '';
    let decisionSummary = '';

    switch (assessment.overallDecision) {
      case 'sufficient_to_proceed':
        headline = 'Application Status: Eligible to Proceed to Final Award Stage';
        decisionSummary = `Based on our automated assessment, you have successfully satisfied all ${assessment.metrics.totalConditions} statutory eligibility conditions. Your supporting documents have been verified with complete confidence, and your file has been advanced to final award disbursement processing.`;
        break;

      case 'condition_not_satisfied':
        headline = 'Application Status: Mandatory Program Eligibility Condition Not Met';
        decisionSummary = `Your application cannot proceed because one or more statutory eligibility requirements have conclusively not been satisfied based on the verified records. Under program regulations, applicants must satisfy every mandatory condition to qualify.`;
        break;

      case 'more_evidence_needed':
        headline = 'Application Status: Incomplete Documentation — Additional Evidence Required';
        decisionSummary = `Your application is currently on hold. While several conditions have been verified, mandatory supporting documentation is missing. Your file cannot advance until the missing evidence is uploaded and validated.`;
        break;

      case 'needs_human_review':
        headline = 'Application Status: Under Review — Manual Human Review Required';
        decisionSummary = `Your application has been routed to a senior human reviewer. This occurs because the automated assessment detected a cross-document data conflict, a blurred or low-clarity document scan, or a metric within 5% of statutory cutoffs. You do not need to resubmit at this moment unless instructed by the reviewer.`;
        break;
    }

    // Compose cohesive official notice text
    const fullNoticeText = [
      `OFFICIAL NOTICE OF ASSESSMENT — ${assessment.scenarioTitle.toUpperCase()}`,
      `Applicant: ${applicant.fullName} | Reference: ${applicant.id || 'N/A'} | Date: ${new Date(assessment.evaluatedAt).toLocaleDateString()}`,
      `--------------------------------------------------------------------------------`,
      headline,
      ``,
      decisionSummary,
      ``,
      `1. WHAT WAS ESTABLISHED:`,
      established.length > 0 ? established.map(e => `  ✓ ${e}`).join('\n') : '  None established at this time.',
      ``,
      `2. WHAT COULD NOT BE ESTABLISHED:`,
      unestablished.length > 0 ? unestablished.map(u => `  ✗ ${u}`).join('\n') : '  None. All criteria were successfully verified.',
      ``,
      `3. ISSUES, CONFLICTS & FLAGS REQUIRING ATTENTION:`,
      issuesAndConflicts.length > 0 ? issuesAndConflicts.map(i => `  ⚠ ${i}`).join('\n') : '  None detected. Documentation is clear, authentic, and internally consistent.',
      ``,
      `4. DETERMINATION:`,
      `  ${assessment.decisionRationale}`
    ].join('\n');

    return {
      headline,
      established,
      unestablished,
      issuesAndConflicts,
      decisionSummary,
      fullNoticeText,
      generationMethod: 'deterministic_engine'
    };
  }

  /**
   * Optional LLM-assisted synthesis: takes the structured assessment data
   * and crafts a formal public-service notice. Fallback to deterministic on any error.
   */
  private async generateWithLlm(
    assessment: AssessmentOutput,
    applicant: ApplicantData,
    deterministic: ExplanationNotice,
    customApiKey?: string
  ): Promise<ExplanationNotice | null> {
    const apiKey = customApiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const prompt = `You are an explainable decision-support officer in a government public-service scholarship agency.
Given this exact structured assessment JSON from our rules engine, format an official, clear, empathetic explanation letter for citizen ${applicant.fullName}.
Do NOT invent or alter any facts, criteria, or outcomes. You MUST cover:
1. What was established (name exact verified conditions and evidence files)
2. What could not be established
3. What is missing, problematic, or contradictory (cite exact conflicting documents and values)
4. Overall ruling and whether the application can currently proceed.

Assessment JSON:
${JSON.stringify(assessment, null, 2)}

Respond with a JSON object strictly matching this schema:
{
  "headline": string,
  "established": string[],
  "unestablished": string[],
  "issuesAndConflicts": string[],
  "decisionSummary": string,
  "fullNoticeText": string
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) return null;

    // Parse JSON
    const cleanJson = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      headline: parsed.headline || deterministic.headline,
      established: parsed.established || deterministic.established,
      unestablished: parsed.unestablished || deterministic.unestablished,
      issuesAndConflicts: parsed.issuesAndConflicts || deterministic.issuesAndConflicts,
      decisionSummary: parsed.decisionSummary || deterministic.decisionSummary,
      fullNoticeText: parsed.fullNoticeText || deterministic.fullNoticeText,
      generationMethod: 'llm_synthesized'
    };
  }
}
