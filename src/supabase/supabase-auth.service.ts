import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseAuthService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL과 SUPABASE_ANON_KEY가 설정되지 않았습니다.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * 이메일과 비밀번호로 회원가입
   */
  async signUp(email: string, password: string, metadata?: any) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${this.configService.get<string>('FRONTEND_URL')}/auth/verify`,
        },
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        user: data.user,
        session: data.session,
        message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('회원가입 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이메일과 비밀번호로 로그인
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return {
        user: data.user,
        session: data.session,
        message: '로그인이 완료되었습니다.',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('로그인 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이메일 인증 확인
   */
  async verifyEmail(email: string, token: string) {
    try {
      const { data, error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        user: data.user,
        message: '이메일 인증이 완료되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('이메일 인증 중 오류가 발생했습니다.');
    }
  }

  /**
   * 인증 이메일 재발송
   */
  async resendVerificationEmail(email: string) {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${this.configService.get<string>('FRONTEND_URL')}/auth/verify`,
        },
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: '인증 이메일이 재발송되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('이메일 재발송 중 오류가 발생했습니다.');
    }
  }

  /**
   * 비밀번호 재설정 이메일 발송
   */
  async sendPasswordResetEmail(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password`,
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: '비밀번호 재설정 이메일이 발송되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.');
    }
  }

  /**
   * 비밀번호 업데이트
   */
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        user: data.user,
        message: '비밀번호가 성공적으로 업데이트되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('비밀번호 업데이트 중 오류가 발생했습니다.');
    }
  }

  /**
   * 로그아웃
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: '로그아웃이 완료되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('로그아웃 중 오류가 발생했습니다.');
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('사용자 정보를 가져오는 중 오류가 발생했습니다.');
    }
  }

  /**
   * 세션 새로고침
   */
  async refreshSession(refreshToken: string) {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('세션 새로고침 중 오류가 발생했습니다.');
    }
  }

  /**
   * 구글 소셜 로그인
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${this.configService.get<string>('FRONTEND_URL')}/auth/callback`,
        },
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        url: data.url,
        message: '구글 로그인 URL이 생성되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('구글 로그인 중 오류가 발생했습니다.');
    }
  }

  /**
   * 페이스북 소셜 로그인
   */
  async signInWithFacebook() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${this.configService.get<string>('FRONTEND_URL')}/auth/callback`,
        },
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        url: data.url,
        message: '페이스북 로그인 URL이 생성되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('페이스북 로그인 중 오류가 발생했습니다.');
    }
  }

  /**
   * 깃허브 소셜 로그인
   */
  async signInWithGithub() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${this.configService.get<string>('FRONTEND_URL')}/auth/callback`,
        },
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        url: data.url,
        message: '깃허브 로그인 URL이 생성되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('깃허브 로그인 중 오류가 발생했습니다.');
    }
  }

  /**
   * 소셜 로그인 콜백 처리
   */
  async handleSocialCallback(code: string, state: string) {
    try {
      const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        user: data.user,
        session: data.session,
        message: '소셜 로그인이 완료되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('소셜 로그인 콜백 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 소셜 로그인 사용자 정보 가져오기
   */
  async getSocialUserInfo(accessToken: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(accessToken);

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('소셜 사용자 정보를 가져오는 중 오류가 발생했습니다.');
    }
  }

  /**
   * SMS 인증번호 발송
   */
  async sendSmsOtp(phoneNumber: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: 'SMS 인증번호가 발송되었습니다.',
        phoneNumber,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('SMS 인증번호 발송 중 오류가 발생했습니다.');
    }
  }

  /**
   * SMS 인증번호 확인
   */
  async verifySmsOtp(phoneNumber: string, token: string) {
    try {
      const { data, error } = await this.supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        user: data.user,
        session: data.session,
        message: 'SMS 인증이 완료되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('SMS 인증번호 확인 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이메일 인증번호 발송 (OTP)
   */
  async sendEmailOtp(email: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${this.configService.get<string>('FRONTEND_URL')}/auth/verify`,
        },
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: '이메일 인증번호가 발송되었습니다.',
        email,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('이메일 인증번호 발송 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이메일 인증번호 확인 (OTP)
   */
  async verifyEmailOtp(email: string, token: string) {
    try {
      const { data, error } = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        user: data.user,
        session: data.session,
        message: '이메일 인증이 완료되었습니다.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('이메일 인증번호 확인 중 오류가 발생했습니다.');
    }
  }
}
