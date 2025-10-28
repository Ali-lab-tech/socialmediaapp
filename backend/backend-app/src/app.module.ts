import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { FeedModule } from './feed/feed.module';
import { User } from './auth/entities/user.entity';
import { Post } from './feed/entities/post.entity';
import { Like } from './feed/entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '12345678', 
      database: 'social_media_db',
      entities: [User, Post, Like],
      synchronize: true,
      logging: true,
      extra: {
        charset: 'utf8mb4_unicode_ci',
      },
    }),
    AuthModule,
    FeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
