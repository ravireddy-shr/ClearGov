import React, { useState, useEffect } from 'react';
import { FullApplicationResponse } from '../types/index.js';
import { Shield, GitCompare, History, ArrowRight } from 'lucide-react';
import { DecisionModal } from './DecisionModal.js';

interface ReviewerPortalProps {
  applications: FullApplicationResponse[];
  onRefresh: () => void;
  targetAppId?: string;
}

export const ReviewerPortal: React.FC<ReviewerPortalProps> = ({
  applications,
  onRefresh,
  targetAppId
}) => {
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'more_evidence_needed' | 'condition_not_satisfied' | 'sufficient_to_proceed'>('needs_review');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  useEffect(() => {
    if (targetAppId && applications.some(a => a.id === targetAppId)) {
      setSelectedAppId(targetAppId);
      const targetApp = applications.find(a => a.id === targetAppId);
      if (targetApp) {
        if (targetApp.status === 'needs_review' || targetApp.overallDecision === 'needs_human_review') {
          setFilter('needs_review');
        } else {
          setFilter('all');
        }
      }
    } else if (!selectedAppId && applications.length > 0) {
      const flagged = applications.find(a => a.status === 'needs_review' || a.overallDecision === 'needs_human_review');
      setSelectedAppId(flagged?.id || applications[0].id);
    }
  }, [targetAppId, applications, selectedAppId]);

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'needs_review') {
      return app.status === 'needs_review' || app.overallDecision === 'needs_human_review' || app.assessment.metrics.needsReviewCount > 0;
    }
    if (filter === 'more_evidence_needed') {
      return app.status === 'needs_more_info' || app.overallDecision === 'more_evidence_needed' || app.status === 'info_requested';
    }
    if (filter === 'condition_not_satisfied') {
      return app.status === 'rejected' || app.overallDecision === 'condition_not_satisfied' || app.status === 'rejected_by_reviewer';
    }
    if (filter === 'sufficient_to_proceed') {
      return app.status === 'proceeding' || app.overallDecision === 'sufficient_to_proceed' || app.status === 'approved_by_reviewer';
    }
    return true;
  });

  const currentApp = applications.find(a => a.id === selectedAppId) || filteredApps[0];

  const handleDecisionSubmit = async (action: 'approve_override' | 'reject' | 'request_info', notes: string) => {
    if (!currentApp) return;
    setIsSubmittingDecision(true);
    try {
      const response = await fetch(`/api/applications/${currentApp.id}/reviewer-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes,
          reviewerId: 'Senior Reviewer Sarah Jenkins (Badge #4829)'
        })
      });
      if (!response.ok) {
        throw new Error('Failed to execute reviewer action');
      }
      setShowDecisionModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error committing decision: ${err.message}`);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Text-forward, restrained outcome badges (Instruction 3)
  const getStatusPill = (status: string, decision: string) => {
    if (status === 'approved_by_reviewer') {
      return (
        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>Overridden & Approved</span>
        </span>
      );
    }
    if (status === 'rejected_by_reviewer') {
      return (
        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-red-800">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <span>Rejected by Reviewer</span>
        </span>
      );
    }
    if (status === 'info_requested') {
      return (
        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <span>Info Requested</span>
        </span>
      );
    }

    switch (decision) {
      case 'needs_human_review':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>Needs Review</span>
          </span>
        );
      case 'more_evidence_needed':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>More Evidence Needed</span>
          </span>
        );
      case 'condition_not_satisfied':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span>Condition Not Satisfied</span>
          </span>
        );
      case 'sufficient_to_proceed':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Sufficient to Proceed</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Reviewer Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-dark-950 text-lime-accent uppercase">
              User 2 Role: Administrative Reviewer
            </span>
            <span className="text-dark-300">•</span>
            <span className="text-xs text-dark-500 font-semibold">Human Decision Support</span>
          </div>
          <h2 className="text-2xl font-bold text-dark-950 tracking-tight mt-1">
            Flagged Case Queue & Administrative Oversight
          </h2>
          <p className="text-xs text-dark-500 mt-0.5">
            Inspect applications submitted by citizens, analyze cross-document discrepancies, and record auditable decisions.
          </p>
        </div>

        {/* Calm Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setFilter('needs_review')}
            className={`px-3.5 py-2 rounded-xl font-bold transition ${
              filter === 'needs_review'
                ? 'bg-dark-950 text-white shadow-sm'
                : 'bg-surface-50 text-dark-700 hover:bg-dark-100'
            }`}
          >
            Needs Review ({applications.filter(a => a.status === 'needs_review' || a.overallDecision === 'needs_human_review').length})
          </button>

          <button
            onClick={() => setFilter('more_evidence_needed')}
            className={`px-3.5 py-2 rounded-xl font-bold transition ${
              filter === 'more_evidence_needed'
                ? 'bg-dark-950 text-white shadow-sm'
                : 'bg-surface-50 text-dark-700 hover:bg-dark-100'
            }`}
          >
            Missing Evidence ({applications.filter(a => a.overallDecision === 'more_evidence_needed').length})
          </button>

          <button
            onClick={() => setFilter('condition_not_satisfied')}
            className={`px-3.5 py-2 rounded-xl font-bold transition ${
              filter === 'condition_not_satisfied'
                ? 'bg-dark-950 text-white shadow-sm'
                : 'bg-surface-50 text-dark-700 hover:bg-dark-100'
            }`}
          >
            Disqualified ({applications.filter(a => a.overallDecision === 'condition_not_satisfied').length})
          </button>

          <button
            onClick={() => setFilter('sufficient_to_proceed')}
            className={`px-3.5 py-2 rounded-xl font-bold transition ${
              filter === 'sufficient_to_proceed'
                ? 'bg-dark-950 text-white shadow-sm'
                : 'bg-surface-50 text-dark-700 hover:bg-dark-100'
            }`}
          >
            Approved ({applications.filter(a => a.overallDecision === 'sufficient_to_proceed').length})
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition ${
              filter === 'all'
                ? 'bg-dark-950 text-white shadow-sm'
                : 'bg-surface-50 text-dark-700 hover:bg-dark-100'
            }`}
          >
            All ({applications.length})
          </button>
        </div>
      </div>

      {/* Main Grid: Queue on Left, Deep Inspection on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Application List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-3xl overflow-hidden shadow-md">
            <div className="p-4 sm:p-5 bg-surface-100 border-b border-dark-100 flex items-center justify-between">
              <span className="text-xs font-bold text-dark-700 uppercase tracking-wider">
                Case Files ({filteredApps.length})
              </span>
              <button
                onClick={onRefresh}
                className="text-xs text-dark-500 hover:text-dark-950 font-bold"
              >
                Refresh
              </button>
            </div>

            <div className="divide-y divide-dark-100 max-h-[650px] overflow-y-auto">
              {filteredApps.length === 0 ? (
                <div className="p-8 text-center text-xs text-dark-500">
                  No applications match this filter.
                </div>
              ) : (
                filteredApps.map(app => {
                  const isSelected = app.id === currentApp?.id;
                  const hasConflict = app.assessment.conflicts.length > 0;
                  const hasUnreadable = app.assessment.conditionResults.some(c => c.issue === 'unreadable');
                  const isBorderline = app.assessment.conditionResults.some(c => c.issue === 'requires_confirmation');

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedAppId(app.id)}
                      className={`p-4 sm:p-5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-50 border-l-4 border-l-lime-accent'
                          : 'hover:bg-dark-50/60 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="font-bold text-xs text-dark-950 block">
                            {app.applicant.fullName}
                          </span>
                          <span className="font-mono text-[10px] text-dark-400 font-semibold">
                            {app.id}
                          </span>
                        </div>
                        <div>{getStatusPill(app.status, app.overallDecision)}</div>
                      </div>

                      <p className="text-xs text-dark-500 line-clamp-1 mt-1">
                        {app.applicant.institutionName} • ${app.applicant.reportedIncome.toLocaleString()} • GPA {app.applicant.reportedGpa.toFixed(2)}
                      </p>

                      {/* Subtle Flag badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[10px]">
                        {hasConflict && (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 font-semibold">
                            Conflict
                          </span>
                        )}
                        {hasUnreadable && (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 font-semibold">
                            Low Clarity
                          </span>
                        )}
                        {isBorderline && (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 font-semibold">
                            Borderline 5%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Inspection & Decision Panel (8 cols) */}
        <div className="lg:col-span-8">
          {currentApp ? (
            <div className="bg-white rounded-3xl overflow-hidden space-y-6 p-6 sm:p-8 shadow-md">
              
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-dark-100 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-dark-700 bg-surface-100 px-2.5 py-0.5 rounded-lg">
                      {currentApp.id}
                    </span>
                    <h3 className="text-2xl font-bold text-dark-950 tracking-tight">
                      {currentApp.applicant.fullName}
                    </h3>
                  </div>
                  <p className="text-xs text-dark-500 mt-1">
                    Submitted on {new Date(currentApp.createdAt).toLocaleDateString()} at {new Date(currentApp.createdAt).toLocaleTimeString()} UTC
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDecisionModal(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-2xl text-xs font-bold transition shadow-sm"
                >
                  <Shield className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
                  <span>Take Administrative Action</span>
                </button>
              </div>

              {/* WHY IT IS STUCK CALLOUT BOX */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface-50 border border-dark-100 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-dark-700">
                  <span>Impediment Analysis: Why This File Requires Review</span>
                </div>

                <p className="text-sm text-dark-900 leading-relaxed font-semibold">
                  {currentApp.assessment.decisionRationale}
                </p>

                {/* Specific problem conditions */}
                <div className="space-y-2 pt-2">
                  {currentApp.assessment.conditionResults
                    .filter(c => c.status === 'needs_review' || c.status === 'not_satisfied' || c.status === 'insufficient_evidence')
                    .map(c => (
                      <div key={c.condition_id} className="bg-white p-4 rounded-xl border border-dark-100 shadow-sm text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-dark-950">{c.code}: {c.title}</span>
                          <span className="font-mono text-[11px] text-purple-700 font-bold">
                            {c.issue || c.status}
                          </span>
                        </div>
                        <p className="text-dark-600 leading-relaxed text-xs">{c.reasoning}</p>
                        <div className="mt-1.5 text-[11px] text-dark-400 font-mono">
                          Evidence: {c.evidence_used.join(', ') || 'None (Missing)'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* SIDE-BY-SIDE CONTRADICTION INSPECTION */}
              {currentApp.assessment.conflicts.length > 0 && (
                <div className="p-5 sm:p-6 rounded-2xl bg-surface-50 border border-dark-100 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-dark-700">
                    <GitCompare className="w-4 h-4 text-purple-700" strokeWidth={2} />
                    <span>Side-by-Side Evidence Discrepancy View</span>
                  </div>

                  <div className="space-y-3">
                    {currentApp.assessment.conflicts.map((conflict, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-dark-100 shadow-sm">
                        <span className="text-xs font-bold text-dark-950 block mb-3">{conflict.description}</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {conflict.documents.map((doc, dIdx) => (
                            <div key={dIdx} className="p-3.5 rounded-xl bg-surface-50 border border-dark-200/80">
                              <span className="text-[10px] uppercase font-bold text-dark-400 block mb-1">
                                Document {dIdx + 1}: {doc.documentType}
                              </span>
                              <span className="font-semibold text-dark-800 block mb-1">{doc.documentName}</span>
                              <div className="text-xs font-mono font-bold text-dark-950 bg-white p-2 rounded-lg border border-dark-200">
                                Value: "{doc.value}"
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONDITION BREAKDOWN TABLE */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-dark-500 mb-3">
                  Condition Verification Breakdown
                </h4>
                <div className="border border-dark-100 rounded-2xl overflow-hidden text-xs shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-surface-100 text-dark-600 font-bold border-b border-dark-200 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3.5">Code</th>
                        <th className="py-2.5 px-3.5">Condition</th>
                        <th className="py-2.5 px-3.5">Status</th>
                        <th className="py-2.5 px-3.5">Evidence Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-100 bg-white">
                      {currentApp.assessment.conditionResults.map(c => (
                        <tr key={c.condition_id} className="hover:bg-dark-50/60">
                          <td className="py-3 px-3.5 font-mono text-dark-400 font-semibold">{c.code}</td>
                          <td className="py-3 px-3.5 font-bold text-dark-950">{c.title}</td>
                          <td className="py-3 px-3.5">
                            {getStatusPill(c.status, c.status)}
                          </td>
                          <td className="py-3 px-3.5 text-dark-500 text-[11px] font-mono">
                            {c.evidence_used.join(', ') || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REVIEWER AUDIT HISTORY TRAIL */}
              {currentApp.auditLogs && currentApp.auditLogs.length > 0 && (
                <div className="pt-4 border-t border-dark-100">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-dark-700 uppercase tracking-wider mb-3">
                    <History className="w-3.5 h-3.5 text-dark-400" strokeWidth={1.75} />
                    <span>Immutable Audit Trail ({currentApp.auditLogs.length})</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentApp.auditLogs.map(log => (
                      <div key={log.id} className="p-3.5 rounded-xl bg-surface-50 border border-dark-100 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-dark-400 mb-1 font-mono">
                          <span className="font-bold text-dark-700">[{log.actor.toUpperCase()}] {log.action}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-dark-700 leading-relaxed text-xs">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-dark-500 text-xs shadow-md">
              Select an application from the queue to inspect findings.
            </div>
          )}
        </div>

      </div>

      {/* Decision Modal */}
      {showDecisionModal && currentApp && (
        <DecisionModal
          application={currentApp}
          onClose={() => setShowDecisionModal(false)}
          onSubmitDecision={handleDecisionSubmit}
          isSubmitting={isSubmittingDecision}
        />
      )}
    </div>
  );
};
