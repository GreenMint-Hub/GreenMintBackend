import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET || 'greenmint-uploads';
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    const key = `receipts/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  /**
   * Generate a presigned URL for file upload
   */
  async generatePresignedUrl(
    fileName: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const key = `receipts/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return { url, key };
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(fileUrl);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Extract S3 key from URL
   */
  private extractKeyFromUrl(url: string): string {
    const bucketPrefix = `https://${this.bucketName}.s3.`;
    return url.replace(bucketPrefix, '').split('.amazonaws.com/')[1];
  }

  /**
   * Generate a presigned URL for file download
   */
  async generateDownloadUrl(fileUrl: string): Promise<string> {
    const key = this.extractKeyFromUrl(fileUrl);

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
