import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  VerificationService,
  CreateVerificationDto,
  UploadReceiptDto,
} from './verification.service';
import {
  VerificationStatus,
  VerificationType,
  TransportProvider,
} from './schemas/verification.schema';

export interface UpdateStatusDto {
  status: VerificationStatus;
  verifiedBy: string;
  rejectionReason?: string;
}

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('api')
  async createApiVerification(
    @Body() createVerificationDto: CreateVerificationDto,
  ) {
    return this.verificationService.createApiVerification(
      createVerificationDto,
    );
  }

  @Post('receipt')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(
    @Body() body: { userId: string; activityId: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploadReceiptDto: UploadReceiptDto = {
      userId: body.userId,
      activityId: body.activityId,
      file,
    };

    return this.verificationService.uploadReceipt(uploadReceiptDto);
  }

  @Post('upload-url')
  async generateUploadUrl(
    @Body()
    body: {
      userId: string;
      activityId: string;
      fileName: string;
      contentType: string;
    },
  ) {
    return this.verificationService.generateUploadUrl(
      body.userId,
      body.activityId,
      body.fileName,
      body.contentType,
    );
  }

  @Get(':id')
  async getVerification(@Param('id') id: string) {
    return this.verificationService.getVerification(id);
  }

  @Get('user/:userId')
  async getUserVerifications(@Param('userId') userId: string) {
    return this.verificationService.getUserVerifications(userId);
  }

  @Get('activity/:activityId')
  async getActivityVerifications(@Param('activityId') activityId: string) {
    return this.verificationService.getActivityVerifications(activityId);
  }

  @Get('admin/pending')
  async getPendingVerifications() {
    return this.verificationService.getPendingVerifications();
  }

  @Patch(':id/status')
  async updateVerificationStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.verificationService.updateVerificationStatus(
      id,
      updateStatusDto.status,
      updateStatusDto.verifiedBy,
      updateStatusDto.rejectionReason,
    );
  }

  @Post('test-api-verification')
  async testApiVerification() {
    // Test API verification with T-Money
    const testVerification: CreateVerificationDto = {
      userId: '507f1f77bcf86cd799439011', // Mock user ID
      activityId: '507f1f77bcf86cd799439012', // Mock activity ID
      type: VerificationType.TRANSPORT_API,
      transportProvider: TransportProvider.T_MONEY,
      transactionId: 'TM123456789',
      cardNumber: '1234567890123456',
    };

    return this.verificationService.createApiVerification(testVerification);
  }

  @Post('test-receipt-upload')
  @UseInterceptors(FileInterceptor('file'))
  async testReceiptUpload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploadReceiptDto: UploadReceiptDto = {
      userId: '507f1f77bcf86cd799439011', // Mock user ID
      activityId: '507f1f77bcf86cd799439012', // Mock activity ID
      file,
    };

    return this.verificationService.uploadReceipt(uploadReceiptDto);
  }
}
