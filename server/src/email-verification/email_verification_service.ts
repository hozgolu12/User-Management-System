import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';

interface VerificationCode {
  code: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class EmailVerificationService {
  private verificationCodes = new Map<string, VerificationCode>();
  private readonly MAX_ATTEMPTS = 3;
  private readonly CODE_EXPIRY_MINUTES = 10;

  constructor(private readonly emailService: EmailService) {}

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(email: string): Promise<void> {
    const code = this.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

    // Store the verification code
    this.verificationCodes.set(email, {
      code,
      expiresAt,
      attempts: 0,
    });

    // Send the verification email
    const subject = 'Email Verification - User Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Email Verification Required</h2>
        <p>Please use the following verification code to complete your registration:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #6b7280;">This code will expire in ${this.CODE_EXPIRY_MINUTES} minutes.</p>
        <p style="color: #6b7280;">If you didn't request this verification, please ignore this email.</p>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 14px;">
            This is an automated email from User Management System. Please do not reply.
          </p>
        </div>
      </div>
    `;

    await this.emailService.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  verifyCode(email: string, inputCode: string): boolean {
    const storedData = this.verificationCodes.get(email);

    if (!storedData) {
      return false; // No verification code found
    }

    // Check if code has expired
    if (new Date() > storedData.expiresAt) {
      this.verificationCodes.delete(email);
      return false;
    }

    // Check if max attempts exceeded
    if (storedData.attempts >= this.MAX_ATTEMPTS) {
      this.verificationCodes.delete(email);
      return false;
    }

    // Increment attempts
    storedData.attempts++;

    // Check if code matches
    if (storedData.code === inputCode.trim()) {
      // Code is correct, remove it from storage
      this.verificationCodes.delete(email);
      return true;
    }

    // Update the stored data with incremented attempts
    this.verificationCodes.set(email, storedData);
    return false;
  }

  // Clean up expired codes (call this periodically)
  cleanupExpiredCodes(): void {
    const now = new Date();
    for (const [email, data] of this.verificationCodes.entries()) {
      if (now > data.expiresAt) {
        this.verificationCodes.delete(email);
      }
    }
  }
}
