import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';

import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { AnalysisService } from '../../analysis/services';
import { ReplayService } from '../../replay/services';
import { Incident, IncidentDiagnosis, ReplayScenario } from '../interfaces';
import { IngestIncidentDto, ReplayIncidentsDto } from '../dtos';
import { PrismaService } from '@/modules/core/prisma/services';

const include = {
  diagnoses: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
  replays: {
    orderBy: { ranAt: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.IncidentInclude;

type Row = Prisma.IncidentGetPayload<{
  include: typeof include;
}>;

const ANALYZE_LIMIT = 5;
const CACHE_TTL_SECONDS = 3600;

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
    private readonly analysis: AnalysisService,
    private readonly replayer: ReplayService,
  ) { }

  private view(row: Row): Incident {
    const diagnosis = row.diagnoses[0];
    const replay = row.replays[0];

    return {
      id: String(row.id),
      title: row.title,
      method: row.method,
      path: row.path,
      statusCode: row.statusCode,
      requestId: row.requestId,
      timestamp: row.timestamp.toISOString(),
      headers: row.headers as Record<string, string>,
      payload: row.payload as Record<string, unknown>,
      responseBody: row.responseBody as Record<string, unknown>,
      logs: row.logs,
      scenario: row.scenario as ReplayScenario,
      diagnosis: diagnosis
        ? (diagnosis.result as unknown as IncidentDiagnosis)
        : undefined,
      diagnosisEvidenceChecked: diagnosis?.evidenceChecked,
      replayVerified: row.replayVerified,
      lastReplay: replay
        ? {
          mode: replay.mode as 'broken' | 'fixed',
          scenario: row.scenario as ReplayScenario,
          ranAt: replay.ranAt.toISOString(),
          passed: replay.passed,
          assertions: replay.assertions as unknown as Incident['lastReplay'] extends
            infer R
            ? R extends { assertions: infer A }
            ? A
            : never
            : never,
          executionLog: replay.executionLog,
        }
        : undefined,
    };
  }

  async fetchIncidents() {
    const rows = await this.prisma.incident.findMany({
      include,
      orderBy: { timestamp: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      statusCode: row.statusCode,
      timestamp: row.timestamp.toISOString(),
      analyzed: row.diagnoses.length > 0,
      replayVerified: row.replayVerified,
    }));
  }

  async fetchIncidentById(id: string): Promise<Incident> {
    const incidentId = Number(id);

    if (!Number.isSafeInteger(incidentId) || incidentId <= 0) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    const row = await this.prisma.incident.findUnique({
      where: { id: incidentId },
      include,
    });

    if (!row) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    return this.view(row);
  }


  async analyzeIncidents(id: string): Promise<Incident> {
    const incident = await this.fetchIncidentById(id);

    const hits = Number(
      await this.redis.eval(
        `local count = redis.call('INCR', KEYS[1])
       if count == 1 then
         redis.call('EXPIRE', KEYS[1], ARGV[1])
       end
       return count`,
        1,
        `rl:analyze:${id}`,
        '60',
      ),
    );

    if (hits > ANALYZE_LIMIT) {
      throw new HttpException(
        'Too many analysis requests. Wait a minute and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const digest = createHash('sha256')
      .update(
        JSON.stringify([
          incident.method,
          incident.path,
          incident.headers,
          incident.payload,
          incident.statusCode,
          incident.responseBody,
          incident.logs,
        ]),
      )
      .digest('hex');

    const cacheKey = `diag:${id}:${digest}`;

    const cached = await this.redis.get(cacheKey);

    let result: {
      diagnosis: IncidentDiagnosis;
      evidenceChecked: boolean;
    } | null = null;

    if (cached) {
      try {
        result = JSON.parse(cached);
      } catch {
        await this.redis.del(cacheKey);
      }
    }

    if (!result) {
      result = await this.analysis.analyze(incident);

      await this.redis.set(
        cacheKey,
        JSON.stringify(result),
        'EX',
        CACHE_TTL_SECONDS,
      );
    }

    await this.prisma.diagnosis.create({
      data: {
        incidentId: Number(id),
        result: result.diagnosis as unknown as Prisma.InputJsonValue,
        evidenceChecked: result.evidenceChecked,
      },
    });

    return this.fetchIncidentById(id);
  }



  async replayIncidents(
    id: string,
    options: ReplayIncidentsDto,
  ): Promise<Incident> {
    const incidentId = Number(id);

    if (!Number.isSafeInteger(incidentId) || incidentId <= 0) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    const incident = await this.fetchIncidentById(String(incidentId));
    const mode = options.mode ?? 'broken';
    const run = this.replayer.run(incident, mode);

    await this.prisma.$transaction([
      this.prisma.replayRun.create({
        data: {
          incidentId,
          mode,
          passed: run.passed,
          assertions:
            run.assertions as unknown as Prisma.InputJsonValue,
          executionLog: run.executionLog,
        },
      }),
      this.prisma.incident.update({
        where: { id: incidentId },
        data: {
          replayVerified: mode === 'fixed' && run.passed,
        },
      }),
    ]);

    return this.fetchIncidentById(String(incidentId));
  }

  async ingest(dto: IngestIncidentDto) {
    const requestId = dto.requestId || randomUUID();

    const incident = await this.prisma.incident.create({
      data: {
        title: dto.title,
        method: dto.method,
        path: dto.path,
        statusCode: dto.statusCode,
        requestId,
        timestamp: new Date(),
        headers: dto.headers ?? {},
        payload: dto.payload ?? {},
        responseBody: dto.responseBody ?? {},
        logs: dto.logs ?? [],
        scenario: dto.scenario ?? 'http_server_error',
      },
    });

    return {
      id: incident.id,
      requestId: incident.requestId,
    };
  }

}
