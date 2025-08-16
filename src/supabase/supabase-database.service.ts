import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseDatabaseService {
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
   * 사용자 프로필 생성
   */
  async createUserProfile(userData: {
    id: string;
    email: string;
    username: string;
    bio?: string;
    profile_image?: string;
    social_provider?: string;
    social_id?: string;
    is_verified?: boolean;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('사용자 프로필 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }
        throw new BadRequestException(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('사용자 프로필 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail(email: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new BadRequestException(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('사용자 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자명으로 사용자 조회
   */
  async getUserByUsername(username: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new BadRequestException(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('사용자 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자 프로필 업데이트
   */
  async updateUserProfile(userId: string, updateData: {
    username?: string;
    bio?: string;
    profile_image?: string;
    is_verified?: boolean;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('사용자 프로필 업데이트 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(userId: string) {
    try {
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new BadRequestException(error.message);
      }

      return { message: '사용자가 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('사용자 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * 모든 사용자 조회 (관리자용)
   */
  async getAllUsers(limit = 50, offset = 0) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('사용자 목록 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 사용자 검색
   */
  async searchUsers(query: string, limit = 20) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        throw new BadRequestException(error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('사용자 검색 중 오류가 발생했습니다.');
    }
  }
}
