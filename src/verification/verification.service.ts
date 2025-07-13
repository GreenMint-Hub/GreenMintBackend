import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Verification,
  VerificationDocument,
  VerificationType,
  VerificationStatus,
  TransportProvider,
} from './schemas/verification.schema';
import { S3Service } from '../common/services/s3.service';
import {
  TransportApiService,
  ApiVerificationResult,
} from './services/transport-api.service';

export interface CreateVerificationDto {
  userId: string;
  activityId: string;
  type: VerificationType;
  transportProvider?: TransportProvider;
  transactionId?: string;
  cardNumber?: string;
  amount?: number;
  currency?: string;
  route?: string;
  transactionDate?: Date;
}

export interface UploadReceiptDto {
  userId: string;
  activityId: string;
  file: Express.Multer.File;
}

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel(Verification.name)
    private verificationModel: Model<VerificationDocument>,
    private s3Service: S3Service,
    private transportApiService: TransportApiService,
  ) {}

  /**
   * Create verification via API
   */
  async createApiVerification(
    createVerificationDto: CreateVerificationDto,
  ): Promise<Verification> {
    const { userId, activityId, transportProvider, transactionId, cardNumber } =
      createVerificationDto;

    if (!transportProvider || !transactionId) {
      throw new BadRequestException(
        'Transport provider and transaction ID are required for API verification',
      );
    }

    // Verify transaction via transport API
    const apiResult = await this.transportApiService.verifyTransportTransaction(
      transportProvider,
      transactionId,
      cardNumber,
    );

    if (!apiResult.isValid) {
      throw new BadRequestException(`Invalid transaction: ${apiResult.error}`);
    }

    const transaction = apiResult.transaction!;

    // Calculate carbon savings and points
    const carbonSaved = this.transportApiService.calculateCarbonSavings(
      transaction.route,
      transaction.amount,
    );
    const points = this.transportApiService.calculatePoints(
      transaction.amount,
      transaction.provider,
    );

    const verification = new this.verificationModel({
      userId: new Types.ObjectId(userId),
      activityId: new Types.ObjectId(activityId),
      type: VerificationType.TRANSPORT_API,
      status: VerificationStatus.APPROVED,
      transportProvider: transaction.provider,
      apiTransactionId: transaction.transactionId,
      apiResponse: transaction,
      amount: transaction.amount,
      currency: transaction.currency,
      route: transaction.route,
      transactionDate: transaction.timestamp,
      verifiedBy: 'system',
      verifiedAt: new Date(),
      carbonSaved,
      points,
    });

    return await verification.save();
  }

  /**
   * Upload receipt for verification
   */
  async uploadReceipt(
    uploadReceiptDto: UploadReceiptDto,
  ): Promise<Verification> {
    const { userId, activityId, file } = uploadReceiptDto;

    // Upload file to S3
    const receiptUrl = await this.s3Service.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // TODO: In production, this would integrate with IPFS for blockchain storage
    const receiptHash = `ipfs://${Date.now()}-${file.originalname}`;

    const verification = new this.verificationModel({
      userId: new Types.ObjectId(userId),
      activityId: new Types.ObjectId(activityId),
      type: VerificationType.TRANSPORT_RECEIPT,
      status: VerificationStatus.PENDING,
      receiptUrl,
      receiptHash,
      verifiedBy: 'manual', // Will be updated when admin reviews
    });

    return await verification.save();
  }

  /**
   * Get verification by ID
   */
  async getVerification(id: string): Promise<Verification> {
    const verification = await this.verificationModel.findById(id).exec();
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }
    return verification;
  }

  /**
   * Get verifications by user ID
   */
  async getUserVerifications(userId: string): Promise<Verification[]> {
    return this.verificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  /**
   * Get verifications by activity ID
   */
  async getActivityVerifications(activityId: string): Promise<Verification[]> {
    return this.verificationModel
      .find({ activityId: new Types.ObjectId(activityId) })
      .exec();
  }

  /**
   * Update verification status (admin function)
   */
  async updateVerificationStatus(
    id: string,
    status: VerificationStatus,
    verifiedBy: string,
    rejectionReason?: string,
  ): Promise<Verification> {
    const verification = await this.verificationModel.findById(id).exec();
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    verification.status = status;
    verification.verifiedBy = verifiedBy;
    verification.verifiedAt = new Date();

    if (status === VerificationStatus.REJECTED && rejectionReason) {
      verification.rejectionReason = rejectionReason;
    }

    // If approved, calculate carbon savings and points for receipt uploads
    if (
      status === VerificationStatus.APPROVED &&
      verification.type === VerificationType.TRANSPORT_RECEIPT
    ) {
      // Default values for receipt uploads (would be enhanced with OCR in production)
      verification.carbonSaved = 1.5; // kg CO2
      verification.points = 10;
    }

    return await verification.save();
  }

  /**
   * Delete verification and associated files
   */
  async deleteVerification(id: string): Promise<void> {
    const verification = await this.verificationModel.findById(id).exec();
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    // Delete file from S3 if exists
    if (verification.receiptUrl) {
      await this.s3Service.deleteFile(verification.receiptUrl);
    }

    await this.verificationModel.findByIdAndDelete(id).exec();
  }

  /**
   * Get pending verifications (admin function)
   */
  async getPendingVerifications(): Promise<Verification[]> {
    return this.verificationModel
      .find({ status: VerificationStatus.PENDING })
      .populate('userId', 'username walletAddress')
      .populate('activityId', 'type startTime endTime distance')
      .exec();
  }

  /**
   * Generate presigned URL for direct upload
   */
  async generateUploadUrl(
    userId: string,
    activityId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ url: string; key: string; verificationId: string }> {
    // Create pending verification record
    const verification = new this.verificationModel({
      userId: new Types.ObjectId(userId),
      activityId: new Types.ObjectId(activityId),
      type: VerificationType.TRANSPORT_RECEIPT,
      status: VerificationStatus.PENDING,
    });

    await verification.save();

    // Generate presigned URL
    const { url, key } = await this.s3Service.generatePresignedUrl(
      fileName,
      contentType,
    );

    return {
      url,
      key,
      verificationId: (verification as any)._id.toString(),
    };
  }
}
