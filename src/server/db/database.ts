import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Store DB in local project directory or data dir
const DB_PATH = path.resolve(process.cwd(), 'cleargov.db');

export interface StoredApplication {
  id: string; // e.g. CG-2026-001
  applicant_name: string;
  applicant_email: string;
  scenario_id: string;
  status: string; // 'submitted' | 'assessed' | 'proceeding' | 'needs_more_info' | 'rejected' | 'needs_review' | 'approved_by_reviewer' | 'rejected_by_reviewer' | 'info_requested'
  overall_decision: string; // 'sufficient_to_proceed' | 'condition_not_satisfied' | 'more_evidence_needed' | 'needs_human_review'
  applicant_data_json: string;
  evidence_list_json: string;
  assessment_json: string;
  explanation_json: string;
  next_steps_json: string;
  reviewer_notes: string | null;
  reviewer_action: string | null;
  reviewer_action_timestamp: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoredAuditLog {
  id: number;
  application_id: string;
  actor: string; // 'system' | 'reviewer' | 'applicant'
  action: string;
  details: string;
  timestamp: string;
}

export class ClearGovDatabase {
  private db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync(DB_PATH);
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        status TEXT NOT NULL,
        overall_decision TEXT NOT NULL,
        applicant_data_json TEXT NOT NULL,
        evidence_list_json TEXT NOT NULL,
        assessment_json TEXT NOT NULL,
        explanation_json TEXT NOT NULL,
        next_steps_json TEXT NOT NULL,
        reviewer_notes TEXT,
        reviewer_action TEXT,
        reviewer_action_timestamp TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id TEXT NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `);
  }

  public getApplication(id: string): StoredApplication | null {
    const stmt = this.db.prepare('SELECT * FROM applications WHERE id = ?');
    const result = stmt.get(id) as unknown as StoredApplication | undefined;
    return result || null;
  }

  public getAllApplications(): StoredApplication[] {
    const stmt = this.db.prepare('SELECT * FROM applications ORDER BY updated_at DESC');
    return stmt.all() as unknown as StoredApplication[];
  }

  public getApplicationsByStatus(status: string): StoredApplication[] {
    const stmt = this.db.prepare('SELECT * FROM applications WHERE status = ? OR overall_decision = ? ORDER BY updated_at DESC');
    return stmt.all(status, status) as unknown as StoredApplication[];
  }

  public saveApplication(app: StoredApplication): void {
    const existing = this.getApplication(app.id);
    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE applications SET
          applicant_name = ?,
          applicant_email = ?,
          scenario_id = ?,
          status = ?,
          overall_decision = ?,
          applicant_data_json = ?,
          evidence_list_json = ?,
          assessment_json = ?,
          explanation_json = ?,
          next_steps_json = ?,
          reviewer_notes = ?,
          reviewer_action = ?,
          reviewer_action_timestamp = ?,
          updated_at = ?
        WHERE id = ?
      `);
      stmt.run(
        app.applicant_name,
        app.applicant_email,
        app.scenario_id,
        app.status,
        app.overall_decision,
        app.applicant_data_json,
        app.evidence_list_json,
        app.assessment_json,
        app.explanation_json,
        app.next_steps_json,
        app.reviewer_notes,
        app.reviewer_action,
        app.reviewer_action_timestamp,
        app.updated_at,
        app.id
      );
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO applications (
          id, applicant_name, applicant_email, scenario_id, status, overall_decision,
          applicant_data_json, evidence_list_json, assessment_json, explanation_json,
          next_steps_json, reviewer_notes, reviewer_action, reviewer_action_timestamp,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        app.id,
        app.applicant_name,
        app.applicant_email,
        app.scenario_id,
        app.status,
        app.overall_decision,
        app.applicant_data_json,
        app.evidence_list_json,
        app.assessment_json,
        app.explanation_json,
        app.next_steps_json,
        app.reviewer_notes,
        app.reviewer_action,
        app.reviewer_action_timestamp,
        app.created_at,
        app.updated_at
      );
    }
  }

  public updateReviewerDecision(
    id: string,
    action: 'approve_override' | 'reject' | 'request_info',
    notes: string,
    reviewerId: string = 'reviewer_sarah_jenkins'
  ): StoredApplication | null {
    const app = this.getApplication(id);
    if (!app) return null;

    let newStatus = app.status;
    let newDecision = app.overall_decision;

    if (action === 'approve_override') {
      newStatus = 'approved_by_reviewer';
      newDecision = 'sufficient_to_proceed';
    } else if (action === 'reject') {
      newStatus = 'rejected_by_reviewer';
      newDecision = 'condition_not_satisfied';
    } else if (action === 'request_info') {
      newStatus = 'info_requested';
      newDecision = 'more_evidence_needed';
    }

    const now = new Date().toISOString();
    app.status = newStatus;
    app.overall_decision = newDecision;
    app.reviewer_action = action;
    app.reviewer_notes = notes;
    app.reviewer_action_timestamp = now;
    app.updated_at = now;

    this.saveApplication(app);

    // Add audit log
    this.addAuditLog(
      id,
      reviewerId,
      `REVIEWER_ACTION_${action.toUpperCase()}`,
      `Reviewer executed "${action}": ${notes}`
    );

    return app;
  }

  public addAuditLog(applicationId: string, actor: string, action: string, details: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (application_id, actor, action, details, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(applicationId, actor, action, details, new Date().toISOString());
  }

  public getAuditLogs(applicationId: string): StoredAuditLog[] {
    const stmt = this.db.prepare('SELECT * FROM audit_logs WHERE application_id = ? ORDER BY id ASC');
    return stmt.all(applicationId) as unknown as StoredAuditLog[];
  }
}

export const dbInstance = new ClearGovDatabase();
