import React, { useState } from 'react';
import { FullApplicationResponse } from '../types/index.js';
import { Shield, Check, X, AlertCircle } from 'lucide-react';

interface DecisionModalProps {
  application: FullApplicationResponse;
  onClose: () => void;
  onSubmitDecision: (action: 'approve_override' | 'reject' | 'request_info', notes: string) => Promise<void>;
  isSubmitting: boolean;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  application,
  onClose,
  onSubmitDecision,
  isSubmitting
}) => {
  const [action, setAction] = useState<'approve_override' | 'reject' | 'request_info'>('approve_override');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Reviewer justification notes are mandatory for administrative auditability.');
      return;
    }
    setError('');
    await onSubmitDecision(action, notes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-dark-100">
        
        {/* Header */}
        <div className="bg-dark-950 text-white p-6 sm:p-7 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-dark-900 flex items-center justify-center text-lime-accent border border-dark-800">
              <Shield className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Administrative Decision</h3>
              <p className="text-xs text-dark-400">
                Application {application.id} — {application.applicant.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white p-1.5 rounded-xl hover:bg-dark-800 transition"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 text-xs">
          
          {/* Action Selector */}
          <div>
            <label className="block text-xs font-bold text-dark-700 uppercase tracking-wider mb-2.5">
              Select Administrative Action
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => setAction('approve_override')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                  action === 'approve_override'
                    ? 'border-dark-950 bg-dark-950 text-lime-accent font-bold shadow-sm'
                    : 'border-dark-200 hover:border-dark-300 text-dark-700 bg-white font-semibold'
                }`}
              >
                <span className="text-xs">Approve (Override)</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('request_info')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                  action === 'request_info'
                    ? 'border-dark-950 bg-dark-950 text-lime-accent font-bold shadow-sm'
                    : 'border-dark-200 hover:border-dark-300 text-dark-700 bg-white font-semibold'
                }`}
              >
                <span className="text-xs">Request Info</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                  action === 'reject'
                    ? 'border-dark-950 bg-dark-950 text-lime-accent font-bold shadow-sm'
                    : 'border-dark-200 hover:border-dark-300 text-dark-700 bg-white font-semibold'
                }`}
              >
                <span className="text-xs">Reject File</span>
              </button>

            </div>
          </div>

          {/* Action Description */}
          <div className="p-4 rounded-2xl bg-surface-50 border border-dark-100 text-dark-600 leading-relaxed text-xs">
            {action === 'approve_override' && (
              <p>
                <strong className="text-dark-950">Administrative Discretion:</strong> Overrules flagged issues or borderline values. The application status updates to <code className="text-dark-900 bg-surface-200 px-1.5 py-0.5 rounded font-mono font-bold">approved_by_reviewer</code> and advances to disbursement.
              </p>
            )}
            {action === 'request_info' && (
              <p>
                <strong className="text-dark-950">Request Supplemental Evidence:</strong> Returns the application to the citizen with instructions on specific missing or corrected documents. Status updates to <code className="text-dark-900 bg-surface-200 px-1.5 py-0.5 rounded font-mono font-bold">info_requested</code>.
              </p>
            )}
            {action === 'reject' && (
              <p>
                <strong className="text-dark-950">Formal Disqualification:</strong> Upholds statutory failure and formally issues an adverse decision notice. Status updates to <code className="text-dark-900 bg-surface-200 px-1.5 py-0.5 rounded font-mono font-bold">rejected_by_reviewer</code>.
              </p>
            )}
          </div>

          {/* Mandatory Justification Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-dark-700">
                Official Reviewer Justification Notes <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setNotes('Verified authentic records directly with State Registrar on 09/16/2026. Discrepancy confirmed resolved under Administrative Code Section 4. Overriding automated flag to approve award.')}
                  className="text-dark-500 hover:text-dark-900 underline font-semibold"
                >
                  Quick Fill: Verified & Resolved
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Verified date of birth directly with State Registrar on 09/16/2026. Document confirmed authentic under Administrative Code Section 4. Overriding flag."
              className="w-full p-3.5 text-xs border border-dark-200 rounded-2xl focus:ring-2 focus:ring-dark-900 focus:border-dark-900 outline-none leading-relaxed text-dark-900"
            />
            {error && (
              <p className="text-red-600 text-[11px] mt-1 font-bold">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-dark-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-dark-600 hover:bg-dark-50 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-xs font-bold text-dark-950 bg-lime-accent hover:bg-lime-accentHover rounded-2xl shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Recording decision...' : 'Commit Decision to Database'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
