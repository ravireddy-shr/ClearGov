import React from 'react';
import { ApplicantData, PresetCase } from '../types/index.js';
import { ArrowRight, Check, Edit2, BookmarkCheck } from 'lucide-react';

interface ApplicantFormProps {
  applicant: ApplicantData;
  onChange: (updated: ApplicantData) => void;
  presets: PresetCase[];
  onSelectPreset: (preset: PresetCase) => void;
  selectedPresetLabel: string;
  onSubmit: () => void;
  isSubmitting: boolean;
  savedApplicationId?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNextStep: () => void;
}

export const ApplicantForm: React.FC<ApplicantFormProps> = ({
  applicant,
  onChange,
  presets,
  onSelectPreset,
  selectedPresetLabel,
  onSubmit,
  isSubmitting,
  savedApplicationId,
  isExpanded,
  onToggleExpand,
  onNextStep
}) => {
  const handleChange = (field: keyof ApplicantData, value: any) => {
    onChange({
      ...applicant,
      [field]: value
    });
  };

  const getPresetDescription = (label: string, expectedOutcome: string) => {
    if (label.includes('Elena Vance')) {
      return 'Clean pass — all 6 conditions verified with valid documentation';
    }
    if (label.includes('Marcus Chen')) {
      return 'Missing document — Form 1040 tax return omitted from submission';
    }
    if (label.includes('Aaliyah Patel')) {
      return 'Contradiction — DOB differs between ID (1999) and college letter (2003)';
    }
    if (label.includes('Devon Miller')) {
      return 'Low GPA — cumulative 2.65 is below the statutory 3.20 requirement';
    }
    if (label.includes('Sophia Ramos')) {
      return 'Borderline income — $44,200 is within 5% of the $45k statutory cap';
    }
    if (label.includes('Liam O\'Connor')) {
      return 'Low OCR clarity — blurred transcript photo (42% optical clarity)';
    }
    return expectedOutcome.replace(/_/g, ' ');
  };

  // Small, restrained colored dot + text label
  const getOutcomeTag = (outcome: string) => {
    switch (outcome) {
      case 'sufficient_to_proceed':
        return { label: 'Sufficient to Proceed', dot: 'bg-emerald-500', text: 'text-emerald-700' };
      case 'condition_not_satisfied':
        return { label: 'Condition Not Satisfied', dot: 'bg-red-500', text: 'text-red-700' };
      case 'more_evidence_needed':
        return { label: 'More Evidence Needed', dot: 'bg-amber-500', text: 'text-amber-700' };
      case 'needs_human_review':
        return { label: 'Needs Human Review', dot: 'bg-purple-500', text: 'text-purple-700' };
      default:
        return { label: outcome, dot: 'bg-slate-400', text: 'text-slate-600' };
    }
  };

  // Collapsed View for finished step (Clean light floating card)
  if (!isExpanded) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 mb-6 flex items-center justify-between shadow-sm transition hover:shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Check className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-slate-400">01</span>
              <h3 className="text-sm font-bold text-slate-900">
                Applicant Profile: {applicant.fullName}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                ({applicant.stateOfResidency} • {applicant.institutionName})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Household Income: ${applicant.reportedIncome.toLocaleString()} • GPA: {applicant.reportedGpa.toFixed(2)} • Enrolled: {applicant.enrolledCredits} credits
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
          <span>Edit</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Quick Test-Case Chips on Dark Section Background (Instruction 3) */}
      <div className="bg-dark-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-accent" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Step 01 — Applicant Profile
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Choose Reference Case or Edit Live
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Click any light card below to immediately populate that citizen scenario.
            </p>
          </div>

          {savedApplicationId && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-full text-xs text-slate-200 font-mono">
              <BookmarkCheck className="w-3.5 h-3.5 text-lime-accent" strokeWidth={2} />
              <span>Record: {savedApplicationId}</span>
            </div>
          )}
        </div>

        {/* Small Rounded Light Cards arranged in a clean grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {presets.map((preset, idx) => {
            const isSelected = selectedPresetLabel === preset.label;
            const outcomeTag = getOutcomeTag(preset.expectedOutcome);
            const caption = getPresetDescription(preset.label, preset.expectedOutcome);

            let cardStyle = "bg-white text-slate-900 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5";
            if (isSelected) {
              cardStyle = "bg-white text-slate-900 ring-3 ring-lime-accent shadow-xl font-semibold scale-[1.01]";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`p-4 text-left rounded-2xl transition-all flex flex-col justify-between ${cardStyle}`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">{preset.applicant.fullName}</span>
                  <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold ${outcomeTag.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${outcomeTag.dot}`} />
                    <span>{outcomeTag.label}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {caption}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applicant Details Form — Plain Light/Readable Background */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="pb-4 mb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-dark-950 text-lime-accent uppercase">
                User 1 Role: Citizen Applicant
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-semibold">Live Intake</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Citizen Application Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in each field below or select a reference citizen. ClearGov evaluates evidence and criteria in real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onChange({
                fullName: '',
                dateOfBirth: '2003-01-01',
                email: '',
                stateOfResidency: 'CA',
                institutionName: 'State University',
                enrolledCredits: 12,
                reportedIncome: 35000,
                reportedGpa: 3.50,
                hasDuplicateScholarship: false,
                submittedAt: new Date().toISOString()
              });
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-dark-200 text-xs font-semibold text-dark-800 hover:bg-dark-50 transition"
          >
            <span>+ New Blank Applicant</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Group 1: Identity & State Residency */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              1. Identity & Legal Residency
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={applicant.fullName}
                  onChange={e => handleChange('fullName', e.target.value)}
                  className="w-full h-12 px-4 text-sm font-semibold text-dark-950 placeholder:text-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition"
                  placeholder="Elena Vance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={applicant.dateOfBirth}
                  onChange={e => handleChange('dateOfBirth', e.target.value)}
                  className="w-full h-12 px-4 text-sm font-semibold text-dark-950 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none font-mono transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State of Residency
                </label>
                <select
                  value={applicant.stateOfResidency}
                  onChange={e => handleChange('stateOfResidency', e.target.value)}
                  className="w-full h-12 px-4 text-sm font-semibold text-dark-950 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition"
                >
                  <option value="CA">California (In-State Eligible)</option>
                  <option value="NY">New York (Out-of-State)</option>
                  <option value="TX">Texas (Out-of-State)</option>
                  <option value="WA">Washington (Out-of-State)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Group 2: Higher Education Enrollment */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              2. Academic Enrollment & Performance
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Accredited Institution
                </label>
                <input
                  type="text"
                  value={applicant.institutionName}
                  onChange={e => handleChange('institutionName', e.target.value)}
                  className="w-full h-12 px-4 text-sm font-semibold text-dark-950 placeholder:text-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition"
                  placeholder="State University"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Enrolled Credit Hours</span>
                  <span className="text-[10px] text-slate-400 font-normal">Min 12 credits</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={applicant.enrolledCredits}
                  onChange={e => handleChange('enrolledCredits', parseInt(e.target.value) || 0)}
                  className="w-full h-12 px-4 text-sm font-semibold text-dark-950 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none font-mono transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Cumulative GPA</span>
                  <span className="text-[10px] text-slate-400 font-normal">Min 3.20 required</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="4.0"
                  value={applicant.reportedGpa}
                  onChange={e => handleChange('reportedGpa', parseFloat(e.target.value) || 0)}
                  className="w-full h-12 px-4 text-sm font-semibold text-dark-950 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none font-mono transition"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Financial Standing */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              3. Household Financial Standing
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Household Income ($)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Cap $45k (5% margin)</span>
                </label>
                <input
                  type="number"
                  step="500"
                  value={applicant.reportedIncome}
                  onChange={e => handleChange('reportedIncome', parseInt(e.target.value) || 0)}
                  className="w-full h-12 px-4 text-sm font-semibold text-dark-950 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none font-mono transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={applicant.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full h-12 px-4 text-sm font-semibold text-dark-950 placeholder:text-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none transition"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center space-x-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applicant.hasDuplicateScholarship}
                    onChange={e => handleChange('hasDuplicateScholarship', e.target.checked)}
                    className="w-4 h-4 text-dark-950 border-slate-300 rounded focus:ring-dark-950"
                  />
                  <span>Active Duplicate Tuition Grant</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer Actions: Accent-Colored Primary Button */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-4 py-2 rounded-xl hover:bg-slate-100 transition disabled:opacity-40"
          >
            {isSubmitting ? 'Saving record...' : 'Save Record Draft'}
          </button>

          <button
            type="button"
            onClick={onNextStep}
            className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 bg-lime-accent hover:bg-lime-accentHover text-dark-950 font-bold rounded-full text-xs transition shadow-md"
          >
            <span>Proceed to Step 2: Evidence Intake</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
