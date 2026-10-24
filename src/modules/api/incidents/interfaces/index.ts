export type ReplayScenario =
  | 'invalid-payload'
  | 'expired-token'
  | 'duplicate-event';

export interface IncidentEvidence {
  source: string;
  excerpt: string;
  explanation: string;
}

export interface IncidentDiagnosis {
  summary: string;
  rootCause: string;
  confidence: number;
  evidence: IncidentEvidence[];
  recommendedFix: string;
  regressionTests: string[];
}

export interface AssertionResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface ReplayResult {
  mode: 'broken' | 'fixed';
  scenario: ReplayScenario;
  ranAt: string;
  passed: boolean;
  assertions: AssertionResult[];
  executionLog: string[];
}

export interface Incident {
  id: string;
  title: string;
  method: string;
  path: string;
  statusCode: number;
  requestId: string;
  timestamp: string;
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  responseBody: Record<string, unknown>;
  logs: string[];
  scenario: ReplayScenario;
  diagnosis?: IncidentDiagnosis;
  diagnosisEvidenceChecked?: boolean;
  replayVerified: boolean;
  lastReplay?: ReplayResult;
}
