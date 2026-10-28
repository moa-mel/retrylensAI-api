import { IsArray, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

enum ReplayMode {
    broken = 'broken',
    fixed = 'fixed',
}
export class ReplayIncidentsDto {
  @IsOptional()
  @IsEnum(ReplayMode)
  mode?: ReplayMode;
}

export class IngestIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsInt()
  @Min(100)
  @Max(599)
  statusCode: number;

  @IsOptional()
  @IsString()
  requestId?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, any>;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;

  @IsOptional()
  @IsObject()
  responseBody?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  logs?: string[];

  @IsOptional()
  @IsString()
  scenario?: string;
}
