import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertTriangle, Shield, Layers, X, Sparkles } from 'lucide-react';
import { PresetCase } from '../types/index.js';

interface QuickStartGuideProps {
  onSelectPreset: (preset: PresetCase) => void;
  presets: PresetCase[];
  onNavigateToTab: (tab: 'applicant' | 'reviewer' | 'architecture', targetAppId?: string) => void;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  onSelectPreset,
  presets,
  onNavigateToTab
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const elenaPreset = presets.find(p => p.applicant.fullName.includes('Elena'));
  const sophiaPreset = presets.find(p => p.applicant.fullName.includes('Sophia'));

  if (isDismissed) {
    return (
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsDismissed(false)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition border border-white/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-lime-accent" strokeWidth={2} />
          <span>Show Evaluator Hero Walkthrough</span>
        </button>
      </div>
    );
  }

  return (
    <section className="mb-12 pt-4 pb-2">
      {/* Hero Header on Dark Background with Generous Negative Space */}
      <div className="max-w-3xl mb-10">
        <div className="flex items-center space-x-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-lime-accent animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Public Decision Infrastructure
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.15]">
          Explainable Public-Service Decisions
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          ClearGov transforms public benefit applications into transparent, inspectable reasoning chains rather than black-box verdicts. Every determination provides verified evidence, cross-document conflict detection, and auditable human review.
        </p>
      </div>

      {/* 4 Feature/Walkthrough Cards in the Reference Grid Style */}
      {/* Light floating cards with soft rounded corners (18-20px) on dark background */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Clean Approval */}
        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-transform hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
              <CheckCircle className="w-6 h-6 text-slate-800" strokeWidth={1.75} />
            </div>

            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Step 01</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Clean Approval
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Open <strong>Elena Vance</strong> to inspect all 6 statutory conditions verified with authentic documentation.
            </p>
          </div>

          {elenaPreset && (
            <button
              type="button"
              onClick={() => {
                onSelectPreset(elenaPreset);
                onNavigateToTab('applicant');
              }}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-lime-accent hover:bg-lime-accentHover text-dark-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <span>Load Elena Vance</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Card 2: Borderline Flag */}
        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-transform hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
              <AlertTriangle className="w-6 h-6 text-slate-800" strokeWidth={1.75} />
            </div>

            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Step 02</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Borderline Flag
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Open <strong>Sophia Ramos</strong>. Her $44,200 income is within 5% of the $45k cap, flagging it for review.
            </p>
          </div>

          {sophiaPreset && (
            <button
              type="button"
              onClick={() => {
                onSelectPreset(sophiaPreset);
                onNavigateToTab('applicant');
              }}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-lime-accent hover:bg-lime-accentHover text-dark-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <span>Load Sophia Ramos</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Card 3: Reviewer Queue */}
        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-transform hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
              <Shield className="w-6 h-6 text-slate-800" strokeWidth={1.75} />
            </div>

            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Step 03</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reviewer Portal
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect why Sophia Ramos is stuck, view side-by-side evidence, and execute an override decision.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('reviewer', 'CG-2026-005')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-lime-accent hover:bg-lime-accentHover text-dark-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <span>Open Reviewer Portal</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Card 4: System Chain */}
        <div className="bg-white rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-transform hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-4">
              <Layers className="w-6 h-6 text-slate-800" strokeWidth={1.75} />
            </div>

            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Step 04</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reasoning Chain
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Examine the statutory schema and hierarchical precedence rules in plain language with live examples.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('architecture')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-lime-accent hover:bg-lime-accentHover text-dark-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <span>Inspect Reasoning Chain</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </section>
  );
};
