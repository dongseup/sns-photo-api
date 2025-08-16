import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SupabaseAuthService } from '../supabase/supabase-auth.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly supabaseAuthService: SupabaseAuthService,
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

    // Supabase Auth로 회원가입
    const supabaseResult = await this.supabaseAuthService.signUp(email, password, {
      username,
      bio,
    });

    // 로컬 데이터베이스에 사용자 정보 저장
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      bio,
      is_verified: false,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        is_verified: savedUser.is_verified,
      },
      supabaseUser: supabaseResult.user,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // Supabase Auth로 로그인
    const supabaseResult = await this.supabaseAuthService.signIn(email, password);

    // 로컬 데이터베이스에서 사용자 정보 가져오기
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'is_verified'],
    });

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
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
      supabaseSession: supabaseResult.session,
    };
  }

  async verifyEmail(email: string, token: string) {
    // Supabase Auth로 이메일 인증
    const supabaseResult = await this.supabaseAuthService.verifyEmail(email, token);

    // 로컬 데이터베이스에서 사용자 정보 업데이트
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
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
      supabaseUser: supabaseResult.user,
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

    // Supabase Auth로 인증 이메일 재발송
    await this.supabaseAuthService.resendVerificationEmail(email);

    return {
      message: '인증 이메일이 재발송되었습니다.',
    };
  }

  async logout(userId: string) {
    // Supabase Auth로 로그아웃
    await this.supabaseAuthService.signOut();
    
    return {
      message: '로그아웃이 완료되었습니다.',
    };
  }

  async resetPassword(email: string) {
    // Supabase Auth로 비밀번호 재설정 이메일 발송
    await this.supabaseAuthService.sendPasswordResetEmail(email);
    
    return {
      message: '비밀번호 재설정 이메일이 발송되었습니다.',
    };
  }

  async updatePassword(newPassword: string) {
    // Supabase Auth로 비밀번호 업데이트
    const result = await this.supabaseAuthService.updatePassword(newPassword);
    
    return {
      message: '비밀번호가 성공적으로 업데이트되었습니다.',
      user: result.user,
    };
  }

  async signInWithGoogle() {
    // 구글 소셜 로그인 URL 생성
    const result = await this.supabaseAuthService.signInWithGoogle();
    
    return {
      message: result.message,
      url: result.url,
    };
  }

  async signInWithFacebook() {
    // 페이스북 소셜 로그인 URL 생성
    const result = await this.supabaseAuthService.signInWithFacebook();
    
    return {
      message: result.message,
      url: result.url,
    };
  }

  async signInWithGithub() {
    // 깃허브 소셜 로그인 URL 생성
    const result = await this.supabaseAuthService.signInWithGithub();
    
    return {
      message: result.message,
      url: result.url,
    };
  }

  async handleSocialCallback(code: string, state: string) {
    // 소셜 로그인 콜백 처리
    const result = await this.supabaseAuthService.handleSocialCallback(code, state);
    
    // 로컬 데이터베이스에서 사용자 정보 확인/생성
    let user = await this.userRepository.findOne({
      where: { email: result.user.email },
    });

    if (!user) {
      // 새로운 소셜 사용자 생성
      const socialUserData = result.user.user_metadata || {};
      user = this.userRepository.create({
        id: result.user.id,
        email: result.user.email,
        username: socialUserData.username || socialUserData.name || `user_${Date.now()}`,
        password: '', // 소셜 사용자는 비밀번호 없음
        bio: socialUserData.bio || '',
        is_verified: true, // 소셜 사용자는 자동 인증
        profile_image: socialUserData.avatar_url || socialUserData.picture || '',
      });
      
      await this.userRepository.save(user);
    }

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: '소셜 로그인이 완료되었습니다.',
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_verified: user.is_verified,
        profile_image: user.profile_image,
      },
      supabaseSession: result.session,
    };
  }
}
