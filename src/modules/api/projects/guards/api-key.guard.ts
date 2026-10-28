import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey =
      request.headers['x-api-key'] ||
      request.headers['authorization']?.replace(/^Bearer\s+/i, '');

    const expectedApiKey =
      this.configService.get<string>('RETRYLENS_API_KEY');

    if (!expectedApiKey) {
      throw new Error('RETRYLENS_API_KEY is not configured');
    }

    if (
      typeof apiKey !== 'string' ||
      apiKey !== expectedApiKey
    ) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}