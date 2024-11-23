import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('priests')
export class Priest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  firstName: string;
  @Column('text')
  lastName: string;

  @Column('datetime')
  birthDate: Date;

  @Column('text')
  picture: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @ManyToOne(() => User)
  createdBy: User;
  @ManyToOne(() => User)
  updatedBy?: User;
  @ManyToOne(() => User)
  deletedBy?: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @CreateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;
  @CreateDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  markAsDeleted(deletedBy?: User) {
    this.deletedAt = new Date();
    this.isActive = false;
    if (this.deletedBy) this.deletedBy = deletedBy;
  }

  markAsUpdated(updatedBy?: User) {
    this.updatedAt = new Date();
    if (this.updatedBy) this.updatedBy = updatedBy;
  }
}
