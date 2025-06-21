/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email, password, address, role } = signupDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt
      .hash(password, saltRounds)
      .catch((error: any) => {
        console.error('Error hashing password:', error);
      });

    // Check if this is the super admin email
    const isSuperAdmin = email === process.env.DEFAULT_ADMIN_EMAIL;

    // Create user
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      address,
      role,
      isApproved: role === 'user' ? true : isSuperAdmin ? true : false,
      isSuperAdmin,
    });

    await user.save();

    // Send welcome email for regular users
    if (role === 'user') {
      try {
        await this.emailService.sendEmail({
          to: email,
          subject: 'Welcome to User Management System',
          html: `
            <h2>Welcome ${name}!</h2>
            <p>Your account has been created successfully. You can now login to access the system.</p>
            <a href="${process.env.FRONTEND_URL}/login">Login Now</a>
          `,
        });
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    } else if (role === 'admin' && isSuperAdmin) {
      return {
        message: 'Super admin registered successfully',
      };
    } else if (role === 'admin' && !isSuperAdmin) {
      // Send notification to existing admins about new admin request
      try {
        const existingAdmins = await this.userModel
          .find({
            role: 'admin',
            isApproved: true,
          })
          .select('email');

        const adminEmails = existingAdmins.map((admin) => admin.email);

        // Add default admin email if no admins exist
        if (adminEmails.length === 0) {
          adminEmails.push(
            process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com',
          );
        }
        await this.emailService.sendNewAdminRequestNotification(
          adminEmails,
          name,
          email,
        );
      } catch (error) {
        console.error('Failed to send admin notification email:', error);
      }
    }

    return {
      message:
        role === 'admin' && !isSuperAdmin
          ? 'Admin registration submitted for approval'
          : 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if admin is approved (super admin is auto-approved)
    if (user.role === 'admin' && !user.isApproved && !user.isSuperAdmin) {
      throw new UnauthorizedException('Admin account pending approval');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };

    const expiresIn = user.role === 'admin' ? '1d' : '60s';

    return {
      token: await this.jwtService.signAsync(payload, {
        expiresIn,
      }),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        isApproved: user.isApproved,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async getPendingAdmins() {
    return this.userModel
      .find({
        role: 'admin',
        isApproved: false,
      })
      .select('-password');
  }

  async approveAdmin(adminId: string) {
    const admin = await this.userModel
      .findByIdAndUpdate(adminId, { isApproved: true }, { new: true })
      .select('-password');

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Send approval email
    try {
      await this.emailService.sendAdminApprovalEmail(admin.email, admin.name);
    } catch (error) {
      console.error('Failed to send admin approval email:', error);
    }

    return admin;
  }

  async rejectAdmin(adminId: string) {
    const admin = await this.userModel.findById(adminId).select('-password');

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Send rejection email before updating/deleting
    try {
      await this.emailService.sendAdminRejectionEmail(admin.email, admin.name);
    } catch (error) {
      console.error('Failed to send admin rejection email:', error);
    }

    // Update user role to 'user' instead of deleting
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        adminId,
        { role: 'user', isApproved: true },
        { new: true },
      )
      .select('-password');

    return updatedUser;
  }
}
