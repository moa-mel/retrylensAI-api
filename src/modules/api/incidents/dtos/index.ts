import { IsEnum, IsOptional } from 'class-validator';

enum ReplayMode {
    broken = 'broken',
    fixed = 'fixed',
}
export class ReplayIncidentsDto {
  @IsOptional()
  @IsEnum(ReplayMode)
  mode?: ReplayMode;
}