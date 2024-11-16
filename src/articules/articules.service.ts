import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Articule } from './entities/articule.entity';
import { Between, Repository } from 'typeorm';
import { BaseService } from '../common/services/base.service';
import { User } from '../auth/entities/user.entity';
import { CreateArticuleDto, UpdateArticuleDto } from './dto';
import { PaginationDto } from '../common/dto';

@Injectable()
export class ArticulesService {
  constructor(
    @InjectRepository(Articule)
    private readonly articuleRepository: Repository<Articule>,
    private readonly baseService: BaseService,
  ) {}

  async create(admin: User, createArticuleDto: CreateArticuleDto) {
    try {
      const articule = this.articuleRepository.create({
        ...createArticuleDto,
        createdAt: new Date(),
        createdBy: admin,
      });

      await this.articuleRepository.save(articule);
      return { articule };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async update(
    admin: User,
    updateArticuleDto: UpdateArticuleDto,
    articuleId: string,
  ) {
    await this.getArticuleById(articuleId);

    const articule = await this.articuleRepository.preload({
      id: articuleId,
      ...updateArticuleDto,
      updatedAt: new Date(),
      updatedBy: admin,
    });

    try {
      await this.articuleRepository.save(articule);

      return { articule };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async delete(articuleId: string) {
    const articule = await this.getArticuleById(articuleId);
    await this.articuleRepository.delete(articuleId);
    return { articule };
  }

  async deleteByYear(selectedYear: number) {
    const startDate = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`);

    const articulesList = await this.articuleRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    if (articulesList.length === 0) {
      throw new BadRequestException(
        `Articules for the year ${selectedYear} not found`,
      );
    }

    await this.articuleRepository.remove(articulesList);

    return {
      message: `${articulesList.length} articules from year ${selectedYear} have been removed succesfully.`,
    };
  }

  async getArticuleById(articuleId: string) {
    const articule = await this.articuleRepository.findOneBy({
      id: articuleId,
    });
    if (!articule)
      throw new NotFoundException(`Articule with id ${articuleId} not found`);
    return { articule };
  }

  async getAllArticules(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const [articules, total] = await this.articuleRepository.findAndCount({
        select: ['id', 'title', 'content', 'createdBy'],
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: articules,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async getAllArticulesByTerm(term: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const [articules, total] = await this.articuleRepository
        .createQueryBuilder('news')
        .where('news.title ILIKE :term', { term: `%${term}%` })
        .orWhere(':term = ANY(news.tags)', { term })
        .select([
          'news.id',
          'news.title',
          'news.content',
          'news.createdBy',
          'news.tags',
        ])
        .take(limit)
        .skip((page - 1) * limit)
        .getManyAndCount();

      return {
        data: articules,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }
}
