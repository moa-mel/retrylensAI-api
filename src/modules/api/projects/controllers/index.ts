import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProjectDto } from '../dtos';
import { ProjectsService } from '../services';


@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(@Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(dto);
  }

  @Get()
  async findAllProject() {
    return this.projectsService.findAllProject();
  }


}