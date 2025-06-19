/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure your email provider (Gmail, SendGrid, etc.)

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@yourdomain.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendAdminApprovalEmail(
    adminEmail: string,
    adminName: string,
  ): Promise<void> {
    const subject = 'Admin Access Approved - User Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Admin Access Approved</h2>
        <p>Dear ${adminName},</p>
        <p>Your admin access request has been approved! You now have administrative privileges.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Your new privileges:</h3>
          <ul style="color: #6b7280;">
            <li>Manage user accounts</li>
            <li>Approve new admin requests</li>
            <li>View all system users</li>
            <li>Create and update user information</li>
          </ul>
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Dashboard
          </a>
        </p>
      </div>
    `;

    await this.sendEmail({ to: adminEmail, subject, html });
  }

  async sendAdminRejectionEmail(
    adminEmail: string,
    adminName: string,
  ): Promise<void> {
    const subject = 'Admin Access Request Rejected - User Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Admin Access Request Rejected</h2>
        <p>Dear ${adminName},</p>
        <p>We regret to inform you that your admin access request has been rejected.</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="color: #7f1d1d; margin: 0;">
            If you believe this is an error or would like to discuss this decision, 
            please contact our support team.
          </p>
        </div>
        <p>You can still continue using the system with regular user privileges.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login as User
          </a>
        </p>
      </div>
    `;

    await this.sendEmail({ to: adminEmail, subject, html });
  }

  async sendNewAdminRequestNotification(
    adminEmails: string[],
    newAdminName: string,
    newAdminEmail: string,
  ): Promise<void> {
    const subject = 'New Admin Access Request - User Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">New Admin Access Request</h2>
        <p>A new admin access request has been submitted and requires your review.</p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">Request Details:</h3>
          <ul style="color: #92400e;">
            <li><strong>Name:</strong> ${newAdminName}</li>
            <li><strong>Email:</strong> ${newAdminEmail}</li>
            <li><strong>Requested Role:</strong> Admin</li>
          </ul>
        </div>
        <p>Please review this request and take appropriate action.</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Request
          </a>
        </p>
      </div>
    `;

    // Send to all admin emails
    for (const email of adminEmails) {
      await this.sendEmail({ to: email, subject, html });
    }
  }
}
