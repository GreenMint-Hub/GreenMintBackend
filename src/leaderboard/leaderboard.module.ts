import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardGateway } from './leaderboard.gateway';
import { Leaderboard, LeaderboardSchema } from './schemas/leaderboard.schema';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { UsersModule } from '../users/users.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Leaderboard.name, schema: LeaderboardSchema },
    ]),
    BlockchainModule,
    UsersModule,
    ActivityModule,
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardGateway],
  exports: [LeaderboardService, LeaderboardGateway],
})
export class LeaderboardModule {}
