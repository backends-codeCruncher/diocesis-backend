import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../common/services/base.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CarouselItem } from './entities/carousel-item';
import { User } from '../auth/entities/user.entity';
import { CreateCarouselItemDto } from './dto/create-carousel-item.dto';

@Injectable()
export class CarouselService {
  constructor(
    @InjectRepository(CarouselItem)
    private readonly carouselItemRepository: Repository<CarouselItem>,
    private readonly baseService: BaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createImageItem(
    admin: User,
    createCarouselItemDto: CreateCarouselItemDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');

    const result = await this.cloudinaryService.uploadImage('carousel', file);
    createCarouselItemDto.url = result.secure_url;
    createCarouselItemDto.isImage = true;

    return this.createItem(admin, createCarouselItemDto);
  }

  async createVideoItem(
    admin: User,
    createCarouselItemDto: CreateCarouselItemDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Video file is required');

    const result = await this.cloudinaryService.uploadFile('carousel', file);
    createCarouselItemDto.url = result.secure_url;
    createCarouselItemDto.isImage = false;

    return this.createItem(admin, createCarouselItemDto);
  }

  async getCarouselItems() {
    const items = await this.carouselItemRepository.find();

    items.forEach((item) => {
      const { url } = item;

      if (url.startsWith('https')) return (item.url = url);

      const base64String = `<${url}>`;
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

      return (item.url = base64Data);
    });

    return { items };
  }

  async deleteItem(itemId: string) {
    const item = await this.carouselItemRepository.findOneBy({ id: itemId });

    if (!item) throw new NotFoundException(`Item with id ${itemId} not found`);

    await this.carouselItemRepository.delete(itemId);
    return { item };
  }

  private async createItem(
    admin: User,
    createCarouselItemDto: CreateCarouselItemDto,
  ) {
    try {
      const item = this.carouselItemRepository.create({
        ...createCarouselItemDto,
        createdAt: new Date(),
        createdBy: admin,
      });

      await this.carouselItemRepository.save(item);
      return { item };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }
}
