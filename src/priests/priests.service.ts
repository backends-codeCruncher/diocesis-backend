import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { PaginationDto } from '../common/dto';
import { BaseService } from '../common/services/base.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CreatePriestDto, UpdatePriestDto } from './dto';
import { Priest } from './entities/priest.entity';

@Injectable()
export class PriestsService {
  constructor(
    @InjectRepository(Priest)
    private readonly priestRepository: Repository<Priest>,
    private readonly baseService: BaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Crear sacerdote
  async createPriest(
    admin: User,
    createPriestDto: CreatePriestDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    const picture = await this.cloudinaryService.uploadImage('Padres', file);

    createPriestDto.picture = picture.secure_url;

    try {
      const priest = this.priestRepository.create({
        ...createPriestDto,
        createdAt: new Date(),
        createdBy: admin,
      });

      await this.priestRepository.save(priest);
      return { priest };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  // Obtener sacerdote por id
  async getPriestById(priestId: string) {
    const priest = await this.priestRepository.findOneBy({ id: priestId });
    if (!priest)
      throw new NotFoundException(`New with id ${priestId} not found`);

    return priest;
  }

  // Obtener sacerdotes
  async getPriestList(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const [priests, total] = await this.priestRepository.findAndCount({
        where: { isActive: true },
        select: ['id', 'firstName', 'lastName', 'picture'],
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: priests,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {}
  }

  // Obtener sacerdotes por nombre
  async getPriestByTerm(term: string, paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    try {
      const [priests, total] = await this.priestRepository.findAndCount({
        where: { firstName: ILike(term), lastName: ILike(term) },
        select: ['id', 'firstName', 'lastName', 'picture'],
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: priests,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  // Actualizar sacerdote
  async updatePriest(
    admin: User,
    updatePriestDto: UpdatePriestDto,
    priestId: string,
  ) {
    await this.getPriestById(priestId);

    const updatePriest = await this.priestRepository.preload({
      id: priestId,
      ...updatePriestDto,
    });

    try {
      updatePriest.markAsUpdated(admin);
      await this.priestRepository.save(updatePriest);
      return { updatePriest };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  // Borrar sacerdote
  async deletePriest(admin: User, priestId: string) {
    const priest = await this.getPriestById(priestId);

    if (!priest || !priest.isActive) {
      throw new BadRequestException('Priest not found');
    }

    try {
      priest.markAsDeleted(admin);
      await this.priestRepository.save(priest);

      return { priest };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }
}
