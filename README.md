# ClearGov — Explainable Decision-Support System for Public-Service Applications

ClearGov is an explainable, auditable decision-support system engineered for public-service and government benefit eligibility. It transforms an applicant's submission into a transparent, inspectable, six-link reasoning chain:

$$\text{Applicant Information} \longrightarrow \text{Evidence} \longrightarrow \text{Assessment} \longrightarrow \text{Explanation} \longrightarrow \text{Decision} \longrightarrow \text{Next Action}$$

ClearGov eliminates opaque "black-box" pass/fail forms and replaces them with an inspectable rules engine, cross-document contradiction detection, optical clarity verification, four-pillared citizen explanations, prioritized next-step guidance, and a persistent administrative reviewer workflow with full audit logging.

---

## The Four Ground-Truth Outcome States

ClearGov evaluates applications across four distinct, mutually distinguishable outcome states governed by a strict hierarchical precedence engine:

| Outcome State | Trigger Condition | Precedence Level |
| :--- | :--- | :--- |
| **`needs_human_review`** | Cross-document contradiction (e.g., DOB mismatch across ID & College letter), unreadable document scan ($\text{OCR} < 70\%$), or borderline metric within 5% of statutory cutoff. | **Precedence 1 (Highest)** |
| **`condition_not_satisfied`** | Conclusive failure of a mandatory statutory condition based on authentic evidence (e.g., $\text{GPA} = 2.65 < 3.20$ minimum, or income exceeds cap). | **Precedence 2** |
| **`more_evidence_needed`** | Mandatory supporting documentation is absent from the submission (e.g., omitted Form 1040 / Bank Statement). | **Precedence 3** |
| **`sufficient_to_proceed`** | 100% of statutory eligibility criteria verified with authentic, high-confidence evidence. | **Precedence 4 (Base)** |

---

## 6 Seeded Real-World Cases (Pre-Loaded in SQLite)

ClearGov includes six pre-seeded applications so evaluators can inspect every outcome state immediately without constructing manual test data:

1. **`CG-2026-001` (Elena Vance) — Clean Pass (`sufficient_to_proceed`)**
   - In-state resident (CA), 15 credits at State University of Tech, household income \$28,500 ($\le \$45,000$), GPA 3.82 ($\ge 3.20$), no duplicate funding.
   - Result: All 6 conditions verified. Status: `proceeding`.
2. **`CG-2026-002` (Marcus Chen) — Missing Evidence (`more_evidence_needed`)**
   - Missing IRS Form 1040 / Bank Statement.
   - Result: Condition COND-03 evaluates to `insufficient_evidence` (issue: `missing`). Primary Action: "Upload Missing Document for Household Income Eligibility Cap".
3. **`CG-2026-003` (Aaliyah Patel) — Contradictory Evidence (`needs_human_review`)**
   - State ID records DOB as `1999-05-12`; University Enrollment Letter records DOB as `2003-11-04`. Self-reported income (\$24,000) also conflicts with tax document (\$34,500).
   - Result: 2 cross-document conflicts detected. Condition COND-01 and COND-03 flagged as `contradictory`.
4. **`CG-2026-004` (Devon Miller) — Statutory Disqualification (`condition_not_satisfied`)**
   - Official transcript confirms cumulative GPA is 2.65, violating the statutory 3.20 requirement.
   - Result: Condition COND-04 evaluates to `not_satisfied`. Status: `rejected`.
5. **`CG-2026-005` (Sophia Ramos) — Borderline Income (`needs_human_review`)**
   - Verified household income is \$44,200, which falls within the 5% administrative confirmation band (\$42,750 – \$45,000).
   - Result: Condition COND-03 flagged with issue: `requires_confirmation`.
