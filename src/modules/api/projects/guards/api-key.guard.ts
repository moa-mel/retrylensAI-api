import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectsService } from '../services';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Support both styles
    const apiKey =
      request.headers['x-api-key'] ||
      request.headers['authorization']?.replace(/^Bearer\s+/i, '');

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API key is required');
    }

    const project = await this.projectsService.findProjectByApiKey(apiKey);
    request.project = project; // attach for later use

    return true;
  }
}