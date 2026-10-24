import { Module } from "@nestjs/common";
import { ReplayService } from "./services";

@Module ({
  imports: [],
  providers: [ReplayService],
})
export class ReplayModule {}