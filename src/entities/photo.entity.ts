import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  image_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  likes_count: number;

  @Column({ default: 0 })
  comments_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 이 부분은 Photo 엔티티에서 User 엔티티와의 관계를 나타냅니다.
  // @ManyToOne 데코레이터는 여러 개의 Photo가 하나의 User에 속할 수 있음을 의미합니다.
  // user.photos는 User 엔티티에서 photos라는 속성으로 Photo들을 참조합니다.
  // @JoinColumn({ name: 'user_id' })는 이 관계에서 외래키로 'user_id' 컬럼을 사용함을 명시합니다.
  @ManyToOne(() => User, user => user.photos)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
