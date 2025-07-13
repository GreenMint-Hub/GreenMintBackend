import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ActivityModule } from './activity/activity.module';
import { VerificationModule } from './verification/verification.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AuthModule } from './auth/auth.module';
import { ChallengeModule } from './challenge/challenge.module';
import { NftModule } from './nft/nft.module';
import { throttlerConfig } from './config/throttler.config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.cwd() + '/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async(configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI') || 'mongodb+srv://cynthianish12:%40Gena2025%21@cluster0.qcnbgcm.mongodb.net/GreenMint?retryWrites=true&w=majority';
        if (!uri) {
          throw new Error(
            'MONGODB_URI is not defined in environment variables',
          );
        }
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot(throttlerConfig),
    UsersModule,
    ActivityModule,
    VerificationModule,
    BlockchainModule,
    LeaderboardModule,
    AuthModule,
    ChallengeModule,
    NftModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
