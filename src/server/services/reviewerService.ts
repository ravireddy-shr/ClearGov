import { dbInstance, StoredApplication, StoredAuditLog } from '../db/database.js';
import { applicationService, FullApplicationResponse } from './applicationService.js';

export interface ReviewerActionRequest {
  action: 'approve_override' | 'reject' | 'request_info';
  notes: string;
  reviewerId?: string;
  reviewerRole?: string;
}

export class ReviewerService {
  /**
   * Retrieves all applications currently pending manual reviewer action.
   */
  public getReviewQueue(): FullApplicationResponse[] {
    const all = applicationService.listApplications();
    return all.filter(app => 
      app.status === 'needs_review' || 
      app.status === 'needs_more_info' ||
      app.overallDecision === 'needs_human_review' ||
      app.overallDecision === 'more_evidence_needed'
    );
  }

  /**
   * Executes reviewer decision: approve override, reject with findings, or request supplemental evidence.
   */
  public executeAction(
    id: string,
    payload: ReviewerActionRequest
  ): { application: FullApplicationResponse; auditLogs: StoredAuditLog[] } | null {
    const updated = dbInstance.updateReviewerDecision(
      id,
      payload.action,
      payload.notes,
      payload.reviewerId || 'Senior Reviewer S. Jenkins'
    );

    if (!updated) return null;

    const fullApp = applicationService.mapStoredToFull(updated);
    const auditLogs = dbInstance.getAuditLogs(id);

    return { application: fullApp, auditLogs };
  }

  /**
   * Get complete audit history of an application.
   */
  public getAuditHistory(id: string): StoredAuditLog[] {
    return dbInstance.getAuditLogs(id);
  }
}

export const reviewerService = new ReviewerService();
