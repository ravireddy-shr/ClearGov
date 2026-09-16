import React, { useState } from 'react';
import { SubmittedEvidence, EvidenceRequirement } from '../types/index.js';
import { FileText, UploadCloud, Trash2, RotateCw, Check, Edit2, ArrowRight, Plus } from 'lucide-react';

interface EvidenceManagerProps {
  evidenceList: SubmittedEvidence[];
  evidenceTypes: EvidenceRequirement[];
  onUpdateEvidence: (newList: SubmittedEvidence[]) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNextStep: () => void;
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  evidenceList,
  evidenceTypes,
  onUpdateEvidence,
  isExpanded,
  onToggleExpand,
  onNextStep
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // New doc draft state
  const [newTypeId, setNewTypeId] = useState(evidenceTypes[0]?.typeId || 'income_proof');
  const [newFileName, setNewFileName] = useState('Supplemental_Document.pdf');
  const [newConfidence, setNewConfidence] = useState(0.95);
  const [newIncomeVal, setNewIncomeVal] = useState(30000);
  const [newGpaVal, setNewGpaVal] = useState(3.5);
  const [newDobVal, setNewDobVal] = useState('2002-04-18');
  const [newCreditsVal, setNewCreditsVal] = useState(15);

  const handleRemoveDoc = (id: string) => {
    onUpdateEvidence(evidenceList.filter(e => e.id !== id));
  };

  const handleToggleOcrConfidence = (id: string) => {
    const updated = evidenceList.map(e => {
      if (e.id === id) {
        const isLow = e.confidenceScore < 0.70;
        return {
          ...e,
          confidenceScore: isLow ? 0.96 : 0.42,
          ocrStatus: isLow ? 'processed' : 'low_confidence'
        } as SubmittedEvidence;
      }
      return e;
    });
    onUpdateEvidence(updated);
  };

  const handleAddCustomDoc = () => {
    const matchedType = evidenceTypes.find(t => t.typeId === newTypeId);
    const newDoc: SubmittedEvidence = {
      id: `ev-custom-${Date.now()}`,
      typeId: newTypeId,
      fileName: newFileName || `${matchedType?.name || 'Document'}.pdf`,
      ocrStatus: newConfidence >= 0.70 ? 'processed' : 'low_confidence',
      confidenceScore: newConfidence,
      extractedData: {
        fullName: 'Applicant Legal Name',
        dateOfBirth: newDobVal,
        annualIncome: newIncomeVal,
        cumulativeGpa: newGpaVal,
        enrolledCredits: newCreditsVal,
        institutionName: 'State University',
        state: 'CA',
        hasDuplicateAward: false
      },
      uploadTimestamp: new Date().toISOString()
    };

    const filtered = evidenceList.filter(e => e.typeId !== newTypeId);
    onUpdateEvidence([...filtered, newDoc]);
    setShowAddModal(false);
  };

