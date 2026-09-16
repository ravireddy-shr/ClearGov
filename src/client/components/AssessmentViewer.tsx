import React from 'react';
import { AssessmentOutput, ConditionEvaluationResult, CrossDocumentConflict } from '../types/index.js';
import { Check, Edit2, ArrowRight, AlertTriangle } from 'lucide-react';

interface AssessmentViewerProps {
  assessment: AssessmentOutput;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNextStep: () => void;
}

export const AssessmentViewer: React.FC<AssessmentViewerProps> = ({
  assessment,
  isExpanded,
  onToggleExpand,
  onNextStep
}) => {
  // Restrained, text-forward semantic badge
  const getStatusBadge = (status: ConditionEvaluationResult['status']) => {
    switch (status) {
      case 'satisfied':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Satisfied</span>
          </span>
        );
      case 'not_satisfied':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span>Not Satisfied</span>
          </span>
        );
      case 'insufficient_evidence':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Missing Evidence</span>
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>Needs Review</span>
          </span>
        );
    }
  };

  const getIssueLabel = (issue: ConditionEvaluationResult['issue']) => {
    if (!issue) return null;
    let label = issue.toUpperCase();
    if (issue === 'contradictory') label = 'Contradiction Detected';
    if (issue === 'unreadable') label = 'OCR Unreadable (<70%)';
    if (issue === 'requires_confirmation') label = 'Borderline (Within 5%)';
    if (issue === 'missing') label = 'Evidence Missing';

    return (
      <span className="inline-block text-[11px] font-mono text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
        {label}
      </span>
    );
  };

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
              <span className="font-mono text-xs text-dark-500 font-semibold">03</span>
              <h3 className="text-sm font-bold text-dark-950">
                Assessment Matrix: {assessment.metrics.satisfiedCount} of {assessment.metrics.totalConditions} Conditions Satisfied
              </h3>
              {assessment.conflicts.length > 0 && (
                <span className="text-[11px] text-purple-700 font-semibold">
                  ({assessment.conflicts.length} conflict flagged)
                </span>
              )}
            </div>
            <p className="text-xs text-dark-500 mt-0.5">
              {assessment.decisionRationale}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-dark-200 text-xs font-semibold text-dark-800 hover:bg-dark-50 transition"
        >
          <Edit2 className="w-3.5 h-3.5 text-dark-500" strokeWidth={1.75} />
          <span>Inspect Matrix</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden mb-8 shadow-md">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-dark-100 bg-surface-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-dark-500">
              Stage 3 of 6
            </span>
            <span className="text-dark-300">•</span>
            <span className="text-xs text-dark-500">Statutory Rules Engine</span>
          </div>
          <h2 className="text-xl font-bold text-dark-950 tracking-tight mt-0.5">
            Rule-by-Rule Condition Assessment Matrix
          </h2>
          <p className="text-xs text-dark-500 mt-0.5">
            Every eligibility condition is independently evaluated against submitted evidence with inspectable values.
          </p>
        </div>

        {/* Quiet Counters */}
        <div className="flex items-center space-x-3 text-xs text-dark-600 font-semibold">
          <span className="text-emerald-700">{assessment.metrics.satisfiedCount} Satisfied</span>
          {assessment.metrics.notSatisfiedCount > 0 && (
            <span className="text-red-700">{assessment.metrics.notSatisfiedCount} Unmet</span>
          )}
          {assessment.metrics.insufficientEvidenceCount > 0 && (
            <span className="text-amber-700">{assessment.metrics.insufficientEvidenceCount} Incomplete</span>
          )}
          {assessment.metrics.needsReviewCount > 0 && (
            <span className="text-purple-700">{assessment.metrics.needsReviewCount} Flagged</span>
          )}
        </div>
      </div>

      {/* Cross-Document Contradiction Box if present */}
      {assessment.conflicts.length > 0 && (
        <div className="mx-6 sm:mx-8 mt-6 p-5 rounded-2xl bg-purple-50/60 border border-purple-200">
          <div className="flex items-center space-x-2 text-purple-900 text-xs font-bold mb-2.5">
            <AlertTriangle className="w-4 h-4 text-purple-700" strokeWidth={2} />
            <span>Cross-Document Discrepancy Detected ({assessment.conflicts.length})</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {assessment.conflicts.map((conflict, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                <p className="font-semibold text-dark-950 mb-2.5">{conflict.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  {conflict.documents.map((d, dIdx) => (
                    <div key={dIdx} className="bg-dark-50 p-2.5 rounded-lg border border-dark-200">
                      <span className="text-dark-500 block text-[10px] uppercase font-sans font-bold">{d.documentName}</span>
                      <span className="font-bold text-dark-950">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions Table Report */}
      <div className="p-6 sm:p-8">
        <div className="border border-dark-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-100 text-dark-600 font-bold border-b border-dark-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-20">Code</th>
                <th className="py-3 px-4">Statutory Requirement</th>
                <th className="py-3 px-4">Reasoning & Evidence Link</th>
                <th className="py-3 px-4 w-28 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 bg-white">
              {assessment.conditionResults.map(condition => (
                <tr key={condition.condition_id} className="hover:bg-dark-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-dark-500 align-top">
                    {condition.code}
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <span className="font-bold text-dark-950 block text-xs">
                      {condition.title}
                    </span>
                    {condition.issue && (
                      <div className="mt-1">{getIssueLabel(condition.issue)}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 align-top text-dark-700 leading-relaxed">
                    <p className="mb-1.5">{condition.reasoning}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-dark-500">
                      <span>Evidence: {condition.evidence_used.length > 0 ? condition.evidence_used.join(', ') : 'None (Missing)'}</span>
                      {condition.metrics?.actualValue !== undefined && (
                        <span className="font-mono text-dark-700 font-medium">
                          [Actual: {String(condition.metrics.actualValue)} | Cutoff: {String(condition.metrics.thresholdValue)}]
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right align-top">
                    {getStatusBadge(condition.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions: Confident Lime Accent Primary Button */}
        <div className="mt-8 pt-6 border-t border-dark-100 flex justify-end">
          <button
            type="button"
            onClick={onNextStep}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-2xl text-xs font-bold transition shadow-sm"
          >
            <span>Proceed to Step 4: Explanation Notice</span>
            <ArrowRight className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
