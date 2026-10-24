import { Module } from "@nestjs/common";
import { AnalysisModule } from "./analysis";
import { IncidentsModule } from "./incidents";
import { ReplayModule } from "./replay";

@Module({
  imports: [
    AnalysisModule,
    IncidentsModule,
    ReplayModule
  ],
})
export class ApiModule {}