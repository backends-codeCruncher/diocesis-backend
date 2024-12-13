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
import { fileFilter, videoFilter } from '../config/helpers';
import { CarouselService } from './carousel.service';
import { CreateCarouselItemDto } from './dto/create-carousel-item.dto';

@Controller('carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}

  @Post('image')
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: fileFilter,
    }),
  )
  createItemImage(
    @GetUser() admin: User,
    @Body() createCarouselItemDto: CreateCarouselItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.carouselService.createImageItem(
      admin,
      createCarouselItemDto,
      file,
    );
  }

  @Post('video')
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('video', {
      fileFilter: videoFilter,
    }),
  )
  createItemVideo(
    @GetUser() admin: User,
    @Body() createCarouselItemDto: CreateCarouselItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.carouselService.createVideoItem(
      admin,
      createCarouselItemDto,
      file,
    );
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
