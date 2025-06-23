import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { EmailVerificationService } from './email_verification_service';
import { IsEmail, IsString, Length } from 'class-validator';

class SendVerificationDto {
  @IsEmail()
  email: string;
}

class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('send')
  async sendVerificationCode(@Body() sendDto: SendVerificationDto) {
    try {
      await this.emailVerificationService.sendVerificationCode(sendDto.email);
      return {
        message: 'Verification code sent successfully',
        status: 'success',
      };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new HttpException(
        'Failed to send verification email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('verify')
  verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    try {
      const isValid = this.emailVerificationService.verifyCode(
        verifyDto.email,
        verifyDto.code,
      );

      if (!isValid) {
        throw new BadRequestException('Invalid or expired verification code');
      }

      return {
        message: 'Email verified successfully',
        status: 'success',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Failed to verify email:', error);
      throw new HttpException(
        'Failed to verify email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
