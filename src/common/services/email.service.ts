import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter - for development, we'll use a test account
    // In production, you would use your actual SMTP credentials
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'cynthianish12@gmail.com',
        pass: process.env.SMTP_PASS || 'fdktcxghwdppupyy',
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'GreenMint <noreply@greenmint.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, username: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://192.168.8.26:4000'}/verify-email/${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - GreenMint</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 GreenMint</h1>
            <p>Verify Your Email Address</p>
          </div>
          <div class="content">
            <h2>Hello ${username}!</h2>
            <p>Thank you for signing up for GreenMint. To complete your registration and start earning eco-points, please verify your email address by clicking the button below:</p>
            
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create a GreenMint account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 GreenMint. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hello ${username}!
      
      Thank you for signing up for GreenMint. To complete your registration and start earning eco-points, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours for security reasons.
      
      If you didn't create a GreenMint account, you can safely ignore this email.
      
      © 2024 GreenMint. All rights reserved.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - GreenMint',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, username: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://192.168.8.26:4000'}/reset-password/${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - GreenMint</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 GreenMint</h1>
            <p>Reset Your Password</p>
          </div>
          <div class="content">
            <h2>Hello ${username}!</h2>
            <p>We received a request to reset your password for your GreenMint account. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            
            <p>This password reset link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2024 GreenMint. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hello ${username}!
      
      We received a request to reset your password for your GreenMint account. Click the link below to create a new password:
      
      ${resetUrl}
      
      This password reset link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      
      © 2024 GreenMint. All rights reserved.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - GreenMint',
      html,
      text,
    });
  }
} 