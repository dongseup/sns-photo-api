import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Photo } from './photo.entity';

@Entity('users')
export class User {
  // uuid는 Universally Unique Identifier(범용 고유 식별자)로, 전 세계적으로 유일한 값을 생성하는 표준입니다.
  // 여기서 'uuid'를 사용하는 이유는 각 사용자의 id가 충돌 없이 고유하게 생성되도록 보장하기 위함입니다.
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false }) // 기본적으로 조회에서 제외
  password: string;

  @Column({ nullable: true })
  profile_image: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: false })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // @OneToMany 데코레이터는 User 엔티티가 여러 개의 Photo 엔티티와 1:N(OneToMany) 관계임을 나타냅니다.
  // 즉, 한 명의 사용자가 여러 개의 사진을 가질 수 있습니다.
  // 첫 번째 인자는 연결할 엔티티(Photo)를 반환하는 함수이고,
  // 두 번째 인자는 Photo 엔티티에서 이 관계를 역참조할 때 사용할 필드(photo.user)를 지정합니다.
  @OneToMany(() => Photo, photo => photo.user)
  photos: Photo[];
}
