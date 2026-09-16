import React from 'react';
import { Check } from 'lucide-react';
import { OverallDecision } from '../types/index.js';

interface ReasoningChainProps {
  currentStage: number; // 1 to 6
  overallDecision?: OverallDecision;
  onSelectStage: (stage: number) => void;
  expandAll: boolean;
  onToggleExpandAll: () => void;
}

export const ReasoningChain: React.FC<ReasoningChainProps> = ({
  currentStage,
  overallDecision,
  onSelectStage,
  expandAll,
  onToggleExpandAll
}) => {
  const stages = [
    { id: 1, label: 'Applicant Info' },
    { id: 2, label: 'Evidence Intake' },
    { id: 3, label: 'Assessment Engine' },
    { id: 4, label: 'Explanation Notice' },
    { id: 5, label: 'Decision State' },
    { id: 6, label: 'Next Actions' },
  ];

  // Restrained, text-forward outcome badge
  const getDecisionBadge = () => {
    switch (overallDecision) {
      case 'sufficient_to_proceed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Sufficient to Proceed</span>
          </span>
        );
      case 'condition_not_satisfied':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-red-300 bg-red-950/60 border border-red-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Condition Not Satisfied</span>
          </span>
        );
      case 'more_evidence_needed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>More Evidence Needed</span>
          </span>
        );
      case 'needs_human_review':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Needs Human Review</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
      {/* Slim, understated horizontal stepper */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1 scrollbar-none">
        {stages.map((stage) => {
          const isActive = currentStage === stage.id && !expandAll;
          const isPassed = currentStage > stage.id;

          if (isActive) {
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-lime-accent text-dark-950 shadow-md transition whitespace-nowrap"
              >
                <span className="font-mono text-[11px]">0{stage.id}</span>
                <span>{stage.label}</span>
              </button>
            );
          }

          if (isPassed) {
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition whitespace-nowrap"
              >
                <Check className="w-3 h-3 text-emerald-400" strokeWidth={2.5} />
                <span>{stage.label}</span>
              </button>
            );
          }

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStage(stage.id)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-300 transition whitespace-nowrap"
            >
              <span className="font-mono text-[10px]">0{stage.id}</span>
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right controls: Outcome Pill + Expand Toggle */}
      <div className="flex items-center space-x-4">
        {getDecisionBadge()}
        <button
          type="button"
          onClick={onToggleExpandAll}
          className="text-xs text-slate-400 hover:text-white font-medium transition"
        >
          {expandAll ? 'Switch to Stepper' : 'Expand All'}
        </button>
      </div>
    </div>
  );
};
