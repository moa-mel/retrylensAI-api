import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/modules/core/prisma/services';
import { randomBytes } from 'crypto';
import { CreateProjectDto } from '../dtos';

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: PrismaService) { }

    async createProject(options: CreateProjectDto) {
        const apiKey = `rl_live_${randomBytes(24).toString('hex')}`;

        return this.prisma.project.create({
            data: {
                name: options.name,
                slug: options.slug,
                apiKey,
            },
        });
    }

    async findProjectByApiKey(apiKey: string) {
        const project = await this.prisma.project.findUnique({
            where: { apiKey },
        });

        if (!project) {
            throw new NotFoundException('Invalid API key');
        }

        return project;
    }

    async findAllProject() {
        return this.prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
}