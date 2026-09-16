import React, { useState } from 'react';
import { Layers, CheckCircle2, Shield, FileText, Cpu, Scale, ArrowRight, Code, ChevronDown, ChevronUp } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [showCodeDetails, setShowCodeDetails] = useState<Record<number, boolean>>({});

  const toggleCode = (step: number) => {
    setShowCodeDetails(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const chainLinks = [
    {
      step: 1,
      name: "Link 1: Applicant Information Intake",
      summary: "Captures the citizen's claimed identity, legal residency, enrolled college, self-reported income, and cumulative GPA.",
      exampleHeadline: "Real Example (Sophia Ramos — Case CG-2026-005):",
      exampleDescription: "The intake form records Sophia's identity (DOB 2002-09-19, CA resident), enrolled at Bay Area Community College (12 units), reporting $44,200 annual household income and a 3.65 cumulative GPA.",
      fileLocation: "src/server/engine/assessmentEngine.ts (interface ApplicantData)",
      uiComponent: "src/client/components/ApplicantForm.tsx",
      icon: CheckCircle2
    },
    {
      step: 2,
      name: "Link 2: Evidence Intake & Extraction",
      summary: "Ingests supporting documents (Gov ID, Transcript, IRS Form 1040, Registrar verification), extracts structured fields, and scores optical readability.",
      exampleHeadline: "Real Example (Marcus Chen vs Liam O'Connor):",
      exampleDescription: "For Marcus Chen, the system detects that IRS Form 1040 is missing from the upload bundle. For Liam O'Connor, the transcript was photographed with a camera at low clarity (42% optical clarity), triggering an optical unreadability flag.",
      fileLocation: "src/server/engine/assessmentEngine.ts (interface SubmittedEvidence)",
      uiComponent: "src/client/components/EvidenceManager.tsx",
      icon: FileText
    },
    {
      step: 3,
      name: "Link 3: Assessment Engine (Rules & Conflicts)",
      summary: "Evaluates each statutory condition independently, compares documents against each other to catch contradictions, and inspects borderline margins.",
      exampleHeadline: "Real Example (Aaliyah Patel vs Sophia Ramos):",
      exampleDescription: "For Aaliyah Patel, the cross-document check detects that her State ID says DOB 1999-05-12 while her Registrar letter says 2003-11-04 (flagged as contradiction). For Sophia Ramos, her verified $44,200 income is compared to the $45,000 cap; because it falls within the 5% margin ($42,750–$45,000), it is flagged for human confirmation.",
      fileLocation: "src/server/engine/assessmentEngine.ts (AssessmentEngine.evaluate() & detectCrossDocumentConflicts())",
      uiComponent: "src/client/components/AssessmentViewer.tsx",
      icon: Cpu
    },
    {
      step: 4,
      name: "Link 4: Explanation Layer (4 Pillars)",
      summary: "Translates the raw rule assessment into a four-pillared public notice: what was established, what could not be established, detected issues, and proceeding impact.",
      exampleHeadline: "Real Example (Generated Citizen Notice for Devon Miller):",
      exampleDescription: "Devon's notice explicitly states: 1. Established (In-state residency, full-time enrollment verified). 2. Unestablished (Minimum Academic Merit: verified GPA 2.65 is below the mandatory 3.20 cutoff). 3. Issues (None detected). 4. Determination (Mandatory criteria unmet; cannot proceed).",
      fileLocation: "src/server/engine/explanationEngine.ts (ExplanationEngine.generateExplanation())",
      uiComponent: "src/client/components/ExplanationCard.tsx",
      icon: Scale
    },
    {
      step: 5,
      name: "Link 5: Decision Rollup & Precedence",
      summary: "Applies strict hierarchical precedence to synthesize a single conclusive application state and stores it in the persistent database with an audit log.",
      exampleHeadline: "Real Example (Precedence in Action):",
      exampleDescription: "Even though Sophia Ramos satisfies 5 out of 6 conditions, the single borderline income flag triggers Precedence 1 ('Needs Human Review'), routing her file to the Reviewer Portal rather than granting premature approval.",
      fileLocation: "src/server/engine/assessmentEngine.ts (Precedence Rollup) & src/server/db/database.ts",
      uiComponent: "src/client/components/ExplanationCard.tsx & ReviewerPortal.tsx",
      icon: Shield
    },
    {
      step: 6,
      name: "Link 6: Prioritized Next Action Guidance",
      summary: "Extracts concrete, prioritized tasks with exact document names and requirements so the citizen knows precisely what to do next.",
      exampleHeadline: "Real Example (Action Guidance for Marcus Chen):",
      exampleDescription: "Rather than a vague 'please provide more info', Marcus receives a Priority 1 instruction: 'Upload IRS Form 1040 Tax Return or Certified Bank Statement showing household gross income to verify Condition COND-03 (Household Income Cap)'.",
      fileLocation: "src/server/engine/nextStepEngine.ts (NextStepEngine.generateNextSteps())",
      uiComponent: "src/client/components/NextActionsCard.tsx",
      icon: ArrowRight
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dark-500">
            System Specifications
          </span>
          <span className="text-dark-300">•</span>
          <span className="text-xs text-dark-500">Architecture & Rules Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-dark-950 tracking-tight">
          How ClearGov Thinks: The 6-Link Decision Chain
        </h2>
        <p className="text-sm text-dark-600 mt-2 leading-relaxed">
          ClearGov replaces black-box verdicts with an inspectable reasoning pipeline. Below, see how each link processes real citizen cases, along with the strict precedence hierarchy governing decisions.
        </p>
      </div>

      {/* 6 Links Pipeline Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500 px-1">
          Reasoning Chain Steps (In Plain Language)
        </h3>

        {chainLinks.map((link) => {
          const Icon = link.icon;
          const isCodeOpen = !!showCodeDetails[link.step];

          return (
            <div
              key={link.step}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-md transition hover:shadow-lg"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-dark-950 flex items-center justify-center text-lime-accent flex-shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-bold text-dark-950">{link.name}</h4>
                    <span className="text-xs font-mono font-bold text-dark-400">
                      Step 0{link.step}
                    </span>
                  </div>
                  <p className="text-xs text-dark-600 mt-1 leading-relaxed">
                    {link.summary}
                  </p>
                </div>
              </div>

              {/* Plain Language Real-World Example Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-50 border border-dark-100 text-xs text-dark-800 mb-3 space-y-1">
                <span className="font-bold text-dark-950 block text-xs">
                  {link.exampleHeadline}
                </span>
                <p className="text-dark-600 text-xs leading-relaxed">
                  {link.exampleDescription}
                </p>
              </div>

              {/* Technical Code Reference Toggle */}
              <div className="pt-3 border-t border-dark-100">
                <button
                  type="button"
                  onClick={() => toggleCode(link.step)}
                  className="inline-flex items-center space-x-1.5 text-xs text-dark-500 hover:text-dark-900 font-semibold transition"
                >
                  <Code className="w-3.5 h-3.5 text-dark-400" strokeWidth={1.75} />
                  <span>{isCodeOpen ? 'Hide Technical Reference' : 'Show Technical Code Reference (For Reviewers)'}</span>
                  {isCodeOpen ? <ChevronUp className="w-3 h-3" strokeWidth={1.75} /> : <ChevronDown className="w-3 h-3" strokeWidth={1.75} />}
                </button>

                {isCodeOpen && (
                  <div className="w-full mt-3 p-4 rounded-2xl bg-dark-950 text-dark-100 font-mono text-xs space-y-2">
                    <div>
                      <span className="text-dark-400 uppercase text-[9px] font-bold block">Engine Rules Implementation:</span>
                      <span className="text-lime-accent">{link.fileLocation}</span>
                    </div>
                    <div>
                      <span className="text-dark-400 uppercase text-[9px] font-bold block">User Interface Component:</span>
                      <span className="text-emerald-300">{link.uiComponent}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Precedence Rollup Hierarchy with Unified, Restrained Outcome Colors */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500 mb-1">
            Statutory Decision Rollup
          </h3>
          <h4 className="text-lg font-bold text-dark-950 tracking-tight">
            Hierarchical Precedence Hierarchy
          </h4>
          <p className="text-xs text-dark-500 mt-1 leading-relaxed">
            ClearGov determines overall status through strict hierarchical precedence. A single unresolved conflict or borderline value overrides all other passing conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Precedence 1 */}
          <div className="p-5 rounded-2xl bg-surface-50 border border-dark-100 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span className="text-[11px] font-bold text-purple-800">
                  Precedence 1 (Highest)
                </span>
              </div>
              <span className="font-bold text-dark-950 block text-xs">Needs Human Review</span>
              <p className="text-xs text-dark-600 leading-relaxed">
                Triggered if <em>any</em> contradiction is detected, OCR confidence &lt; 70%, or income is within 5% of statutory cutoff.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-purple-700 block font-bold">
              → Queued for Reviewer
            </span>
          </div>

          {/* Precedence 2 */}
          <div className="p-5 rounded-2xl bg-surface-50 border border-dark-100 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span className="text-[11px] font-bold text-red-800">
                  Precedence 2
                </span>
              </div>
              <span className="font-bold text-dark-950 block text-xs">Condition Not Satisfied</span>
              <p className="text-xs text-dark-600 leading-relaxed">
                Triggered if evidence is authentic but conclusively violates statutory criteria (e.g., GPA &lt; 3.20 or income exceeds limit).
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-red-700 block font-bold">
              → Statutory Disqualification
            </span>
          </div>

          {/* Precedence 3 */}
          <div className="p-5 rounded-2xl bg-surface-50 border border-dark-100 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span className="text-[11px] font-bold text-amber-800">
                  Precedence 3
                </span>
              </div>
              <span className="font-bold text-dark-950 block text-xs">More Evidence Needed</span>
              <p className="text-xs text-dark-600 leading-relaxed">
                Triggered when mandatory documentation is absent from the submission, placing the file on temporary hold.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-amber-700 block font-bold">
              → Missing Evidence
            </span>
          </div>

          {/* Precedence 4 */}
          <div className="p-5 rounded-2xl bg-surface-50 border border-dark-100 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-800">
                  Precedence 4 (Base)
                </span>
              </div>
              <span className="font-bold text-dark-950 block text-xs">Sufficient to Proceed</span>
              <p className="text-xs text-dark-600 leading-relaxed">
                Triggered exclusively when 100% of statutory conditions evaluate to satisfied with authentic, validated evidence.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-emerald-700 block font-bold">
              → Final Disbursement
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