6. **`CG-2026-006` (Liam O'Connor) — Unreadable Scan (`needs_human_review`)**
   - Mobile camera scan of transcript has an OCR confidence score of 42% (below 70% threshold).
   - Result: Condition COND-04 flagged with issue: `unreadable`.

---

## Architecture & Code Map: The Five Links of the Chain

For live judging and codebase audits, here is the exact architectural mapping of where each link of the reasoning chain lives in the code:

```
ClearGov System Architecture
├── Link 1: Applicant Information
│   ├── Backend Contract : src/server/engine/assessmentEngine.ts (interface ApplicantData)
│   └── Frontend View    : src/client/components/ApplicantForm.tsx
│
├── Link 2: Evidence Intake & Extraction
│   ├── Backend Contract : src/server/engine/assessmentEngine.ts (interface SubmittedEvidence)
│   └── Frontend View    : src/client/components/EvidenceManager.tsx
│
├── Link 3: Assessment Engine (Core Rules & Conflict Detection)
│   ├── Schema Definition : src/server/engine/scenarioSchema.ts (SCHOLARSHIP_SCENARIO)
│   ├── Evaluation Rules  : src/server/engine/assessmentEngine.ts (AssessmentEngine.evaluate())
│   ├── Cross-Doc Check   : src/server/engine/assessmentEngine.ts (detectCrossDocumentConflicts())
│   └── Frontend View     : src/client/components/AssessmentViewer.tsx
│
├── Link 4: Explanation Layer
│   ├── Synthesis Engine  : src/server/engine/explanationEngine.ts (ExplanationEngine.generateExplanation())
│   ├── 4 Pillars Notice  : What Was Established | Unestablished | Issues & Conflicts | Proceeding Impact
│   └── Frontend View     : src/client/components/ExplanationCard.tsx
│
├── Link 5: Decision & Rollup Precedence
│   ├── Precedence Logic  : src/server/engine/assessmentEngine.ts (Rollup Algorithm)
│   ├── Persistence Store : src/server/db/database.ts (SQLite tables `applications` & `audit_logs`)
│   └── Reviewer Action   : src/server/services/reviewerService.ts (executeAction())
│
└── Link 6: Next Action Guidance
    ├── Prioritization   : src/server/engine/nextStepEngine.ts (NextStepEngine.generateNextSteps())
    └── Frontend View    : src/client/components/NextActionsCard.tsx
```

---

## Quickstart & Local Setup

### Prerequisites
- **Node.js**: v20+ or v25+ (Uses native built-in `node:sqlite` — zero C++ compilers or node-gyp required)
- **npm**: v10+

### Installation & Run

1. **Clone or Navigate to Project**:
   ```bash
   cd c:\ClearGov
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Automated Test Verification Suite**:
   Runs the rules engine against all six seed cases and validates assertions:
   ```bash
   npm test
   ```

4. **Start ClearGov** (Single-Command Production Server):
   ```bash
   npm start
   ```
   ClearGov will start on `http://localhost:3001` with both the REST API and the pre-built React frontend.

5. **OR Start in Development Mode** (Hot-Reloading Server + Vite):
   ```bash
   npm run dev
   ```
   - Vite Client: `http://localhost:5173`
   - Express Backend API: `http://localhost:3001`

---

## Environment Variables (Optional)

Create a `.env` file in the project root:

```env
PORT=3001
# Optional: Provide Anthropic API key to enable LLM-synthesized citizen letters.
# If omitted, ClearGov automatically uses its 100% deterministic rule-based explanation engine (zero hallucination).
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

## How to Test During a Live Demo / Judging

### Test 1: Real-Time Input Mutation (Interactive Explainability)
1. Open `http://localhost:3001` in your browser.
2. Select **Case 1 (Elena Vance - Clean Pass)**. Notice all 6 conditions are green, and the status is `Sufficient to Proceed`.
3. In the form, change **Reported Cumulative GPA** from `3.82` down to `2.40`.
4. Observe:
   - Condition COND-04 instantly turns red (`not_satisfied`).
   - The overall status flips to `Condition Not Satisfied`.
   - The Explanation notice instantly states: *"Verified cumulative GPA of 2.40 does not meet the mandatory 3.20 threshold."*
   - Next Steps updates to: *"Review Appeal or Future Cycle Options for Minimum Academic Merit"*.

### Test 2: Simulating Unreadable or Missing Evidence
1. Scroll down to the **Evidence Manager** card.
2. Click the **Delete** icon next to the Tax Return document.
3. Observe: Condition COND-03 instantly switches to `insufficient_evidence` with issue `missing`, and status changes to `More Evidence Needed`.
4. Click the **Refresh/Simulate** icon on the Transcript document to toggle its OCR clarity down to 42%.
5. Observe: The assessment engine detects low confidence and flags the condition with issue `unreadable`.

### Test 3: Reviewer Journey & Audit Log Persistence
1. Click the **Reviewer Portal** tab in the top navigation bar.
2. Select application **`CG-2026-003` (Aaliyah Patel)** from the queue.
3. Observe the **"Exact Impediment Analysis"** and **"Side-by-Side Evidence Discrepancy View"** highlighting the exact date of birth mismatch across the Government ID and College Enrollment verification.
4. Click **"Take Administrative Action"**.
5. Select **Approve (Override)**, enter reviewer audit notes (e.g., *"Confirmed official birth certificate with Registrar on 09/16/2026. Typo in enrollment letter resolved."*), and click **Commit Decision to Database**.
6. Observe:
   - Application status updates in SQLite to `approved_by_reviewer` and decision to `sufficient_to_proceed`.
   - The immutable audit trail records the reviewer name, timestamp, and justification notes.
   - The pending review badge in the navbar updates.

### Test 4: Inspect Raw System Payloads
1. Click the **Audit JSON** button in the navbar.
2. Inspect the raw JSON outputs of `assessmentOutput.json`, `explanationNotice.json`, `nextStepPlan.json`, and `submittedEvidence[].json`.

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/scenario` | Returns the scenario definition with conditions, evidence types, and rules. |
| `GET` | `/api/presets` | Returns the six pre-configured seed profiles for 1-click evaluator testing. |
| `POST` | `/api/assess` | Stateless live assessment of applicant data + evidence without database commit. |
| `POST` | `/api/applications` | Submits application, executes reasoning chain, and persists to SQLite. |
| `GET` | `/api/applications` | Lists all applications from SQLite with filtering support (`?status=...`). |
| `GET` | `/api/applications/:id` | Retrieves full application file with complete immutable audit history. |
| `POST` | `/api/applications/:id/reviewer-action` | Executes reviewer decision (`approve_override`, `reject`, `request_info`) and appends audit log. |
| `POST` | `/api/seed` | Resets and re-seeds SQLite database with the six reference applications. |
| `GET` | `/api/health` | Health check endpoint. |
