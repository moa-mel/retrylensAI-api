
import {
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/modules/core/prisma/services';

type JsonObject = Record<string, unknown>;

const SENSITIVE_KEY =
  /password|secret|token|authorization|cookie|api[-_]?key|credential/i;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as JsonObject).map(([key, item]) => [
        key,
        SENSITIVE_KEY.test(key) ? '[REDACTED]' : sanitize(item),
      ]),
    );
  }

  if (typeof value === 'string') {
    return value.slice(0, 10_000);
  }

  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  return String(value ?? '');
}

function asJson(value: unknown): Prisma.InputJsonValue {
  const result = sanitize(value);
  return (result ?? {}) as Prisma.InputJsonValue;
}

@Injectable()
export class IncidentCaptureMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IncidentCaptureMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    res.once('finish', () => {
      if (res.statusCode < 500 || res.statusCode > 599) {
        return;
      }

      // Don't let failures in RetryLens's own incident-management
      // endpoints generate unnecessary incident noise.
      if (req.path.startsWith('/api/v1/incidents')) {
        return;
      }

      void this.capture(req, res, startedAt).catch((error: unknown) => {
        this.logger.error(
          'Failed to persist captured incident',
          error instanceof Error ? error.stack : String(error),
        );
      });
    });

    next();
  }

  private async capture(
    req: Request,
    res: Response,
    startedAt: number,
  ): Promise<void> {
    const requestId = randomUUID();

    const safeHeaders = {
      'content-type': req.headers['content-type'] ?? '',
      'user-agent': req.headers['user-agent'] ?? '',
    };

    const safePayload =
      req.body && typeof req.body === 'object' ? req.body : {};

    const incident = await this.prisma.incident.create({
      data: {
        title: `${req.method} ${req.path} returned ${res.statusCode}`,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        requestId,
        timestamp: new Date(),
        headers: asJson(safeHeaders),
        payload: asJson(safePayload),
        responseBody: asJson({
          statusCode: res.statusCode,
          message: 'Server request failed',
        }),
        logs: [
          `HTTP ${req.method} ${req.path}`,
          `Status: ${res.statusCode}`,
          `Duration: ${Date.now() - startedAt}ms`,
        ],
        scenario: 'http_server_error',
      },
    });

    this.logger.warn(
      `Captured incident ${incident.id}: ${req.method} ${req.path} (${res.statusCode})`,
    );
  }
}
