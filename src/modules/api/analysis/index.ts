import { Module } from "@nestjs/common";
import { AnalysisService } from "./services";

@Module ({
  imports: [],
  providers: [AnalysisService],
//   controllers: [AnalysisController],
//   exports: [AnalysisService],
})
export class AnalysisModule {}