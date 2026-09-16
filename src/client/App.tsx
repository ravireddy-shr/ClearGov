import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { ReasoningChain } from './components/ReasoningChain.js';
import { QuickStartGuide } from './components/QuickStartGuide.js';
import { ApplicantForm } from './components/ApplicantForm.js';
import { EvidenceManager } from './components/EvidenceManager.js';
import { AssessmentViewer } from './components/AssessmentViewer.js';
import { ExplanationCard } from './components/ExplanationCard.js';
import { NextActionsCard } from './components/NextActionsCard.js';
import { ReviewerPortal } from './components/ReviewerPortal.js';
import { ArchitectureView } from './components/ArchitectureView.js';
import { ReasoningInspectorModal } from './components/ReasoningInspectorModal.js';
import {
  ApplicantData,
  SubmittedEvidence,
  AssessmentOutput,
  ExplanationNotice,
  NextStepPlan,
  PresetCase,
  FullApplicationResponse,
  ScenarioDefinition,
  ActionStep
} from './types/index.js';

export function App() {
  const [currentTab, setCurrentTab] = useState<'applicant' | 'reviewer' | 'architecture'>('applicant');
  const [scenario, setScenario] = useState<ScenarioDefinition | null>(null);
  const [presets, setPresets] = useState<PresetCase[]>([]);
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>('');
  const [applications, setApplications] = useState<FullApplicationResponse[]>([]);
  const [isReseeding, setIsReseeding] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [reviewerTargetAppId, setReviewerTargetAppId] = useState<string | undefined>(undefined);

  // Stepper state: L1 to L6
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [expandAll, setExpandAll] = useState<boolean>(false);

  // Active Applicant Workspace State
  const [applicant, setApplicant] = useState<ApplicantData>({
    fullName: 'Elena Vance',
    dateOfBirth: '2002-04-18',
    email: 'elena.vance@student.stateu.edu',
    stateOfResidency: 'CA',
    institutionName: 'State University of Technology',
    enrolledCredits: 15,
    reportedIncome: 28500,
    reportedGpa: 3.82,
    hasDuplicateScholarship: false,
    submittedAt: new Date().toISOString()
  });

  const [evidenceList, setEvidenceList] = useState<SubmittedEvidence[]>([]);
  const [assessment, setAssessment] = useState<AssessmentOutput | null>(null);
  const [explanation, setExplanation] = useState<ExplanationNotice | null>(null);
  const [nextSteps, setNextSteps] = useState<NextStepPlan | null>(null);

  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedApplicationId, setSavedApplicationId] = useState<string | undefined>(undefined);

  // 1. Initial Load: Fetch Scenario, Presets, and Applications from Backend
  useEffect(() => {
    fetchScenario();
    fetchPresets();
    fetchApplications();
  }, []);

  const fetchScenario = async () => {
    try {
      const res = await fetch('/api/scenario');
      if (res.ok) {
        const data = await res.json();
        setScenario(data);
      }
    } catch (e) {
      console.error('Failed to load scenario:', e);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/presets');
      if (res.ok) {
        const data: PresetCase[] = await res.json();
        setPresets(data);
        if (data.length > 0) {
          const firstPreset = data[0];
          setSelectedPresetLabel(firstPreset.label);
          setApplicant(firstPreset.applicant);
          setEvidenceList(firstPreset.evidence);
          setSavedApplicationId(firstPreset.applicant.id);
          runLiveAssessment(firstPreset.applicant, firstPreset.evidence);
        }
      }
    } catch (e) {
      console.error('Failed to load presets:', e);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data: FullApplicationResponse[] = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error('Failed to load applications:', e);
    }
  };

  // 2. Live Assessment Pipeline
  const runLiveAssessment = useCallback(async (appData: ApplicantData, evList: SubmittedEvidence[]) => {
    setIsAssessing(true);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant: appData,
          evidence: evList
        })
      });
      if (res.ok) {
        const result = await res.json();
        setAssessment(result.assessment);
        setExplanation(result.explanation);
        setNextSteps(result.nextSteps);
      }
    } catch (err) {
      console.error('Live assessment error:', err);
    } finally {
      setIsAssessing(false);
    }
  }, []);

  // 3. Trigger live re-assessment whenever applicant or evidence changes
  const handleApplicantChange = (updated: ApplicantData) => {
    setApplicant(updated);
    setSavedApplicationId(undefined);
    runLiveAssessment(updated, evidenceList);
  };

  const handleEvidenceChange = (newList: SubmittedEvidence[]) => {
    setEvidenceList(newList);
    setSavedApplicationId(undefined);
    runLiveAssessment(applicant, newList);
  };

  // 4. Handle Preset Selection
  const handleSelectPreset = (preset: PresetCase) => {
    setSelectedPresetLabel(preset.label);
    setApplicant(preset.applicant);
    setEvidenceList(preset.evidence);
    setSavedApplicationId(preset.applicant.id);
    setCurrentStage(1);
    runLiveAssessment(preset.applicant, preset.evidence);
  };

  // 5. Submit Application to SQLite Persistence & Navigate to Reviewer
  const handleSubmitApplication = async (navigateToReviewer = false) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant,
          evidence: evidenceList
        })
      });
      if (!res.ok) throw new Error('Submission failed');
      const saved: FullApplicationResponse = await res.json();
      setSavedApplicationId(saved.id);
      await fetchApplications();
      
      if (navigateToReviewer) {
        handleNavigateToReviewer(saved.id);
      } else {
        alert(`Application record successfully committed to persistent storage. Reference ID: ${saved.id}`);
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Reset Seed Data
  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await fetchPresets();
        await fetchApplications();
        alert('Database successfully restored to reference seed state.');
      }
    } catch (err: any) {
      alert(`Reseed failed: ${err.message}`);
    } finally {
      setIsReseeding(false);
    }
  };

  // 7. Navigation Helpers
  const handleNavigateToTab = (tab: 'applicant' | 'reviewer' | 'architecture', targetAppId?: string) => {
    setCurrentTab(tab);
    if (targetAppId) {
      setReviewerTargetAppId(targetAppId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToReviewer = (appId?: string) => {
    const target = appId || applicant.id || 'CG-2026-003';
    setReviewerTargetAppId(target);
    setCurrentTab('reviewer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerAction = (action: ActionStep) => {
    setCurrentStage(2);
    const el = document.getElementById('step-2-evidence');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pendingReviewCount = applications.filter(
    a => a.status === 'needs_review' || a.overallDecision === 'needs_human_review'
  ).length;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col antialiased text-white selection:bg-lime-accent selection:text-dark-950">
      {/* Global Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        pendingReviewCount={pendingReviewCount}
        onReseed={handleReseed}
        isReseeding={isReseeding}
        onOpenInspector={() => setIsInspectorOpen(true)}
      />

      {/* Main Content Area with Generous Breathing Room (Instruction 8) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Evaluator Quick-Start Landing Guide & Checklist */}
        <QuickStartGuide
          presets={presets}
          onSelectPreset={handleSelectPreset}
          onNavigateToTab={handleNavigateToTab}
        />

        {/* TAB 1: APPLICANT JOURNEY (INTERACTIVE STEPPER L1–L6) */}
        {currentTab === 'applicant' && (
          <div className="space-y-6">
            
            {/* Functional Stepper with Active Step Indication */}
            <ReasoningChain
              currentStage={currentStage}
              overallDecision={assessment?.overallDecision}
              onSelectStage={(stage) => setCurrentStage(stage)}
              expandAll={expandAll}
              onToggleExpandAll={() => setExpandAll(!expandAll)}
            />

            {/* STEP 1 (L1): Applicant Profile */}
            <div id="step-1-profile">
              <ApplicantForm
                applicant={applicant}
                onChange={handleApplicantChange}
                presets={presets}
                onSelectPreset={handleSelectPreset}
                selectedPresetLabel={selectedPresetLabel}
                onSubmit={handleSubmitApplication}
                isSubmitting={isSubmitting}
                savedApplicationId={savedApplicationId}
                isExpanded={expandAll || currentStage === 1}
                onToggleExpand={() => setCurrentStage(1)}
                onNextStep={() => setCurrentStage(2)}
              />
            </div>

            {/* STEP 2 (L2): Evidence Intake & Extraction */}
            <div id="step-2-evidence">
              <EvidenceManager
                evidenceList={evidenceList}
                evidenceTypes={scenario?.evidenceTypes || []}
                onUpdateEvidence={handleEvidenceChange}
                isExpanded={expandAll || currentStage === 2}
                onToggleExpand={() => setCurrentStage(2)}
                onNextStep={() => setCurrentStage(3)}
              />
            </div>

            {/* STEP 3 (L3): Assessment Engine (Rules & Conflicts) */}
            {assessment && (
              <div id="step-3-assessment">
                <AssessmentViewer
                  assessment={assessment}
                  isExpanded={expandAll || currentStage === 3}
                  onToggleExpand={() => setCurrentStage(3)}
                  onNextStep={() => setCurrentStage(4)}
                />
              </div>
            )}

            {/* STEP 4 & 5 (L4 & L5): Explanation Notice & Decision */}
            {explanation && assessment && (
              <div id="step-4-explanation">
                <ExplanationCard
                  explanation={explanation}
                  overallDecision={assessment.overallDecision}
                  decisionRationale={assessment.decisionRationale}
                  applicantId={applicant.id || savedApplicationId}
                  onNavigateToReviewer={handleNavigateToReviewer}
                  isExpanded={expandAll || currentStage === 4 || currentStage === 5}
                  onToggleExpand={() => setCurrentStage(4)}
                  onNextStep={() => setCurrentStage(6)}
                />
              </div>
            )}

            {/* STEP 6 (L6): Prioritized Next Actions */}
            {nextSteps && (
              <div id="step-6-actions">
                <NextActionsCard
                  nextSteps={nextSteps}
                  onTriggerAction={handleTriggerAction}
                  isExpanded={expandAll || currentStage === 6}
                  onToggleExpand={() => setCurrentStage(6)}
                  onCommitAndReview={() => handleSubmitApplication(true)}
                  onNavigateToReviewer={() => handleNavigateToReviewer(applicant.id || savedApplicationId)}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

          </div>
        )}

        {/* TAB 2: REVIEWER PORTAL */}
        {currentTab === 'reviewer' && (
          <ReviewerPortal
            applications={applications}
            onRefresh={fetchApplications}
            targetAppId={reviewerTargetAppId}
          />
        )}

        {/* TAB 3: ARCHITECTURE & SYSTEM SCHEMA */}
        {currentTab === 'architecture' && (
          <ArchitectureView />
        )}

      </main>

      {/* Global State Inspector Modal for Evaluators / Judges */}
      <ReasoningInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        applicant={applicant}
        evidence={evidenceList}
        assessment={assessment}
        explanation={explanation}
        nextSteps={nextSteps}
      />

      {/* Civic Footer */}
      <footer className="border-t border-dark-800 bg-dark-900 py-8 mt-16 text-center text-xs text-dark-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-semibold text-dark-300">ClearGov Public-Service Decision Support System</span>
          <span className="text-dark-500">Section 508 Compliant • Transparent Algorithmic Governance</span>
        </div>
      </footer>
    </div>
  );
}
