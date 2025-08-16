# PhotoApp API 엔드포인트 문서

## 기본 정보
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **인증**: JWT Bearer Token (필요한 엔드포인트에만)

## 인증 API

### 회원가입
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "bio": "자기소개 (선택사항)"
}
```

### 로그인
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 이메일 인증
```http
POST /auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

### 인증 재발송
```http
POST /auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 프로필 조회 (인증 필요)
```http
GET /auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### 로그아웃 (인증 필요)
```http
POST /auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

## 사진 API

### 사진 목록 조회
```http
GET /photos?page=1&limit=10&userId=USER_ID
```

### 사진 상세 조회
```http
GET /photos/:id
```

### 사진 업로드 (인증 필요)
```http
POST /photos
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "description": "사진 설명 (선택사항)",
  "image": "파일"
}
```

### 사진 수정 (인증 필요)
```http
PUT /photos/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "description": "수정된 사진 설명"
}
```

### 사진 삭제 (인증 필요)
```http
DELETE /photos/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### 사진 좋아요 (인증 필요)
```http
POST /photos/:id/like
Authorization: Bearer YOUR_JWT_TOKEN
```

### 사진 좋아요 취소 (인증 필요)
```http
DELETE /photos/:id/like
Authorization: Bearer YOUR_JWT_TOKEN
```

### 댓글 추가 (인증 필요)
```http
POST /photos/:id/comments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "댓글 내용"
}
```

### 댓글 조회
```http
GET /photos/:id/comments?page=1&limit=10
```

## 사용자 API

### 사용자 목록 조회
```http
GET /users?page=1&limit=10&search=검색어
```

### 사용자 상세 조회
```http
GET /users/:id
```

### 내 프로필 조회 (인증 필요)
```http
GET /users/profile/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### 프로필 수정 (인증 필요)
```http
PUT /users/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

{
  "username": "새로운 사용자명",
  "bio": "새로운 자기소개",
  "profile_image": "파일"
}
```

### 사용자별 사진 조회 (인증 필요)
```http
GET /users/:id/photos?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

### 사용자 팔로우 (인증 필요)
```http
POST /users/:id/follow
Authorization: Bearer YOUR_JWT_TOKEN
```

### 사용자 언팔로우 (인증 필요)
```http
DELETE /users/:id/follow
Authorization: Bearer YOUR_JWT_TOKEN
```

### 팔로워 목록 조회
```http
GET /users/:id/followers?page=1&limit=10
```

### 팔로잉 목록 조회
```http
GET /users/:id/following?page=1&limit=10
```

### 팔로우 상태 확인 (인증 필요)
```http
GET /users/:id/is-following
Authorization: Bearer YOUR_JWT_TOKEN
```

## 응답 형식

### 성공 응답
```json
{
  "message": "성공 메시지",
  "data": {
    // 응답 데이터
  }
}
```

### 에러 응답
```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

## 상태 코드

- `200`: 성공
- `201`: 생성됨
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 리소스를 찾을 수 없음
- `409`: 충돌 (중복 등)
- `500`: 서버 오류

## 페이지네이션

페이지네이션이 지원되는 엔드포인트는 다음 쿼리 파라미터를 사용합니다:

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)

응답에는 다음 정보가 포함됩니다:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```
