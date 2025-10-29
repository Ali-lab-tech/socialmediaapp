import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Like, Comment, User])],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
