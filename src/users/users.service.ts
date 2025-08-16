import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Photo, Follow } from '../entities';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.where(
        'user.username ILIKE :search OR user.bio ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 사용자명 중복 확인
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('이미 사용 중인 사용자명입니다.');
      }
    }

    // 프로필 이미지 업데이트
    if (file) {
      user.profile_image = `/uploads/${file.filename}`;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return {
      message: '프로필이 수정되었습니다.',
      user: updatedUser,
    };
  }

  async getUserPhotos(userId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [photos, total] = await this.photoRepository.findAndCount({
      where: { user_id: userId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      photos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('자기 자신을 팔로우할 수 없습니다.');
    }

    // 팔로우 대상 사용자 확인
    const followingUser = await this.userRepository.findOne({
      where: { id: followingId },
    });

    if (!followingUser) {
      throw new NotFoundException('팔로우할 사용자를 찾을 수 없습니다.');
    }

    // 이미 팔로우 중인지 확인
    const existingFollow = await this.followRepository.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (existingFollow) {
      throw new ConflictException('이미 팔로우 중입니다.');
    }

    // 팔로우 생성
    const follow = this.followRepository.create({
      follower_id: followerId,
      following_id: followingId,
    });

    await this.followRepository.save(follow);

    return {
      message: '팔로우가 완료되었습니다.',
    };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!follow) {
      throw new BadRequestException('팔로우하지 않은 사용자입니다.');
    }

    await this.followRepository.remove(follow);

    return {
      message: '언팔로우가 완료되었습니다.',
    };
  }

  async getFollowers(userId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository.findAndCount({
      where: { following_id: userId },
      relations: ['follower'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const followers = follows.map(follow => follow.follower);

    return {
      followers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFollowing(userId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository.findAndCount({
      where: { follower_id: userId },
      relations: ['following'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const following = follows.map(follow => follow.following);

    return {
      following,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isFollowing(followerId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    return {
      is_following: !!follow,
    };
  }
}
