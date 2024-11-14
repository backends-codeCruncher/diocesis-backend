import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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
}
