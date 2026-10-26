import { Module } from "@nestjs/common";
import { AnalysisService } from "./services";

@Module ({
  imports: [],
  providers: [AnalysisService],
  exports: [AnalysisService]
})
export class AnalysisModule {}