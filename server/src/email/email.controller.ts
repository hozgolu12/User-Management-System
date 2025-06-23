import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
}

@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-approval')
  @Roles('admin')
  async sendApprovalEmail(@Body() emailData: SendEmailDto) {
    try {
      await this.emailService.sendEmail(emailData);
      return {
        message: 'Approval email sent successfully',
        status: 'success',
      };
    } catch (error) {
      console.error('Failed to send approval email:', error);
      throw new HttpException(
        'Failed to send approval email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-welcome')
  async sendWelcomeEmail(@Body() emailData: SendEmailDto) {
    try {
      await this.emailService.sendEmail(emailData);
      return {
        message: 'Welcome email sent successfully',
        status: 'success',
      };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new HttpException(
        'Failed to send welcome email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
