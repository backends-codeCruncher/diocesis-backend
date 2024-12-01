import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { fileFilter } from '../config/helpers';
import { CarouselService } from './carousel.service';
import { CreateCarouselItemDto } from './dto/create-carousel-item.dto';

@Controller('carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}

  @Post()
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: fileFilter,
    }),
  )
  createItem(
    @GetUser() admin: User,
    @Body() createCarouselItemDto: CreateCarouselItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.carouselService.createItem(admin, createCarouselItemDto, file);
  }

  @Get()
  getCarouselItems() {
    return this.carouselService.getCarouselItems();
  }

  @Delete(':itemId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deleteItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.carouselService.deleteItem(itemId);
  }
}
