import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    };
  }

  async register(username: string, password: string, name: string, email?: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      name,
      email,
    });

    const savedUser = await this.userRepository.save(user);
    const { password: _, ...result } = savedUser;

    // Generate JWT token
    const payload = { username: savedUser.username, sub: savedUser.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: result.id,
        username: result.username,
        name: result.name,
        email: result.email,
      },
    };
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfile(userId: number, updateData: { username?: string; name?: string; email?: string; currentPassword?: string; newPassword?: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password if provided
    if (updateData.currentPassword && !await bcrypt.compare(updateData.currentPassword, user.password)) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if username is being changed and if it's already taken
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await this.userRepository.findOne({ where: { username: updateData.username } });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    // Update user data
    const updateFields: any = {};
    
    if (updateData.username) updateFields.username = updateData.username;
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.email !== undefined) updateFields.email = updateData.email;
    
    // Update password if new password is provided
    if (updateData.newPassword) {
      updateFields.password = await bcrypt.hash(updateData.newPassword, 10);
    }

    await this.userRepository.update(userId, updateFields);

    // Return updated user data
    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });
    const { password, ...result } = updatedUser;
    
    return {
      id: result.id,
      username: result.username,
      name: result.name,
      email: result.email,
    };
  }
}