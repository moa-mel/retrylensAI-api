import { Module } from "@nestjs/common";
import { ApiModule } from "./api";
import { PrismaModule } from "./core/prisma";
import { RedisIntegrationModule } from "./core/redis/redis.module";

@Module({
  imports: [ ApiModule, PrismaModule, RedisIntegrationModule],
})
export class AppModule {}