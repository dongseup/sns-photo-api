import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { supabase } from '../config/supabase.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, username, password, bio } = signUpDto;

    // 이메일 중복 확인
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 사용자명 중복 확인
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUserByUsername) {
      throw new ConflictException('이미 사용 중인 사용자명입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      bio,
      is_verified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // 이메일 인증번호 발송
    await this.sendVerificationEmail(email);

    return {
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        is_verified: savedUser.is_verified,
      },
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // 사용자 찾기
    // 데이터베이스에서 입력된 이메일을 가진 사용자를 찾습니다.
    // select 옵션을 사용하여 필요한 필드만 조회합니다.
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password', 'is_verified'],
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 이메일 인증 확인
    if (!user.is_verified) {
      throw new UnauthorizedException('이메일 인증이 필요합니다.');
    }

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: '로그인이 완료되었습니다.',
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_verified: user.is_verified,
      },
    };
  }

  async verifyEmail(email: string, code: string) {
    // 실제 구현에서는 Supabase Auth를 사용하여 이메일 인증
    // 여기서는 간단한 시뮬레이션
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (user.is_verified) {
      throw new BadRequestException('이미 인증된 이메일입니다.');
    }

    // 인증 코드 확인 (실제로는 Supabase에서 확인)
    // 여기서는 간단히 '123456' 코드를 사용
    if (code !== '123456') {
      throw new BadRequestException('인증 코드가 올바르지 않습니다.');
    }

    // 사용자 인증 상태 업데이트
    user.is_verified = true;
    await this.userRepository.save(user);

    return {
      message: '이메일 인증이 완료되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_verified: user.is_verified,
      },
    };
  }

  async resendVerification(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (user.is_verified) {
      throw new BadRequestException('이미 인증된 이메일입니다.');
    }

    // 인증 이메일 재발송
    await this.sendVerificationEmail(email);

    return {
      message: '인증 이메일이 재발송되었습니다.',
    };
  }

  async logout(userId: string) {
    // 실제 구현에서는 토큰 블랙리스트에 추가
    // 여기서는 간단한 응답만 반환
    return {
      message: '로그아웃이 완료되었습니다.',
    };
  }

  private async sendVerificationEmail(email: string) {
    try {
      // Supabase Auth를 사용하여 이메일 발송
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL}/auth/verify`,
        },
      });

      if (error) {
        console.error('이메일 발송 오류:', error);
        throw new BadRequestException('이메일 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('이메일 발송 오류:', error);
      // 개발 환경에서는 에러를 무시하고 계속 진행
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException('이메일 발송에 실패했습니다.');
      }
    }
  }
}
