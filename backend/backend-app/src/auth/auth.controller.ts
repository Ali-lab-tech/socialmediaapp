import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: { username: string; password: string; name: string; email?: string }) {
    return this.authService.register(
      registerDto.username,
      registerDto.password,
      registerDto.name,
      registerDto.email,
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
}