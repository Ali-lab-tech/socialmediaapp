import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async resolveMentionedUserIds(content: string): Promise<number[]> {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];
    
    const usernames = matches.map(m => m.substring(1).toLowerCase());
    const userIds: number[] = [];
    
    for (const username of usernames) {
      const user = await this.userRepository.findOne({
        where: [{ username: username }, { name: username }],
      });
      if (user) {
        userIds.push(user.id);
      }
    }
    
    return [...new Set(userIds)]; // Remove duplicates
  }

  async createPost(userId: number, content: string, imageUrl?: string, mentionedUserIds?: number[]): Promise<Post> {
    // If mentionedUserIds not provided, parse from content
    const mentions = mentionedUserIds || await this.resolveMentionedUserIds(content);
    
    const post = this.postRepository.create({
      content,
      imageUrl,
      userId,
      mentionedUserIds: mentions.length > 0 ? mentions : null,
    });
    return await this.postRepository.save(post);
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.postRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'likes', 'comments', 'comments.user'],
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
    // Update mentions
    const mentions = await this.resolveMentionedUserIds(content);
    post.mentionedUserIds = mentions.length > 0 ? mentions : null;
    
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
      relations: ['user', 'likes', 'comments', 'comments.user'],
    });
  }

  async toggleLike(postId: number, userId: number): Promise<{ message: string; liked: boolean; likesCount: number }> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      // Unlike
      await this.likeRepository.remove(existingLike);
      const likesCount = await this.likeRepository.count({ where: { postId } });
      return { message: 'Post unliked', liked: false, likesCount };
    } else {
      // Like
      const like = this.likeRepository.create({ postId, userId });
      await this.likeRepository.save(like);
      const likesCount = await this.likeRepository.count({ where: { postId } });
      return { message: 'Post liked', liked: true, likesCount };
    }
  }

  async sharePost(postId: number, userId: number): Promise<Post> {
    // Find the original post
    const originalPost = await this.postRepository.findOne({ where: { id: postId } });
    
    if (!originalPost) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Create a new post with the same content and image but with the current user's ID
    const sharedPost = this.postRepository.create({
      content: originalPost.content,
      imageUrl: originalPost.imageUrl,
      userId: userId, // Set to the current user's ID
    });

    return await this.postRepository.save(sharedPost);
  }

  async createComment(postId: number, userId: number, content: string, mentionedUserIds?: number[]): Promise<Comment> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    // If mentionedUserIds not provided, parse from content
    const mentions = mentionedUserIds || await this.resolveMentionedUserIds(content);
    
    const comment = this.commentRepository.create({ 
      postId, 
      userId, 
      content,
      mentionedUserIds: mentions.length > 0 ? mentions : null,
    });
    const saved = await this.commentRepository.save(comment);
    // Return with user populated
    const withUser = await this.commentRepository.findOne({ where: { id: saved.id }, relations: ['user'] });
    return withUser as Comment;
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    return await this.commentRepository.find({ where: { postId }, order: { createdAt: 'ASC' }, relations: ['user'] });
  }
}
