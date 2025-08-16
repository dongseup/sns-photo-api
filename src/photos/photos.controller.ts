import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createPhotoDto: CreatePhotoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    return this.photosService.create(createPhotoDto, file, req.user.id);
  }

  @Get()
  async findAll(@Query() query: { page?: number; limit?: number; userId?: string }) {
    return this.photosService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
    @Request() req
  ) {
    return this.photosService.update(id, updatePhotoDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.photosService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async likePhoto(@Param('id') id: string, @Request() req) {
    return this.photosService.likePhoto(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  async unlikePhoto(@Param('id') id: string, @Request() req) {
    return this.photosService.unlikePhoto(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req
  ) {
    return this.photosService.addComment(id, body.content, req.user.id);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string, @Query() query: { page?: number; limit?: number }) {
    return this.photosService.getComments(id, query);
  }
}
