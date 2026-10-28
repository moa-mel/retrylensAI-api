import { PrismaModule } from '@/modules/core/prisma';
import { Module } from '@nestjs/common';
import { ProjectsService } from './services';
import { ProjectsController } from './controllers';

@Module({
  imports: [PrismaModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}