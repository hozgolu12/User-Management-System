/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: any,
  ): Promise<User> {
    const userToUpdate = await this.userModel.findById(id).exec();

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Super admin can edit anyone
    if (currentUser.isSuperAdmin) {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password')
        .exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    }

    // Regular admin can only edit users (not other admins)
    if (currentUser.role === 'admin' && userToUpdate.role === 'user') {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password')
        .exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    }

    // Users can only edit themselves
    if (currentUser.role === 'user' && currentUser.userId === id) {
      // Users can only update their own name and address
      const allowedFields = {
        name: updateUserDto.name,
        address: updateUserDto.address,
      };
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, allowedFields, { new: true })
        .select('-password')
        .exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    }

    throw new ForbiddenException(
      'You do not have permission to edit this user',
    );
  }

  async deleteUser(id: string, currentUser: any): Promise<any> {
    const userToDelete = await this.userModel.findById(id).exec();
    if (!userToDelete) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent any user from deleting themselves
    if (currentUser.userId === id) {
      throw new ForbiddenException(
        'You cannot delete your own account through admin panel',
      );
    }

    // Super admin can delete anyone except themselves
    if (currentUser.isSuperAdmin) {
      try {
        await this.userModel.findByIdAndDelete(id);
        return { message: 'User deleted successfully' };
      } catch (error) {
        console.error('Error deleting user:', error);
        return { error: 'Failed to delete user' };
      }
    }

    // Regular admin can only delete normal users (not other admins or super admin)
    if (currentUser.role === 'admin' && userToDelete.role === 'user') {
      try {
        await this.userModel.findByIdAndDelete(id);
        return { message: 'User deleted successfully' };
      } catch (error) {
        console.error('Error deleting user:', error);
        return { error: 'Failed to delete user' };
      }
    }

    throw new ForbiddenException(
      'You do not have permission to delete this user',
    );
  }

  async updateOwnProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Users can only update their own name and address
    const allowedFields = {
      name: updateUserDto.name,
      address: updateUserDto.address,
    };

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, allowedFields, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User not found`);
    }
    return updatedUser;
  }

  async deleteOwnAccount(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    try {
      await this.userModel.findByIdAndDelete(userId);
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error: 'Failed to delete user' };
    }
  }

  async getPendingAdmins(): Promise<User[]> {
    return this.userModel
      .find({
        role: 'admin',
        isApproved: false,
      })
      .select('-password')
      .exec();
  }

  async approveAdmin(id: string): Promise<User> {
    const updatedAdmin = await this.userModel
      .findByIdAndUpdate(id, { isApproved: true }, { new: true })
      .select('-password')
      .exec();
    if (!updatedAdmin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return updatedAdmin;
  }
}
