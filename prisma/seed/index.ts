
import { PrismaClient } from '@prisma/client';
import { INCIDENTS } from './incidentData';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const incident of INCIDENTS) {
    await prisma.incident.upsert({
      where: { requestId: incident.requestId },
      update: {},
      create: {
        title: incident.title,
        method: incident.method,
        path: incident.path,
        statusCode: incident.statusCode,
        requestId: incident.requestId,
        timestamp: new Date(incident.timestamp),
        headers: incident.headers,
        payload: incident.payload,
        responseBody: incident.responseBody,
        logs: incident.logs,
        scenario: incident.scenario,
        replayVerified: incident.replayVerified,
      },
    });
  }

  console.log(`Seeded ${INCIDENTS.length} incidents.`);
}

main()
  .catch((error) => {
    console.error('Failed to seed incidents:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
