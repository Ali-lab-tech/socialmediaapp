import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feed')
export class FeedController {
  @UseGuards(JwtAuthGuard)
  @Get('user-feed')
  getUserFeed(@Request() req) {
    return {
      feed: `Welcome to your feed, ${req.user.name}! This is your personalized social media feed.`,
      user: req.user,
    };
  }
}
