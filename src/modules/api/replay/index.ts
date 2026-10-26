import { Module } from "@nestjs/common";
import { ReplayService } from "./services";

@Module ({
  imports: [],
  providers: [ReplayService],
  exports: [ReplayService],
})
export class ReplayModule {}