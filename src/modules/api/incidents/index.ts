import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { IncidentsService } from "./services";
import { IncidentsController } from "./controllers";
import { AnalysisModule } from "../analysis";
import { ReplayModule } from "../replay";
import { IncidentCaptureMiddleware } from "./middleware/incident-capture.middleware";
import { ProjectsModule } from "../projects";

@Module({
  imports: [
    AnalysisModule,
    ReplayModule,
    ProjectsModule
  ],
  providers: [
    IncidentsService,
    IncidentCaptureMiddleware,
  ],
  controllers: [IncidentsController],
  exports: [IncidentsService],
})
export class IncidentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IncidentCaptureMiddleware)
      .exclude({ path: 'api/v1/incidents/*path', method: RequestMethod.ALL })
      .forRoutes('*');
  }
}