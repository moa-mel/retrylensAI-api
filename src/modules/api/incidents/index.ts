import { Module } from "@nestjs/common";
import { IncidentsService } from "./services";
import { IncidentsController } from "./controllers";
import { AnalysisModule } from "../analysis";
import { ReplayModule } from "../replay";

@Module({
  imports: [
    AnalysisModule,
    ReplayModule,
  ],
  providers: [IncidentsService],
  controllers: [IncidentsController],
  exports: [IncidentsService],
})
export class IncidentsModule {}