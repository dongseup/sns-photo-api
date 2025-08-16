import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: { page?: number; limit?: number; search?: string }) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  async getMyProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @UseInterceptors(FileInterceptor('profile_image'))
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    return this.usersService.update(req.user.id, updateUserDto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/photos')
  async getUserPhotos(
    @Param('id') id: string,
    @Query() query: { page?: number; limit?: number }
  ) {
    return this.usersService.getUserPhotos(id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async followUser(@Param('id') id: string, @Request() req) {
    return this.usersService.followUser(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  async unfollowUser(@Param('id') id: string, @Request() req) {
    return this.usersService.unfollowUser(req.user.id, id);
  }

  @Get(':id/followers')
  async getFollowers(@Param('id') id: string, @Query() query: { page?: number; limit?: number }) {
    return this.usersService.getFollowers(id, query);
  }

  @Get(':id/following')
  async getFollowing(@Param('id') id: string, @Query() query: { page?: number; limit?: number }) {
    return this.usersService.getFollowing(id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/is-following')
  async isFollowing(@Param('id') id: string, @Request() req) {
    return this.usersService.isFollowing(req.user.id, id);
  }
}
