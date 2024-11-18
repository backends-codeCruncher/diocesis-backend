import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { DocumentEnum } from '../enums/document-types.enum';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  document: string;

  @Column({
    type: 'enum',
    enum: DocumentEnum,
    nullable: true,
  })
  type: DocumentEnum;

  @Column({
    array: true,
    type: 'text',
    default: [],
  })
  tags: string[];

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  createdBy: User;

  @CreateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  updatedBy?: User;

  @CreateDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User)
  deletedBy?: User;

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
