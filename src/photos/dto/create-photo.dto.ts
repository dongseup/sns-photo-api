import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePhotoDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
