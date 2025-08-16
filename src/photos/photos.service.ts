import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo, User, Like, Comment } from '../entities';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createPhotoDto: CreatePhotoDto, file: Express.Multer.File, userId: string) {
    const { description } = createPhotoDto;
    
    // 파일 URL 생성 (실제로는 Supabase Storage에 업로드)
    const imageUrl = file ? `/uploads/${file.filename}` : '';

    const photo = this.photoRepository.create({
      user_id: userId,
      image_url: imageUrl,
      description,
      likes_count: 0,
      comments_count: 0,
    });

    const savedPhoto = await this.photoRepository.save(photo);

    return {
      message: '사진이 업로드되었습니다.',
      photo: savedPhoto,
    };
  }

  async findAll(query: { page?: number; limit?: number; userId?: string }) {
    const { page = 1, limit = 10, userId } = query;
    const skip = (page - 1) * limit;

    // 사진 목록을 가져오기 위한 쿼리 빌더를 생성합니다.
    // photo 테이블에서 데이터를 조회하며, 각 사진의 작성자(user) 정보도 함께 조인합니다.
    // 최신순으로 정렬하고, 페이지네이션을 위해 skip과 take를 사용합니다.
    const queryBuilder = this.photoRepository
      .createQueryBuilder('photo')
      .leftJoinAndSelect('photo.user', 'user')
      .orderBy('photo.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (userId) {
      queryBuilder.where('photo.user_id = :userId', { userId });
    }

    // getManyAndCount는 TypeORM의 QueryBuilder에서 제공하는 함수로,
    // 쿼리 결과의 엔티티 배열과 전체 개수를 동시에 반환합니다.
    // 예: [엔티티배열, 전체개수]
    const [photos, total] = await queryBuilder.getManyAndCount();

    return {
      photos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const photo = await this.photoRepository.findOne({
      where: { id },
      // relations 옵션은 TypeORM에서 엔티티를 조회할 때 연관된 엔티티(여기서는 'user')도 함께 가져오도록 지정합니다.
      relations: ['user'],
    });

    if (!photo) {
      throw new NotFoundException('사진을 찾을 수 없습니다.');
    }

    return photo;
  }

  async update(id: string, updatePhotoDto: UpdatePhotoDto, userId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException('사진을 찾을 수 없습니다.');
    }

    if (photo.user_id !== userId) {
      throw new ForbiddenException('사진을 수정할 권한이 없습니다.');
    }

    // 병합(merge)입니다. updatePhotoDto의 값만 photo에 덮어씌웁니다.
    Object.assign(photo, updatePhotoDto);
    const updatedPhoto = await this.photoRepository.save(photo);

    return {
      message: '사진이 수정되었습니다.',
      photo: updatedPhoto,
    };
  }

  async remove(id: string, userId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException('사진을 찾을 수 없습니다.');
    }

    if (photo.user_id !== userId) {
      throw new ForbiddenException('사진을 삭제할 권한이 없습니다.');
    }

    await this.photoRepository.remove(photo);

    return {
      message: '사진이 삭제되었습니다.',
    };
  }

  async likePhoto(photoId: string, userId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('사진을 찾을 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.likeRepository.findOne({
      where: { user_id: userId, photo_id: photoId },
    });

    if (existingLike) {
      throw new BadRequestException('이미 좋아요를 눌렀습니다.');
    }

    // 좋아요 생성
    const like = this.likeRepository.create({
      user_id: userId,
      photo_id: photoId,
    });

    await this.likeRepository.save(like);

    // 좋아요 수 증가
    photo.likes_count += 1;
    await this.photoRepository.save(photo);

    return {
      message: '좋아요가 추가되었습니다.',
    };
  }

  async unlikePhoto(photoId: string, userId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('사진을 찾을 수 없습니다.');
    }

    // 좋아요 찾기
    const like = await this.likeRepository.findOne({
      where: { user_id: userId, photo_id: photoId },
    });

    if (!like) {
      throw new BadRequestException('좋아요를 누르지 않았습니다.');
    }

    // 좋아요 삭제
    await this.likeRepository.remove(like);

    // 좋아요 수 감소
    photo.likes_count -= 1;
    await this.photoRepository.save(photo);

    return {
      message: '좋아요가 취소되었습니다.',
    };
  }

  async addComment(photoId: string, content: string, userId: string) {
    const photo = await this.photoRepository.findOne({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('사진을 찾을 수 없습니다.');
    }

    // 댓글 생성
    const comment = this.commentRepository.create({
      user_id: userId,
      photo_id: photoId,
      content,
    });

    await this.commentRepository.save(comment);

    // 댓글 수 증가
    photo.comments_count += 1;
    await this.photoRepository.save(photo);

    return {
      message: '댓글이 추가되었습니다.',
      comment,
    };
  }

  async getComments(photoId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { photo_id: photoId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
