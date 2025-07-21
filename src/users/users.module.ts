import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { Activity, ActivitySchema } from '../activity/schemas/activity.schema';
import { NFT, NFTSchema } from '../nft/nft.schema';
import { Challenge, ChallengeSchema } from '../challenge/challenge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: NFT.name, schema: NFTSchema },
      { name: Challenge.name, schema: ChallengeSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
