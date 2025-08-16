import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseDatabaseService } from './supabase-database.service';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseAuthService, SupabaseDatabaseService],
  exports: [SupabaseAuthService, SupabaseDatabaseService],
})
export class SupabaseModule {}
