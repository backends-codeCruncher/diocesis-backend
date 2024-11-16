import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ValidRoles } from '../enums/valid-roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  username: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column({
    array: true,
    type: 'enum',
    enum: ValidRoles,
    default: [ValidRoles.user],
  })
  roles: string[];

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User)
  deletedBy?: User;

  @ManyToOne(() => User)
  updatedBy?: User;

  markAsDeleted(deletedBy?: User) {
    this.deletedAt = new Date();
    this.isActive = false;
    if (this.deletedBy) this.deletedBy = deletedBy;
  }
}
