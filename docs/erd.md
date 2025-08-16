# PhotoApp Database ERD

## Entity Relationship Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar username UK
        varchar profile_image nullable
        text bio nullable
        boolean is_verified default=false
        timestamp created_at
        timestamp updated_at
    }
    
    photos {
        uuid id PK
        uuid user_id FK
        varchar image_url
        text description nullable
        integer likes_count default=0
        integer comments_count default=0
        timestamp created_at
        timestamp updated_at
    }
    
    likes {
        uuid id PK
        uuid user_id FK
        uuid photo_id FK
        timestamp created_at
    }
    
    comments {
        uuid id PK
        uuid user_id FK
        uuid photo_id FK
        text content
        timestamp created_at
        timestamp updated_at
    }
    
    follows {
        uuid id PK
        uuid follower_id FK
        uuid following_id FK
        timestamp created_at
    }
    
    users ||--o{ photos : "has"
    users ||--o{ likes : "creates"
    users ||--o{ comments : "writes"
    users ||--o{ follows : "follower"
    users ||--o{ follows : "following"
    photos ||--o{ likes : "receives"
    photos ||--o{ comments : "has"
```

## Relationships

1. **User → Photo**: 1:N (한 사용자가 여러 사진 업로드)
2. **User → Like**: 1:N (한 사용자가 여러 좋아요)
3. **User → Comment**: 1:N (한 사용자가 여러 댓글)
4. **User → Follow**: 1:N (팔로워/팔로잉 관계)
5. **Photo → Like**: 1:N (한 사진에 여러 좋아요)
6. **Photo → Comment**: 1:N (한 사진에 여러 댓글)

## Constraints

- **Unique Constraints**:
  - `users.email`: 이메일 중복 방지
  - `users.username`: 사용자명 중복 방지
  - `likes(user_id, photo_id)`: 중복 좋아요 방지
  - `follows(follower_id, following_id)`: 중복 팔로우 방지