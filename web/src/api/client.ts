/**
 * AI Evergreen Control Plane API Client
 *
 * Provides type-safe REST bindings between the React 19 UI and the FastAPI backend.
 * Falls back gracefully to cached/seed state when backend is offline or starting up.
 */

const API_BASE = '/api/v1';

export interface BackendHealthResponse {
  status: string;
  timestamp: string;
  graph_nodes: number;
  graph_edges: number;
  environment: string;
}

export interface BackendEstateResponse {
  status: string;
  timestamp: string;
  summary: {
    workloads_count: number;
    models_count: number;
    agents_count: number;
    critical_workloads_count: number;
    graph_nodes: number;
    graph_edges: number;
  };
  applications: Array<{
    application_id: string;
    name: string;
    criticality: string;
    active_model_id: string;
    owner: string;
    tags?: Record<string, string>;
  }>;
  models: Array<{
    model_id: string;
    name: string;
    provider: string;
  }>;
  agents: Array<{
    agent_id: string;
    name: string;
    role: string;
  }>;
  graph: {
    nodes: Array<{
      id: string;
      type: string;
      name: string;
      criticality: string;
      owner: string;
      provider?: string;
    }>;
    edges: Array<{
      source: string;
      target: string;
      type: string;
      confidence: number;
    }>;
  };
}

export interface BackendEventItem {
  event_id: string;
  source: string;
  model_or_component_id: string;
  current_version: string;
  candidate_version: string;
  change_type: string;
  received_at: string;
  correlation_id: string;
  raw_payload_ref?: string;
}

export interface BackendQualificationResponse {
  recommendation: {
    recommendation_id: string;
    workload_id: string;
    treatment: 'MIGRATE' | 'CANARY' | 'INVESTIGATE' | 'BLOCK';
    candidate_model_id: string;
    failed_invariants: string[];
    confidence_score: number;
    correlation_id: string;
    created_at: string;
  };
  evidence_package: {
    package_id: string;
    package_digest: string | null;
    correlation_id: string;
  };
  plan_summary: {
    total_tests: number;
    critical_tests: number;
  };
}

export interface BackendApprovalResponse {
  status: string;
  approval_record: {
    approval_id: string;
    recommendation_id: string;
    workload_id: string;
    approver_email: string;
    approver_role: string;
    status: string;
    decision_rationale: string;
    signature_hash: string;
    signed_at: string;
  };
  tamper_evident_seal: string | null;
}

export interface BackendCanaryResponse {
  action: 'CONTINUE_CANARY' | 'ROLLBACK_TO_LAST_KNOWN_GOOD';
  status: string;
  workload_id: string;
  message?: string;
  metrics_evaluated?: Record<string, number>;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API ${response.status} (${response.statusText}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  /**
   * Check backend server health.
   */
  async checkHealth(): Promise<BackendHealthResponse | null> {
    try {
      return await request<BackendHealthResponse>('/health');
    } catch {
      return null;
    }
  },

  /**
   * Fetch enterprise estate catalog and graph topology.
   */
  async fetchEstate(): Promise<BackendEstateResponse | null> {
    try {
      return await request<BackendEstateResponse>('/estate');
    } catch {
      return null;
    }
  },

  /**
   * Fetch change signals list.
   */
  async fetchEvents(): Promise<{ events: BackendEventItem[]; total: number } | null> {
    try {
      return await request<{ events: BackendEventItem[]; total: number }>('/events');
    } catch {
      return null;
    }
  },

  /**
   * Fetch deterministic blast radius calculation for an event.
   */
  async fetchBlastRadius(eventId: string): Promise<any | null> {
    try {
      return await request<any>(`/events/${eventId}/blast-radius`);
    } catch {
      return null;
    }
  },

  /**
   * Run differential qualification through the Python evaluation harness and Trusted Kernel.
   */
  async runQualification(
    eventId: string,
    workloadId: string,
    candidateModelId: string
  ): Promise<BackendQualificationResponse | null> {
    try {
      return await request<BackendQualificationResponse>('/evaluations/run', {
        method: 'POST',
        body: JSON.stringify({
          event_id: eventId,
          workload_id: workloadId,
          candidate_model_id: candidateModelId,
        }),
      });
    } catch (err) {
      console.warn('Backend qualification call failed, falling back to client-side simulator:', err);
      return null;
    }
  },

  /**
   * Submit human approval decision to Trusted Kernel for cryptographic signature.
   */
  async submitApproval(payload: {
    recommendationId: string;
    approverEmail: string;
    approverRole: string;
    status: 'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL';
    decisionRationale: string;
  }): Promise<BackendApprovalResponse | null> {
    try {
      return await request<BackendApprovalResponse>('/promotions/approve', {
        method: 'POST',
        body: JSON.stringify({
          recommendation_id: payload.recommendationId,
          approver_email: payload.approverEmail,
          approver_role: payload.approverRole,
          status: payload.status,
          decision_rationale: payload.decisionRationale,
        }),
      });
    } catch (err) {
      console.warn('Backend approval call failed:', err);
      return null;
    }
  },

  /**
   * Evaluate live canary telemetry and execute rollback if thresholds breached.
   */
  async evaluateCanary(
    workloadId: string,
    metrics: Record<string, number>
  ): Promise<BackendCanaryResponse | null> {
    try {
      return await request<BackendCanaryResponse>('/canary/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          workload_id: workloadId,
          current_metrics: metrics,
        }),
      });
    } catch {
      return null;
    }
  },

  /**
   * Retrieve behavioural memory contracts, invariants, and rollback policies.
   */
  async fetchMemory(): Promise<any | null> {
    try {
      return await request<any>('/memory');
    } catch {
      return null;
    }
  },

  /**
   * Inject demo failure trigger into backend state.
   */
  async injectDemoFailure(failureType: string, targetWorkloadId?: string): Promise<any | null> {
    try {
      return await request<any>('/demo/inject-failure', {
        method: 'POST',
        body: JSON.stringify({
          failure_type: failureType,
          target_workload_id: targetWorkloadId || 'app-refund-agent',
        }),
      });
    } catch {
      return null;
    }
  },

  /**
   * Reset backend demo state back to pristine seed baseline.
   */
  async resetDemoState(): Promise<any | null> {
    try {
      return await request<any>('/demo/reset', {
        method: 'POST',
      });
    } catch {
      return null;
    }
  },
};

