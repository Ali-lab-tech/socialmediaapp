import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createPost(userId: number, content: string, imageUrl?: string): Promise<Post> {
    const post = this.postRepository.create({
      content,
      imageUrl,
      userId,
    });
    return await this.postRepository.save(post);
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async getPostById(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async updatePost(postId: number, userId: number, content: string, imageUrl?: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (post.userId !== userId) {
      throw new UnauthorizedException('You can only edit your own posts');
    }

    post.content = content;
    if (imageUrl !== undefined) {
      post.imageUrl = imageUrl;
    }
    return await this.postRepository.save(post);
  }

  async deletePost(postId: number, userId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (post.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }
}
