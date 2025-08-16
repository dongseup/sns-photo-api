import { IsString, IsOptional } from 'class-validator';

export class SocialCallbackDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export class SocialUserInfoDto {
  @IsString()
  accessToken: string;
}
