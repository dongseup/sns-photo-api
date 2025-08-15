import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, Photo, Like, Comment, Follow } from '../entities';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'photoapp',
  entities: [User, Photo, Like, Comment, Follow],
  synchronize: process.env.NODE_ENV === 'development', // 개발 환경에서만 true
  logging: process.env.NODE_ENV === 'development',
};
