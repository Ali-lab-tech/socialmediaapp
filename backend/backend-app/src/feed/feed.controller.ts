import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  async createPost(@Request() req, @Body() body: { content: string; imageUrl?: string }) {
    console.log(req.user.id);
    console.log(body.content);
    console.log(body.imageUrl);
    return await this.feedService.createPost(req.user.id, body.content, body.imageUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts')
  async getAllPosts() {
    return await this.feedService.getAllPosts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts/:id')
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return await this.feedService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('posts/:id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { content: string },
  ) {
    return await this.feedService.updatePost(id, req.user.id, body.content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  async deletePost(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.feedService.deletePost(id, req.user.id);
    return { message: 'Post deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-posts')
  async getUserPosts(@Request() req) {
    return await this.feedService.getUserPosts(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-feed')
  async getUserFeed(@Request() req) {
    const posts = await this.feedService.getAllPosts();
    return {
      posts,
      user: req.user,
    };
  }
}
