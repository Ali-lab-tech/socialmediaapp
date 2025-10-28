import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly maxSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (file) {
      // Validate file size
      if (file.size > this.maxSize) {
        throw new BadRequestException(
          'File size exceeds the maximum allowed size of 5MB',
        );
      }

      // Validate file type
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, JPG, and PNG images are allowed',
        );
      }
    }

    return next.handle();
  }
}
