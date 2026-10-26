import { Module } from "@nestjs/common";
import { IncidentsService } from "./services";
import { IncidentsController } from "./controllers";
import { AnalysisModule } from "../analysis";
import { ReplayModule } from "../replay";
import { IncidentCaptureMiddleware } from "./middleware/incident-capture.middleware";

@Module({
  imports: [
    AnalysisModule,
    ReplayModule,
  ],
  providers: [
    IncidentsService,
    IncidentCaptureMiddleware
  ],
  controllers: [IncidentsController],
  exports: [IncidentsService],
})
export class IncidentsModule {}