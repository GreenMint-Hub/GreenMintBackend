import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { TransportApiService } from './services/transport-api.service';
import { S3Service } from '../common/services/s3.service';
import {
  Verification,
  VerificationSchema,
} from './schemas/verification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Verification.name, schema: VerificationSchema },
    ]),
  ],
  controllers: [VerificationController],
  providers: [VerificationService, TransportApiService, S3Service],
  exports: [VerificationService, TransportApiService, S3Service],
})
export class VerificationModule {}
