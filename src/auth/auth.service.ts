import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseAuthService } from '../supabase/supabase-auth.service';
import { SupabaseDatabaseService } from '../supabase/supabase-database.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly supabaseDatabaseService: SupabaseDatabaseService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, username, password, bio } = signUpDto;

    // 이메일 중복 확인
    const existingUserByEmail = await this.supabaseDatabaseService.getUserByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 사용자명 중복 확인
    const existingUserByUsername = await this.supabaseDatabaseService.getUserByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('이미 사용 중인 사용자명입니다.');
    }

    // Supabase Auth로 회원가입
    const supabaseResult = await this.supabaseAuthService.signUp(email, password, {
      username,
      bio,
    });

    if (!supabaseResult.user) {
      throw new BadRequestException('회원가입 중 오류가 발생했습니다.');
    }

    // Supabase Database에 사용자 프로필 저장
    const userProfile = await this.supabaseDatabaseService.createUserProfile({
      id: supabaseResult.user.id,
      email,
      username,
      bio,
    });

    return {
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        username: userProfile.username,
        is_verified: userProfile.is_verified,
      },
      supabaseUser: supabaseResult.user,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // Supabase Auth로 로그인
    const supabaseResult = await this.supabaseAuthService.signIn(email, password);

    // Supabase Database에서 사용자 정보 가져오기
    const user = await this.supabaseDatabaseService.getUserByEmail(email);

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
        profile_image: user.profile_image,
      },
      supabaseSession: supabaseResult.session,
    };
  }

  async verifyEmail(email: string, token: string) {
    // Supabase Auth로 이메일 인증
    const supabaseResult = await this.supabaseAuthService.verifyEmail(email, token);

    // Supabase Database에서 사용자 정보 업데이트
    const user = await this.supabaseDatabaseService.getUserByEmail(email);

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // 사용자 인증 상태 업데이트
    await this.supabaseDatabaseService.updateUserProfile(user.id, {
      is_verified: true,
    });

    return {
      message: '이메일 인증이 완료되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_verified: true,
      },
      supabaseUser: supabaseResult.user,
    };
  }

  async resendVerification(email: string) {
    const user = await this.supabaseDatabaseService.getUserByEmail(email);

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
    
    if (!result.user?.email) {
      throw new BadRequestException('소셜 로그인에서 이메일 정보를 가져올 수 없습니다.');
    }
    
    // Supabase Database에서 사용자 정보 확인/생성
    let user = await this.supabaseDatabaseService.getUserByEmail(result.user.email);

    if (!user) {
      // 새로운 소셜 사용자 생성
      const socialUserData = result.user.user_metadata || {};
      const socialProvider = result.user.app_metadata?.provider || 'unknown';
      
      user = await this.supabaseDatabaseService.createUserProfile({
        id: result.user.id,
        email: result.user.email,
        username: socialUserData.username || socialUserData.name || `user_${Date.now()}`,
        bio: socialUserData.bio || '',
        profile_image: socialUserData.avatar_url || socialUserData.picture || '',
        social_provider: socialProvider,
        social_id: result.user.id,
      });
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

  async getCurrentUser(userId: string) {
    const user = await this.supabaseDatabaseService.getUserProfile(userId);
    
    if (!user) {
      throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profile_image: user.profile_image,
      is_verified: user.is_verified,
      social_provider: user.social_provider,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
