import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Activity, ActivitySchema } from './schemas/activity.schema';
import { Vote, VoteSchema } from './schemas/vote.schema';
import { ActivityClassifierService } from './activity-classifier.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IPFSService } from '../common/services/ipfs.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { UsersModule } from '../users/users.module';
import { Challenge, ChallengeSchema } from '../challenge/challenge.schema';
import { ChallengeModule } from '../challenge/challenge.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: Vote.name, schema: VoteSchema },
      { name: Challenge.name, schema: ChallengeSchema },
    ]),
    BlockchainModule,
    UsersModule,
    ChallengeModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityClassifierService, JwtAuthGuard, IPFSService],
  exports: [ActivityService],
})
export class ActivityModule {}
