import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';
import { FileUploadInterceptor } from './interceptors/file-upload.interceptor';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'posts'),
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  @UseInterceptors(FileUploadInterceptor)
  @Post('posts')
  async createPost(
    @Request() req,
    @Body() body: { content: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/posts/${file.filename}` : null;
    return await this.feedService.createPost(req.user.id, body.content, imageUrl);
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
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'posts'),
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      // Accept image files
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  }))
  @UseInterceptors(FileUploadInterceptor)
  @Put('posts/:id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { content: string; imageUrl?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/posts/${file.filename}` : body.imageUrl;
    return await this.feedService.updatePost(id, req.user.id, body.content, imageUrl);
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
