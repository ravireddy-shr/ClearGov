import React, { useState } from 'react';
import { AssessmentOutput, ApplicantData, SubmittedEvidence, ExplanationNotice, NextStepPlan } from '../types/index.js';
import { Code, Copy, Check, X } from 'lucide-react';

interface ReasoningInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: ApplicantData;
  evidence: SubmittedEvidence[];
  assessment: AssessmentOutput | null;
  explanation: ExplanationNotice | null;
  nextSteps: NextStepPlan | null;
}

export const ReasoningInspectorModal: React.FC<ReasoningInspectorModalProps> = ({
  isOpen,
  onClose,
  applicant,
  evidence,
  assessment,
  explanation,
  nextSteps
}) => {
  const [activeJsonTab, setActiveJsonTab] = useState<'assessment' | 'explanation' | 'nextSteps' | 'evidence' | 'applicant'>('assessment');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getActiveData = () => {
    switch (activeJsonTab) {
      case 'assessment':
        return assessment;
      case 'explanation':
        return explanation;
      case 'nextSteps':
        return nextSteps;
      case 'evidence':
        return evidence;
      case 'applicant':
        return applicant;
    }
  };

  const jsonString = JSON.stringify(getActiveData(), null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">ClearGov Auditable State Inspector</h3>
              <p className="text-[11px] text-slate-400">
                Inspect raw structured payloads computed by the reasoning engine pipeline.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-900 px-4 pt-2 border-b border-slate-800 space-x-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveJsonTab('assessment')}
            className={`px-3 py-1.5 rounded-t-md font-mono transition ${
              activeJsonTab === 'assessment'
                ? 'bg-slate-950 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            assessmentOutput.json
          </button>

          <button
            onClick={() => setActiveJsonTab('explanation')}
            className={`px-3 py-1.5 rounded-t-md font-mono transition ${
              activeJsonTab === 'explanation'
                ? 'bg-slate-950 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            explanationNotice.json
          </button>

          <button
            onClick={() => setActiveJsonTab('nextSteps')}
            className={`px-3 py-1.5 rounded-t-md font-mono transition ${
              activeJsonTab === 'nextSteps'
                ? 'bg-slate-950 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            nextStepPlan.json
          </button>

          <button
            onClick={() => setActiveJsonTab('evidence')}
            className={`px-3 py-1.5 rounded-t-md font-mono transition ${
              activeJsonTab === 'evidence'
                ? 'bg-slate-950 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            submittedEvidence[].json
          </button>

          <button
            onClick={() => setActiveJsonTab('applicant')}
            className={`px-3 py-1.5 rounded-t-md font-mono transition ${
              activeJsonTab === 'applicant'
                ? 'bg-slate-950 text-sky-400 border-t-2 border-sky-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            applicantProfile.json
          </button>
        </div>

        {/* Code View */}
        <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-sky-200 selection:bg-sky-800">
          <pre>{jsonString}</pre>
        </div>

      </div>
    </div>
  );
};
