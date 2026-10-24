import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IncidentsService } from '../services';
import { ReplayIncidentsDto } from '../dtos';

@Controller('incidents')
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) { }

    @Get()
    async fetchIncidents() {
        return this.incidentsService.fetchIncidents();
    }

    @Get(':id')
    async fetchIncidentById(@Param('id') id: string) {
        return this.incidentsService.fetchIncidentById(id);
    }

    @Post(':id/analyze')
    async analyzeIncidents(@Param('id') id: string) {
        return this.incidentsService.analyzeIncidents(id);
    }

    // Only the fixed sandbox scenarios run. No user-supplied URLs.
    @Post(':id/replay')
    async replayIncidents(
        @Param('id') id: string,
        @Body() dto: ReplayIncidentsDto,
    ) {
        return this.incidentsService.replayIncidents(id, dto);
    }
}
