import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email_verification_service';
import { EmailVerificationController } from './email_verification_controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
