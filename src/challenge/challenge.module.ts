import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './challenge.schema';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
    ]),
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
