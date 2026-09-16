import React, { useState } from 'react';
import { ExplanationNotice, OverallDecision } from '../types/index.js';
import { Check, Edit2, ArrowRight, Shield, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ExplanationCardProps {
  explanation: ExplanationNotice;
  overallDecision: OverallDecision;
  decisionRationale: string;
  applicantId?: string;
  onNavigateToReviewer?: (appId?: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNextStep: () => void;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  explanation,
  overallDecision,
  decisionRationale,
  applicantId,
  onNavigateToReviewer,
  isExpanded,
  onToggleExpand,
  onNextStep
}) => {
  const [showFullText, setShowFullText] = useState(false);

  // Dignified outcome header styling (Instruction 3 & 5)
  const getOutcomeDetails = () => {
    switch (overallDecision) {
      case 'sufficient_to_proceed':
        return {
          title: 'Evidence Is Sufficient — Application Approved to Proceed',
          badgeText: 'Sufficient to Proceed',
          badgeStyle: 'text-emerald-800 bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-600',
          desc: 'All statutory eligibility criteria have been independently validated with authentic supporting evidence. The application is eligible to advance to final award disbursement.'
        };
      case 'condition_not_satisfied':
        return {
          title: 'Statutory Eligibility Requirement Not Satisfied',
          badgeText: 'Condition Not Satisfied',
          badgeStyle: 'text-red-800 bg-red-50 border-red-200',
          dot: 'bg-red-600',
          desc: 'Based on official documentation, the application does not satisfy one or more mandatory statutory criteria required under program regulations.'
        };
      case 'more_evidence_needed':
        return {
          title: 'Additional Supporting Documentation Required',
          badgeText: 'More Evidence Needed',
          badgeStyle: 'text-amber-800 bg-amber-50 border-amber-200',
          dot: 'bg-amber-600',
          desc: 'The application is temporarily on hold because mandatory supporting documentation was not submitted. Once provided, evaluation will resume.'
        };
      case 'needs_human_review':
        return {
          title: 'Submission Flagged for Administrative Human Review',
          badgeText: 'Needs Human Review',
          badgeStyle: 'text-purple-800 bg-purple-50 border-purple-200',
          dot: 'bg-purple-600',
          desc: 'A cross-document contradiction, low optical clarity scan, or borderline metric requires discretionary human verification before proceeding.'
        };
    }
  };

  const outcome = getOutcomeDetails();

  // Collapsed View for finished step
  if (!isExpanded) {
    return (
      <div className="bg-white rounded-2xl p-5 mb-6 flex items-center justify-between shadow-sm transition hover:shadow-md">
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-full bg-dark-950 flex items-center justify-center text-lime-accent flex-shrink-0">
            <Check className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-dark-500 font-semibold">04 & 05</span>
              <h3 className="text-sm font-bold text-dark-950">
                Official Determination Notice: {outcome.badgeText}
              </h3>
            </div>
            <p className="text-xs text-dark-500 mt-0.5">
              {explanation.decisionSummary}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-dark-200 text-xs font-semibold text-dark-800 hover:bg-dark-50 transition"
        >
          <Edit2 className="w-3.5 h-3.5 text-dark-500" strokeWidth={1.75} />
          <span>Read Notice</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden mb-8 shadow-md">
      {/* Spacious, Reassuring Public Notice Header */}
      <div className="p-6 sm:p-8 border-b border-dark-100 bg-surface-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-dark-500">
              Stage 4 & 5 of 6
            </span>
            <span className="text-dark-300">•</span>
            <span className="text-xs text-dark-500">Official Determination Notice</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${outcome.badgeStyle}`}>
              <span className={`w-2 h-2 rounded-full ${outcome.dot}`} />
              <span>{outcome.badgeText}</span>
            </span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-dark-950 tracking-tight mb-2">
          {outcome.title}
        </h2>

        <p className="text-sm text-dark-600 leading-relaxed max-w-3xl">
          {outcome.desc}
        </p>

        {/* Link to Reviewer Portal if flagged */}
        {overallDecision === 'needs_human_review' && onNavigateToReviewer && (
          <div className="mt-5 p-5 rounded-2xl bg-dark-50 border border-dark-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-dark-950">
                <Shield className="w-4 h-4 text-purple-700" strokeWidth={2} />
                <span>Pending Human Administrative Review</span>
              </div>
              <p className="text-xs text-dark-600 leading-relaxed">
                This case has been routed to the administrative queue. You can inspect the conflicting records and execute a resolution directly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToReviewer(applicantId)}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-sm"
            >
              <span>Open in Reviewer Queue</span>
              <ArrowRight className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* The 4 Pillars of Explanation — Un-nested, Spacious Layout */}
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Pillar 1: Established Facts */}
        <div>
          <div className="pb-2 mb-3 border-b border-dark-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500">
              1. What Was Established ({explanation.established.length} Conditions Confirmed)
            </h3>
          </div>

          {explanation.established.length === 0 ? (
            <p className="text-xs text-dark-500 italic">No conditions confirmed at this time.</p>
          ) : (
            <ul className="space-y-2.5 text-sm text-dark-700 leading-relaxed">
              {explanation.established.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <span className="text-emerald-700 font-bold text-base leading-none">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pillar 2: Unestablished Criteria */}
        {explanation.unestablished.length > 0 && (
          <div>
            <div className="pb-2 mb-3 border-b border-dark-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500">
                2. What Could Not Be Established ({explanation.unestablished.length} Unmet / Unverified)
              </h3>
            </div>

            <ul className="space-y-2.5 text-sm text-dark-700 leading-relaxed">
              {explanation.unestablished.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <span className="text-red-700 font-bold text-base leading-none">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pillar 3: Issues, Conflicts & Discrepancies */}
        {explanation.issuesAndConflicts.length > 0 && (
          <div>
            <div className="pb-2 mb-3 border-b border-dark-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500">
                3. Issues, Conflicts & Flags Requiring Review ({explanation.issuesAndConflicts.length} Detected)
              </h3>
            </div>

            <ul className="space-y-2.5 text-sm text-dark-800 leading-relaxed">
              {explanation.issuesAndConflicts.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                  <span className="text-purple-700 font-bold text-xs leading-5">⚠</span>
                  <span className="font-semibold text-xs leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pillar 4: Procedural Determination */}
        <div>
          <div className="pb-2 mb-3 border-b border-dark-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500">
              4. Procedural Determination & Statutory Rationale
            </h3>
          </div>

          <p className="text-sm text-dark-800 leading-relaxed mb-3">
            {explanation.decisionSummary}
          </p>

          <div className="p-4 rounded-xl bg-surface-50 border border-dark-100 text-xs font-mono text-dark-600 leading-relaxed">
            Statutory Finding: {decisionRationale}
          </div>
        </div>

        {/* Formally Emitted Plain Text Toggle */}
        <div className="pt-4 border-t border-dark-100">
          <button
            type="button"
            onClick={() => setShowFullText(!showFullText)}
            className="inline-flex items-center space-x-1.5 text-xs text-dark-500 hover:text-dark-900 font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-dark-400" strokeWidth={1.75} />
            <span>{showFullText ? 'Hide Section 508 Legal Text' : 'View Section 508 Plain Text Notice'}</span>
            {showFullText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showFullText && (
            <div className="mt-3 p-5 rounded-2xl bg-dark-950 text-dark-100 font-mono text-xs leading-relaxed overflow-x-auto">
              <pre className="whitespace-pre-wrap">{explanation.fullNoticeText}</pre>
            </div>
          )}
        </div>

        {/* Footer Actions: Confident Lime Accent Primary Button */}
        <div className="pt-8 border-t border-dark-100 flex justify-end">
          <button
            type="button"
            onClick={onNextStep}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-2xl text-xs font-bold transition shadow-sm"
          >
            <span>Proceed to Step 6: Citizen Next Actions</span>
            <ArrowRight className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
};
