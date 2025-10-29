import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, Put, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() login: { username: string; password: string }) {
    const user = await this.authService.validateUser(login.username, login.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() register: { username: string; password: string; name: string; email?: string }) {
    return this.authService.register(
      register.username,
      register.password,
      register.name,
      register.email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  verifyToken(@Request() req) {
    return { valid: true, user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateDto: { username?: string; name?: string; email?: string; currentPassword?: string; newPassword?: string }) {
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(@Request() req, @Query('q') query: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.authService.searchUsers(query || '', limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('activity')
  async getUsersActivity(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.authService.getUsersWithActivity(limitNum);
  }
}