  // Collapsed View for finished step
  if (!isExpanded) {
    const avgConfidence = evidenceList.length > 0
      ? (evidenceList.reduce((acc, doc) => acc + doc.confidenceScore, 0) / evidenceList.length * 100).toFixed(0)
      : '0';

    return (
      <div className="bg-white rounded-2xl p-5 mb-6 flex items-center justify-between shadow-sm transition hover:shadow-md">
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-full bg-dark-950 flex items-center justify-center text-lime-accent flex-shrink-0">
            <Check className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-dark-500 font-semibold">02</span>
              <h3 className="text-sm font-bold text-dark-950">
                Evidence Files: {evidenceList.length} Documents Attached
              </h3>
              <span className="text-xs text-dark-500">({avgConfidence}% average optical clarity)</span>
            </div>
            <p className="text-xs text-dark-500 mt-0.5">
              Verified: {evidenceList.map(e => e.fileName).join(', ') || 'None attached'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-dark-200 text-xs font-semibold text-dark-800 hover:bg-dark-50 transition"
        >
          <Edit2 className="w-3.5 h-3.5 text-dark-500" strokeWidth={1.75} />
          <span>Manage Files</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden mb-8 shadow-md">
      {/* Evidence Header */}
      <div className="p-6 sm:p-8 border-b border-dark-100 bg-surface-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-dark-500">
              Stage 2 of 6
            </span>
            <span className="text-dark-300">•</span>
            <span className="text-xs text-dark-500">Documentary Evidence & Extractions</span>
          </div>
          <h2 className="text-xl font-bold text-dark-950 tracking-tight mt-0.5">
            Submitted Supporting Evidence ({evidenceList.length} Files)
          </h2>
          <p className="text-xs text-dark-500 mt-0.5">
            ClearGov analyzes raw documents, verifies optical readability, and extracts structured fields for inspection.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-dark-50 text-dark-900 border border-dark-200 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5 text-dark-700" strokeWidth={2} />
          <span>Add Custom Document</span>
        </button>
      </div>

      {/* Clean Document Table / Report Layout */}
      <div className="p-6 sm:p-8">
        {evidenceList.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-dark-200 rounded-2xl bg-dark-50/50">
            <FileText className="w-8 h-8 mx-auto text-dark-400 mb-2" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-dark-800">No Evidence Documents Attached</p>
            <p className="text-xs text-dark-500 mt-1 max-w-sm mx-auto">
              Conditions requiring verification evidence will evaluate to "insufficient_evidence".
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-dark-950 text-white rounded-xl text-xs font-bold hover:bg-dark-900"
            >
              Attach Document
            </button>
          </div>
        ) : (
          <div className="border border-dark-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-100 text-dark-600 font-bold border-b border-dark-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Extracted Facts</th>
                  <th className="py-3 px-4">OCR Clarity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 bg-white">
                {evidenceList.map(doc => {
                  const matchedType = evidenceTypes.find(t => t.typeId === doc.typeId);
                  const isLowConfidence = doc.confidenceScore < 0.70;

                  return (
                    <tr key={doc.id} className="hover:bg-dark-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-dark-950">
                        {matchedType?.name || doc.typeId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-dark-600">
                        {doc.fileName}
                      </td>
                      <td className="py-3.5 px-4 text-dark-700">
                        <div className="space-y-0.5">
                          {doc.extractedData.dateOfBirth && (
                            <div><span className="text-dark-400">DOB:</span> <span className="font-mono font-medium text-dark-900">{doc.extractedData.dateOfBirth}</span></div>
                          )}
                          {doc.extractedData.annualIncome !== undefined && (
                            <div><span className="text-dark-400">Income:</span> <span className="font-mono font-medium text-dark-900">${doc.extractedData.annualIncome.toLocaleString()}</span></div>
                          )}
                          {doc.extractedData.cumulativeGpa !== undefined && (
                            <div><span className="text-dark-400">GPA:</span> <span className="font-mono font-medium text-dark-900">{doc.extractedData.cumulativeGpa.toFixed(2)}</span></div>
                          )}
                          {doc.extractedData.enrolledCredits !== undefined && (
                            <div><span className="text-dark-400">Units:</span> <span className="font-mono font-medium text-dark-900">{doc.extractedData.enrolledCredits} credits</span></div>
                          )}
                          {doc.extractedData.state && (
                            <div><span className="text-dark-400">State:</span> <span className="font-mono font-medium text-dark-900">{doc.extractedData.state}</span></div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center space-x-1.5 font-mono text-xs font-semibold ${
                            isLowConfidence ? 'text-purple-700' : 'text-emerald-700'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isLowConfidence ? 'bg-purple-600' : 'bg-emerald-600'}`} />
                            <span>{(doc.confidenceScore * 100).toFixed(0)}% ({isLowConfidence ? 'Low / Blurred' : 'Verified Clear'})</span>
                          </span>
                          <div className="w-24 h-1.5 bg-dark-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLowConfidence ? 'bg-purple-600' : 'bg-emerald-600'}`}
                              style={{ width: `${Math.min(100, doc.confidenceScore * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleOcrConfidence(doc.id)}
                            title={isLowConfidence ? "Set to High Clarity (96%)" : "Simulate Low Clarity (42%)"}
                            className="text-xs text-dark-500 hover:text-dark-900 p-1.5 rounded-lg hover:bg-dark-100 transition"
                          >
                            <RotateCw className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(doc.id)}
                            title="Delete document"
                            className="text-xs text-dark-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-dark-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Actions: Confident Lime Accent Primary Button */}
        <div className="mt-8 pt-6 border-t border-dark-100 flex justify-end">
          <button
            type="button"
            onClick={onNextStep}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-2xl text-xs font-bold transition shadow-sm"
          >
            <span>Proceed to Step 3: Assessment Engine</span>
            <ArrowRight className="w-4 h-4 text-dark-950" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-dark-100">
            <h4 className="text-base font-bold text-dark-950 mb-1">
              Add Evidence Document
            </h4>
            <p className="text-xs text-dark-500 mb-4">
              Simulate document upload with optical clarity and extracted structured metadata.
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-dark-700 mb-1">Evidence Type</label>
                <select
                  value={newTypeId}
                  onChange={e => setNewTypeId(e.target.value)}
                  className="w-full h-11 px-3 border border-dark-200 rounded-xl bg-white text-xs text-dark-900 focus:outline-none focus:border-dark-900"
                >
                  {evidenceTypes.map(t => (
                    <option key={t.typeId} value={t.typeId}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-dark-700 mb-1">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="w-full h-11 px-3 border border-dark-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:border-dark-900"
                />
              </div>

              <div>
                <label className="block font-bold text-dark-700 mb-1 flex justify-between">
                  <span>OCR Clarity Score:</span>
                  <span className="font-mono font-bold text-dark-950">{(newConfidence * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={newConfidence}
                  onChange={e => setNewConfidence(parseFloat(e.target.value))}
                  className="w-full accent-dark-950"
                />
                <span className="text-[11px] text-dark-400">Values &lt; 70% flag the condition as unreadable.</span>
              </div>

              {newTypeId === 'income_proof' && (
                <div>
                  <label className="block font-bold text-dark-700 mb-1">Extracted Income ($)</label>
                  <input
                    type="number"
                    value={newIncomeVal}
                    onChange={e => setNewIncomeVal(parseInt(e.target.value) || 0)}
                    className="w-full h-11 px-3 border border-dark-200 rounded-xl font-mono text-xs text-dark-900 focus:outline-none"
                  />
                </div>
              )}

              {newTypeId === 'academic_transcript' && (
                <div>
                  <label className="block font-bold text-dark-700 mb-1">Extracted Transcript GPA</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newGpaVal}
                    onChange={e => setNewGpaVal(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 px-3 border border-dark-200 rounded-xl font-mono text-xs text-dark-900 focus:outline-none"
                  />
                </div>
              )}

              {newTypeId === 'state_id_residency' && (
                <div>
                  <label className="block font-bold text-dark-700 mb-1">Extracted Date of Birth</label>
                  <input
                    type="date"
                    value={newDobVal}
                    onChange={e => setNewDobVal(e.target.value)}
                    className="w-full h-11 px-3 border border-dark-200 rounded-xl font-mono text-xs text-dark-900 focus:outline-none"
                  />
                </div>
              )}

              {newTypeId === 'enrollment_verification' && (
                <div>
                  <label className="block font-bold text-dark-700 mb-1">Extracted Enrolled Credits</label>
                  <input
                    type="number"
                    value={newCreditsVal}
                    onChange={e => setNewCreditsVal(parseInt(e.target.value) || 0)}
                    className="w-full h-11 px-3 border border-dark-200 rounded-xl font-mono text-xs text-dark-900 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-dark-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-dark-600 hover:bg-dark-50 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomDoc}
                className="px-5 py-2 text-xs bg-lime-accent hover:bg-lime-accentHover text-dark-950 rounded-xl font-bold transition shadow-sm"
              >
                Attach & Extract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
