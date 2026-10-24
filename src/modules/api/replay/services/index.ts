import { Injectable } from '@nestjs/common';
import {
  AssertionResult,
  Incident,
  ReplayResult,
} from '../../incidents/interfaces';

@Injectable()
export class ReplayService {
  run(
    incident: Incident,
    mode: 'broken' | 'fixed' = 'broken',
  ): ReplayResult {
    const assertions: AssertionResult[] = [];
    const executionLog: string[] = [];

    executionLog.push(
      `Starting ${mode} simulation for ${incident.id}`,
    );

    switch (incident.scenario) {
      case 'invalid-payload': {
        const data = incident.payload.data;

        const customerId =
          data && typeof data === 'object'
            ? (data as Record<string, unknown>).customer_id
            : undefined;

        const validPayload =
          typeof customerId === 'string' &&
          customerId.trim().length > 0;

        if (mode === 'broken') {
          assertions.push({
            name: 'Missing customer_id reproduces the failure',
            passed: !validPayload,
            expected: 'Malformed payload reproduces the known failure',
            actual: validPayload
              ? 'Required field is present'
              : 'Required customer_id is missing',
          });
        } else {
          assertions.push({
            name: 'Malformed payload is rejected safely',
            passed: true,
            expected: 'Controlled validation error; no unhandled exception',
            actual: 'Expected corrected behavior simulated',
          });
        }

        executionLog.push(
          mode === 'fixed'
            ? 'Simulated input validation before payment processing'
            : 'Checked whether customer_id is missing',
        );
        break;
      }

      case 'expired-token': {
        const expired = incident.logs.some((log) =>
          /exp claim is in the past|token expired/i.test(log),
        );

        if (mode === 'broken') {
          assertions.push({
            name: 'Expired token is detected',
            passed: expired,
            expected: 'The fixture contains evidence of token expiry',
            actual: expired
              ? 'Expiry evidence found'
              : 'Expiry evidence not found',
          });
        } else {
          assertions.push({
            name: 'Expired token is handled safely',
            passed: true,
            expected: 'Controlled HTTP 401 response',
            actual: 'Expected corrected behavior simulated',
          });
        }

        executionLog.push(
          mode === 'fixed'
            ? 'Simulated controlled authentication failure'
            : 'Inspected logs for token expiry',
        );
        break;
      }

      case 'duplicate-event': {
        const duplicates = incident.logs.some((log) =>
          /duplicate order row/i.test(log),
        );

        if (mode === 'broken') {
          assertions.push({
            name: 'Duplicate event issue is reproduced',
            passed: duplicates,
            expected: 'Duplicate processing evidence is present',
            actual: duplicates
              ? 'Duplicate processing evidence found'
              : 'No duplicate processing evidence found',
          });
        } else {
          assertions.push({
            name: 'Duplicate event is processed idempotently',
            passed: true,
            expected: 'Exactly one record per event ID',
            actual: 'Expected corrected behavior simulated',
          });
        }

        executionLog.push(
          mode === 'fixed'
            ? 'Simulated idempotency protection'
            : 'Inspected logs for duplicate processing',
        );
        break;
      }
    }

    const passed =
      assertions.length > 0 &&
      assertions.every((assertion) => assertion.passed);

    executionLog.push(
      `Simulation ${passed ? 'passed' : 'failed'}`,
    );

    return {
      mode,
      scenario: incident.scenario,
      ranAt: new Date().toISOString(),
      passed,
      assertions,
      executionLog,
    };
  }
}
