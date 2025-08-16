# 📸 Photo App Backend API

Instagram과 같은 사진 공유 소셜 네트워킹 서비스의 백엔드 API입니다.

## 🚀 주요 기능

### 🔐 인증 시스템
- **Supabase Auth 기반 인증**: 이메일/비밀번호 회원가입 및 로그인
- **소셜 로그인**: Google, Facebook, GitHub 지원
- **이메일 인증**: 회원가입 후 이메일 인증 필수
- **비밀번호 재설정**: 안전한 비밀번호 재설정 프로세스
- **JWT 토큰**: 세션 관리 및 API 보안

### 👥 사용자 관리
- **프로필 관리**: 사용자명, 소개, 프로필 이미지
- **팔로우 시스템**: 사용자 간 팔로우/언팔로우
- **사용자 검색**: 사용자명 및 이메일로 검색

### 📷 사진 관리
- **사진 업로드**: 이미지 파일 업로드 및 저장
- **사진 피드**: 팔로우한 사용자들의 사진 피드
- **사진 상세**: 개별 사진 상세 정보 및 댓글

### ❤️ 상호작용
- **좋아요**: 사진에 좋아요/좋아요 취소
- **댓글**: 사진에 댓글 작성, 수정, 삭제
- **알림**: 좋아요, 댓글, 팔로우 알림

## 🛠 기술 스택

### Backend Framework
- **NestJS**: Node.js 기반의 효율적이고 확장 가능한 서버 사이드 애플리케이션 프레임워크
- **TypeScript**: 정적 타입 검사로 안정성과 개발 생산성 향상

### Database & Backend Services
- **Supabase**: PostgreSQL 기반의 완전 관리형 백엔드 서비스
  - **Supabase Auth**: 인증 및 권한 관리
  - **Supabase Database**: PostgreSQL 데이터베이스
  - **Row Level Security (RLS)**: 데이터베이스 레벨 보안
  - **Real-time**: 실시간 데이터 동기화

### Authentication & Security
- **JWT (JSON Web Tokens)**: 무상태 인증
- **Passport.js**: 인증 미들웨어
- **bcryptjs**: 비밀번호 해싱
- **CORS**: Cross-Origin Resource Sharing 설정

### File Handling
- **Multer**: multipart/form-data 처리
- **Supabase Storage**: 파일 저장소 (향후 구현 예정)

## 📁 프로젝트 구조

```
src/
├── auth/                    # 인증 관련 모듈
│   ├── dto/                # 데이터 전송 객체
│   ├── guards/             # 인증 가드
│   ├── strategies/         # Passport 전략
│   ├── auth.controller.ts  # 인증 컨트롤러
│   ├── auth.service.ts     # 인증 서비스
│   └── auth.module.ts      # 인증 모듈
├── supabase/               # Supabase 관련 모듈
│   ├── supabase-auth.service.ts      # Supabase Auth 서비스
│   ├── supabase-database.service.ts  # Supabase Database 서비스
│   └── supabase.module.ts            # Supabase 모듈
├── users/                  # 사용자 관리 모듈
├── photos/                 # 사진 관리 모듈
├── config/                 # 설정 파일
│   ├── database.config.ts  # 데이터베이스 설정 (TypeORM)
│   └── supabase.config.ts  # Supabase 설정
└── main.ts                 # 애플리케이션 진입점
```

## 🗄 데이터베이스 스키마

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_image TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  social_provider TEXT,
  social_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Photos Table
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Likes Table
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, photo_id)
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Follows Table
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

## 🚀 시작하기

### 1. 환경 설정

#### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Supabase 계정 및 프로젝트

#### 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Security Configuration
CORS_ORIGIN=http://localhost:3000
API_PREFIX=api
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase-schema.sql` 파일의 내용을 Supabase SQL Editor에서 실행
3. 환경 변수에 Supabase 프로젝트 URL과 API 키 설정

### 4. 애플리케이션 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 모드
npm run start:prod
```

## 📚 API 문서

### 인증 API

#### 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "bio": "안녕하세요!"
}
```

#### 로그인
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 소셜 로그인
```http
POST /api/auth/google
POST /api/auth/facebook
POST /api/auth/github
```

#### 이메일 인증
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "verification_code"
}
```

#### 비밀번호 재설정
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 사용자 API

#### 프로필 조회
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### 사용자 검색
```http
GET /api/users/search?q=username
Authorization: Bearer <jwt_token>
```

### 사진 API

#### 사진 업로드
```http
POST /api/photos
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "image": <file>,
  "description": "멋진 사진입니다!"
}
```

#### 사진 피드
```http
GET /api/photos/feed?page=1&limit=10
Authorization: Bearer <jwt_token>
```

## 🔒 보안 기능

### Row Level Security (RLS)
- **사용자 데이터**: 자신의 프로필만 수정 가능
- **사진**: 자신의 사진만 수정/삭제 가능
- **좋아요/댓글**: 자신의 좋아요/댓글만 관리 가능
- **팔로우**: 자신의 팔로우 관계만 관리 가능

### JWT 토큰
- **토큰 만료**: 7일 후 자동 만료
- **보안 헤더**: Authorization Bearer 토큰 사용
- **토큰 검증**: 모든 보호된 엔드포인트에서 검증

### 입력 검증
- **DTO 검증**: class-validator를 통한 입력 데이터 검증
- **타입 안전성**: TypeScript를 통한 컴파일 타임 검증
- **SQL 인젝션 방지**: Supabase의 파라미터화된 쿼리 사용

## ⚡ 성능 최적화

### 데이터베이스 최적화
- **인덱스**: 자주 조회되는 컬럼에 인덱스 설정
- **페이지네이션**: 대용량 데이터 처리
- **트리거**: 자동 카운트 업데이트

### 캐싱 전략
- **Redis**: 세션 및 자주 조회되는 데이터 캐싱 (향후 구현)
- **CDN**: 정적 파일 전송 최적화 (향후 구현)

## 🚀 배포 옵션

### 1. Vercel (추천)
```bash
npm install -g vercel
vercel
```

### 2. Railway
```bash
npm install -g @railway/cli
railway login
railway up
```

### 3. Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/dongseup/sns-photo-api](https://github.com/dongseup/sns-photo-api)

---

**Supabase Database 기반의 완전한 사진 공유 API** 🎉
