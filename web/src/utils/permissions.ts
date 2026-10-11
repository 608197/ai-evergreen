import type { Role, UserIdentity } from '../types/domain';

export type ActionType =
  | 'view_screens'
  | 'confirm_override_edge'
  | 'approve_plan'
  | 'approve_reject_missing_test'
  | 'sign_promotion'
  | 'hold_resume_rollout'
  | 'request_rollback'
  | 'confirm_manual_rollback'
  | 'propose_contract'
  | 'view_controls_memory'
  | 'export_evidence'
  | 'view_portfolio';

export interface PermissionContext {
  workloadId?: string;
  eventId?: string;
  workloadOwnerId?: string;
  earlierContributorIds?: string[];
  currentUser?: UserIdentity;
}

export interface CanResult {
  allowed: boolean;
  reason?: string;
}

export function can(
  role: Role,
  action: ActionType,
  context?: PermissionContext
): CanResult {
  // Check separation of duties for promotion approval
  if (action === 'sign_promotion' && context?.currentUser && context.earlierContributorIds) {
    if (context.earlierContributorIds.includes(context.currentUser.id)) {
      return {
        allowed: false,
        reason:
          'You took part in earlier steps of this event, so a different approver must sign.',
      };
    }
  }

  switch (action) {
    case 'view_screens':
      return { allowed: true };

    case 'confirm_override_edge':
      if (role === 'app_owner' || role === 'platform_eng') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Only an Application Owner or AI Platform Engineer can confirm or override a graph edge.',
      };

    case 'approve_plan':
      if (role === 'qa_lead') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Only a QA / Test Lead can approve the regression plan.',
      };

    case 'approve_reject_missing_test':
      if (role === 'qa_lead' || role === 'app_owner') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Only a QA Lead or Application Owner can approve or reject proposed tests.',
      };

    case 'sign_promotion':
      if (
        role === 'app_owner' ||
        role === 'qa_lead' ||
        role === 'risk_approver' ||
        role === 'data_owner' ||
        role === 'sre'
      ) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Your role does not have authority to sign production promotion for this workload.',
      };

    case 'hold_resume_rollout':
      if (role === 'sre' || role === 'platform_eng') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Only SRE / Operations or AI Platform Engineer can hold or resume a live rollout.',
      };

    case 'request_rollback':
      if (role === 'sre' || role === 'platform_eng') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Only SRE or Platform Engineer can initiate a manual rollback request.',
      };

    case 'confirm_manual_rollback':
      if (role === 'app_owner' || role === 'sre' || role === 'platform_eng') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Second confirmer must be an Application Owner, SRE, or AI Platform Engineer.',
      };

    case 'propose_contract':
      if (role === 'app_owner' || role === 'platform_eng') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Only Application Owners or Platform Engineers can propose contract changes.',
      };

    case 'view_controls_memory':
      return { allowed: true };

    case 'export_evidence':
      if (role === 'app_owner' || role === 'risk_approver' || role === 'gov_audit') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Export requires Application Owner, Risk Approver, or Governance/Audit role.',
      };

    case 'view_portfolio':
      if (role === 'executive' || role === 'gov_audit' || role === 'platform_eng') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Portfolio horizon is primarily accessible to Executive, Architecture, or Governance roles.',
      };

    default:
      return { allowed: false, reason: 'Action not permitted.' };
  }
}
