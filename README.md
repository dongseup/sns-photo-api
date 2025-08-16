# 📸 PhotoApp Backend API

<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  <h3>Instagram 스타일의 소셜 미디어 플랫폼</h3>
  <p>사진 공유, 좋아요, 댓글, 팔로우 기능을 제공하는 RESTful API</p>
</div>

## 🚀 프로젝트 개요

PhotoApp은 Instagram과 유사한 소셜 미디어 플랫폼의 백엔드 API입니다. 사용자들이 사진을 업로드하고, 좋아요를 누르며, 댓글을 작성하고, 다른 사용자를 팔로우할 수 있는 완전한 기능을 제공합니다.

### ✨ 주요 기능

- 🔐 **JWT 기반 인증 시스템**
- 📧 **이메일 인증**
- 📸 **사진 업로드 및 관리**
- ❤️ **좋아요 시스템**
- 💬 **댓글 시스템**
- 👥 **팔로우/언팔로우**
- 🔍 **사용자 검색**
- 📱 **페이지네이션**

## 🛠 기술 스택

### Backend
- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer
- **Email Service**: Supabase Auth

### Infrastructure
- **Cloud Database**: Supabase
- **File Storage**: Supabase Storage (예정)
- **Environment**: Docker (예정)

## 📁 프로젝트 구조

```
src/
├── auth/                 # 인증 관련 모듈
│   ├── dto/             # 데이터 전송 객체
│   ├── guards/          # JWT 가드
│   ├── strategies/      # Passport 전략
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # 사용자 관리 모듈
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── photos/              # 사진 관리 모듈
│   ├── dto/
│   ├── photos.controller.ts
│   ├── photos.service.ts
│   └── photos.module.ts
├── entities/            # 데이터베이스 엔티티
│   ├── user.entity.ts
│   ├── photo.entity.ts
│   ├── like.entity.ts
│   ├── comment.entity.ts
│   ├── follow.entity.ts
│   └── index.ts
├── config/              # 설정 파일
│   ├── database.config.ts
│   ├── supabase.config.ts
│   └── multer.config.ts
├── database/            # 데이터베이스 모듈
├── supabase/            # Supabase 모듈
└── main.ts              # 애플리케이션 진입점
```

## 🗄 데이터베이스 스키마

### Users 테이블
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `username` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `profile_image` (VARCHAR)
- `bio` (TEXT)
- `is_verified` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Photos 테이블
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `image_url` (VARCHAR)
- `description` (TEXT)
- `likes_count` (INTEGER)
- `comments_count` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Likes 테이블
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `photo_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMP)

### Comments 테이블
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `photo_id` (UUID, Foreign Key)
- `content` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Follows 테이블
- `id` (UUID, Primary Key)
- `follower_id` (UUID, Foreign Key)
- `following_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMP)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 
- PostgreSQL 14+
- npm 또는 yarn

### 1. 저장소 클론

```bash
git clone https://github.com/dongseup/sns-photo-api.git
cd sns-photo-api
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=photoapp

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development

# Security Configuration
CORS_ORIGIN=http://localhost:3000
API_PREFIX=api
```

### 4. 데이터베이스 설정

```bash
# PostgreSQL 서비스 시작 (macOS)
brew services start postgresql@14

# 데이터베이스 생성
psql postgres -c "CREATE DATABASE photoapp;"

# 사용자 생성
psql postgres -c "CREATE USER your_username WITH PASSWORD 'your_password';"

# 권한 부여
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE photoapp TO your_username;"
```

### 5. 애플리케이션 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 📚 API 문서

### 기본 정보
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **인증**: JWT Bearer Token (필요한 엔드포인트에만)

### 주요 엔드포인트

#### 인증 API (6개)
- `POST /auth/signup` - 회원가입
- `POST /auth/signin` - 로그인
- `POST /auth/verify-email` - 이메일 인증
- `POST /auth/resend-verification` - 인증 재발송
- `GET /auth/profile` - 프로필 조회
- `POST /auth/logout` - 로그아웃

#### 사진 API (9개)
- `GET /photos` - 사진 목록 조회
- `GET /photos/:id` - 사진 상세 조회
- `POST /photos` - 사진 업로드
- `PUT /photos/:id` - 사진 수정
- `DELETE /photos/:id` - 사진 삭제
- `POST /photos/:id/like` - 좋아요
- `DELETE /photos/:id/like` - 좋아요 취소
- `POST /photos/:id/comments` - 댓글 추가
- `GET /photos/:id/comments` - 댓글 조회

#### 사용자 API (10개)
- `GET /users` - 사용자 목록 조회
- `GET /users/:id` - 사용자 상세 조회
- `GET /users/profile/me` - 내 프로필 조회
- `PUT /users/profile` - 프로필 수정
- `GET /users/:id/photos` - 사용자별 사진 조회
- `POST /users/:id/follow` - 팔로우
- `DELETE /users/:id/follow` - 언팔로우
- `GET /users/:id/followers` - 팔로워 목록
- `GET /users/:id/following` - 팔로잉 목록
- `GET /users/:id/is-following` - 팔로우 상태 확인

자세한 API 문서는 [API_ENDPOINTS.md](./API_ENDPOINTS.md)를 참조하세요.

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# e2e 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start:prod

# 코드 포맷팅
npm run format

# 린팅
npm run lint
```

## 🛡 보안 기능

- **JWT 토큰 인증**: 안전한 사용자 인증
- **비밀번호 해싱**: bcrypt를 사용한 안전한 비밀번호 저장
- **이메일 인증**: Supabase Auth를 통한 이메일 인증
- **권한 검증**: 각 작업별 권한 확인
- **입력 검증**: DTO를 통한 데이터 검증
- **CORS 설정**: 안전한 크로스 오리진 요청

## 📊 성능 최적화

- **페이지네이션**: 대용량 데이터 처리
- **관계 로딩**: 필요한 데이터만 조회
- **쿼리 최적화**: TypeORM QueryBuilder 사용
- **인덱스 활용**: 효율적인 검색

## 🚀 배포

### Docker를 사용한 배포 (예정)

```bash
# Docker 이미지 빌드
docker build -t photoapp-backend .

# 컨테이너 실행
docker run -p 3000:3000 photoapp-backend
```

### 클라우드 배포

- **Vercel**: Serverless 배포
- **Railway**: 간편한 배포
- **Heroku**: 클라우드 플랫폼
- **AWS**: EC2 + RDS

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **개발자**: Dongseup Lim
- **GitHub**: [@dongseup](https://github.com/dongseup)
- **프로젝트 링크**: [https://github.com/dongseup/sns-photo-api](https://github.com/dongseup/sns-photo-api)

## 🙏 감사의 말

- [NestJS](https://nestjs.com/) - 훌륭한 Node.js 프레임워크
- [TypeORM](https://typeorm.io/) - 강력한 ORM
- [Supabase](https://supabase.com/) - 백엔드 서비스
- [PostgreSQL](https://www.postgresql.org/) - 안정적인 데이터베이스

---

<div align="center">
  <p>⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!</p>
</div>
