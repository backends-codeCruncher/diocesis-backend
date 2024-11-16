import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { ILike, Repository } from 'typeorm';
import { UpdateUserDto } from '../auth/dto';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly baseService: BaseService,
  ) {}

  async getAllUsers(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const [users, total] = await this.userRepository.findAndCount({
        select: ['id', 'username', 'roles'],
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: users,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async getAllUsersByTerm(term: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const [users, total] = await this.userRepository.findAndCount({
        where: [
          {
            username: ILike(`%${term}%`),
            isActive: true,
          },
        ],
        select: ['id', 'username', 'roles'],
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: users,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async updateUser(admin: User, userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id: userId,
      ...updateUserDto,
      updatedBy: admin,
      updatedAt: new Date(),
    });

    if (!user) throw new BadRequestException('Error trying to update user');

    try {
      await this.userRepository.save(user);
      return { user };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async deleteUser(admin: User, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user || !user.isActive) {
      throw new BadRequestException('User not found or not active');
    }

    try {
      user.markAsDeleted(admin);
      await this.userRepository.save(user);

      delete user.password;
      delete user.deletedBy.password;

      return {
        user,
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }
}
