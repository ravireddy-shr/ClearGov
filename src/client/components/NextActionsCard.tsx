import React from 'react';
import { NextStepPlan, ActionStep } from '../types/index.js';
import { ArrowRight, Check, Edit2, Upload, FileText } from 'lucide-react';

interface NextActionsCardProps {
  nextSteps: NextStepPlan;
  onTriggerAction?: (action: ActionStep) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCommitAndReview?: () => void;
  onNavigateToReviewer?: () => void;
  isSubmitting?: boolean;
}

export const NextActionsCard: React.FC<NextActionsCardProps> = ({
  nextSteps,
  onTriggerAction,
  isExpanded,
  onToggleExpand,
  onCommitAndReview,
  onNavigateToReviewer,
  isSubmitting = false
}) => {
  const primary = nextSteps.primaryAction;
  const secondary = nextSteps.secondaryActions;

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
              <span className="font-mono text-xs text-dark-500 font-semibold">06</span>
              <h3 className="text-sm font-bold text-dark-950">
                Next Steps: {primary?.title || 'Guidance Prepared'}
              </h3>
            </div>
            <p className="text-xs text-dark-500 mt-0.5">
              {nextSteps.guidanceNote}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-dark-200 text-xs font-semibold text-dark-800 hover:bg-dark-50 transition"
        >
          <Edit2 className="w-3.5 h-3.5 text-dark-500" strokeWidth={1.75} />
          <span>Review Actions</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden mb-8 shadow-md">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-dark-100 bg-surface-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-dark-500">
              Stage 6 of 6
            </span>
            <span className="text-dark-300">•</span>
            <span className="text-xs text-dark-500">Actionable Citizen Guidance</span>
          </div>
          <h2 className="text-xl font-bold text-dark-950 tracking-tight mt-0.5">
            Prioritized Citizen Next Actions
          </h2>
          <p className="text-xs text-dark-500 mt-0.5">
            {nextSteps.guidanceNote}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-100 text-dark-800 border border-dark-200">
            {nextSteps.statusBadge}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Primary Action Card — Floating Surface */}
        {primary && (
          <div className="p-6 rounded-2xl border border-dark-200 bg-surface-50">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-base font-bold text-dark-950">
                {primary.title}
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-dark-200 text-dark-800">
                Priority 01
              </span>
            </div>

            <p className="text-sm text-dark-600 leading-relaxed mb-4">
              {primary.description}
            </p>

            {primary.suggestedDocuments.length > 0 && (
              <div className="mb-5 p-4 rounded-xl bg-white border border-dark-100 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-dark-500 block mb-2">
                  Accepted Official Documentation:
                </span>
                <div className="flex flex-wrap gap-2">
                  {primary.suggestedDocuments.map((doc, idx) => (
                    <span key={idx} className="text-xs text-dark-800 bg-surface-100 px-3 py-1 rounded-lg border border-dark-200/80 font-semibold">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-dark-200/80">
              <span className="text-xs text-dark-500 font-mono font-medium">
                Condition Reference: {primary.conditionCode} ({primary.conditionTitle})
              </span>

              <button
                type="button"
                onClick={() => onTriggerAction && onTriggerAction(primary)}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-2xl text-xs font-bold transition shadow-sm"
              >
                <Upload className="w-4 h-4 text-dark-950" strokeWidth={2} />
                <span>{primary.actionLabel}</span>
              </button>
            </div>
          </div>
        )}

        {/* Secondary Actions */}
        {secondary.length > 0 && (
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-500 mb-3">
              Secondary Follow-Up Items ({secondary.length})
            </h3>

            <div className="divide-y divide-dark-100 border border-dark-100 rounded-2xl overflow-hidden shadow-sm">
              {secondary.map((action, idx) => (
                <div key={idx} className="p-4 sm:p-5 bg-white hover:bg-dark-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-dark-950">{action.title}</span>
                      <span className="text-[10px] text-dark-400 font-mono font-bold">P0{action.priority}</span>
                    </div>
                    <p className="text-dark-600 leading-relaxed max-w-xl">{action.description}</p>
                    <span className="text-[11px] text-dark-400 block font-mono">
                      Requirement: {action.conditionCode} — {action.conditionTitle}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTriggerAction && onTriggerAction(action)}
                    className="inline-flex items-center space-x-1.5 text-dark-900 hover:text-dark-600 font-bold text-xs whitespace-nowrap"
                  >
                    <span>{action.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-dark-900" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* End-of-Journey Hand-Off to Reviewer (User 1 -> User 2 Transition) */}
        <div className="mt-8 pt-6 border-t border-dark-100 bg-surface-50 p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-dark-950 text-lime-accent uppercase">
                End of Applicant Journey
              </span>
              <span className="text-xs text-dark-400">•</span>
              <span className="text-xs font-bold text-dark-900">Proceed to User 2 (Reviewer)</span>
            </div>
            <p className="text-xs text-dark-600 leading-relaxed max-w-xl">
              Application is evaluated. Commit this record to the persistent database and proceed to the Reviewer Portal to adjudicate, request evidence, or override flags.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onCommitAndReview ? (
              <button
                type="button"
                onClick={onCommitAndReview}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-2xl text-xs font-bold transition shadow-md whitespace-nowrap disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Saving...' : 'Submit & Open Reviewer Portal'}</span>
                <ArrowRight className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
              </button>
            ) : onNavigateToReviewer ? (
              <button
                type="button"
                onClick={onNavigateToReviewer}
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-2xl text-xs font-bold transition shadow-md whitespace-nowrap"
              >
                <span>Open in Reviewer Portal</span>
                <ArrowRight className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
