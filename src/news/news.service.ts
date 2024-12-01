import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto';
import { Between, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { BaseService } from '../common/services/base.service';
import { CreateNewDto, UpdateNewDto } from './dto';
import { New } from './entities/new.entity';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(New)
    private readonly newRepository: Repository<New>,
    private readonly baseService: BaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    admin: User,
    createNewDto: CreateNewDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    const picture = await this.cloudinaryService.uploadImage('Noticias', file);

    createNewDto.picture = picture.secure_url;

    try {
      const news = this.newRepository.create({
        ...createNewDto,
        createdAt: new Date(),
        createdBy: admin,
      });

      await this.newRepository.save(news);
      return { news };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async update(admin: User, updateNewDto: UpdateNewDto, newId: string) {
    await this.getNewById(newId);

    const updateNew = await this.newRepository.preload({
      id: newId,
      ...updateNewDto,
      updatedAt: new Date(),
      updatedBy: admin,
    });

    try {
      await this.newRepository.save(updateNew);

      return { updateNew };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async delete(newId: string) {
    const newData = await this.getNewById(newId);
    await this.newRepository.delete(newId);
    return { newData };
  }

  async deleteByYear(selectedYear: number) {
    const startDate = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${selectedYear + 1}-01-01T00:00:00.000Z`);

    const newsList = await this.newRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    if (newsList.length === 0) {
      throw new BadRequestException(
        `News for the year ${selectedYear} not found`,
      );
    }

    await this.newRepository.remove(newsList);

    return {
      message: `${newsList.length} news from year ${selectedYear} have been removed succesfully.`,
    };
  }

  async getNewById(newId: string) {
    const newData = await this.newRepository.findOneBy({ id: newId });
    if (!newData) throw new NotFoundException(`New with id ${newId} not found`);
    return { newData };
  }

  async getAllNews(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const [news, total] = await this.newRepository.findAndCount({
        select: ['id', 'title', 'content', 'createdBy'],
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: news,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async getAllNewsByTerm(term: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const [news, total] = await this.newRepository
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
        data: news,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async getImageFromNew(newId: string) {
    const findNew = await this.newRepository.findOneBy({ id: newId });

    if (!findNew) throw new NotFoundException(`New with id ${newId} not found`);

    const { picture } = findNew;

    const base64String = `<${picture}>`;
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    return buffer;
  }
}
