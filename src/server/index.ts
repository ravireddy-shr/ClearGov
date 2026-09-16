import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { applicationService } from './services/applicationService.js';
import { reviewerService } from './services/reviewerService.js';
import { dbInstance } from './db/database.js';
import { seedDatabase, SEED_APPLICATIONS } from './db/seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initial seed if empty
const existingApps = applicationService.listApplications();
if (existingApps.length === 0) {
  console.log('Database empty. Running initial seed...');
  seedDatabase(dbInstance).catch(err => console.error('Seed error:', err));
}

// 1. Scenario Definition
app.get('/api/scenario', (req, res) => {
  res.json(applicationService.getScenario());
});

// 2. Preset Seed Examples (for 1-click test in frontend)
app.get('/api/presets', (req, res) => {
  res.json(SEED_APPLICATIONS.map(seed => ({
    label: seed.label,
    expectedOutcome: seed.expectedOutcome,
    applicant: seed.applicant,
    evidence: seed.evidence
  })));
});

// 3. Live Assessment (without saving, for interactive form instant feedback)
app.post('/api/assess', async (req, res) => {
  try {
    const { applicant, evidence, preferLlm, apiKey } = req.body;
    if (!applicant) {
      return res.status(400).json({ error: 'applicant data is required' });
    }
    const result = await applicationService.evaluateLive(
      applicant,
      evidence || [],
      { preferLlm, apiKey }
    );
    res.json(result);
  } catch (err: any) {
    console.error('Assessment evaluation error:', err);
    res.status(500).json({ error: err.message || 'Internal evaluation error' });
  }
});

// 4. Submit & Persist Application
app.post('/api/applications', async (req, res) => {
  try {
    const { applicant, evidence, preferLlm, apiKey } = req.body;
    if (!applicant) {
      return res.status(400).json({ error: 'applicant data is required' });
    }
    const appRecord = await applicationService.submitApplication(
      applicant,
      evidence || [],
      { preferLlm, apiKey }
    );
    res.status(201).json(appRecord);
  } catch (err: any) {
    console.error('Submit application error:', err);
    res.status(500).json({ error: err.message || 'Submission failed' });
  }
});

// 5. List Applications
app.get('/api/applications', (req, res) => {
  const status = req.query.status as string | undefined;
  const list = applicationService.listApplications(status);
  res.json(list);
});

// 6. Get Single Application + Audit Trail
app.get('/api/applications/:id', (req, res) => {
  const appRecord = applicationService.getApplication(req.params.id);
  if (!appRecord) {
    return res.status(404).json({ error: 'Application not found' });
  }
  const auditLogs = reviewerService.getAuditHistory(req.params.id);
  res.json({ ...appRecord, auditLogs });
});

// 7. Reviewer Action Execution
app.post('/api/applications/:id/reviewer-action', (req, res) => {
  try {
    const { action, notes, reviewerId } = req.body;
    if (!action || !notes) {
      return res.status(400).json({ error: 'action and notes are required' });
    }
    const result = reviewerService.executeAction(req.params.id, {
      action,
      notes,
      reviewerId
    });
    if (!result) {
      return res.status(404).json({ error: 'Application not found or could not update' });
    }
    res.json(result);
  } catch (err: any) {
    console.error('Reviewer action error:', err);
    res.status(500).json({ error: err.message || 'Action execution failed' });
  }
});

// 8. Re-seed database
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase(dbInstance);
    res.json({ message: 'Database successfully re-seeded with all test cases.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve frontend build if present
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`ClearGov Server listening on http://localhost:${PORT}`);
});
