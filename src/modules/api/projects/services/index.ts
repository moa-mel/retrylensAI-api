import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/modules/core/prisma/services';
import { randomBytes } from 'crypto';
import { CreateProjectDto } from '../dtos';

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: PrismaService) { }

    async createProject(options: CreateProjectDto) {
        return this.prisma.project.create({
            data: {
                name: options.name,
                slug: options.slug,
            },
        });
    }

    async findAllProject() {
        return this.prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
}