import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { Photo, User, Like, Comment } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Photo, User, Like, Comment])],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
