import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './challenge.schema';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
    ]),
  ],
  providers: [ChallengeService],
  controllers: [ChallengeController],
})
export class ChallengeModule {}
