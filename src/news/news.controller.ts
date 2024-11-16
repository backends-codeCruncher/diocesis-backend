import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PaginationDto } from '../common/dto';
import { fileFilter } from '../config/helpers';
import { CreateNewDto, UpdateNewDto } from './dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: fileFilter,
    }),
  )
  createNew(
    @GetUser() admin: User,
    @Body() createNewDto: CreateNewDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    return this.newsService.create(admin, createNewDto, file);
  }

  @Patch(':newId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: fileFilter,
    }),
  )
  updateNew(
    @GetUser() admin: User,
    @Body() updateNewDto: UpdateNewDto,
    @Param('newId', ParseUUIDPipe) newId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) updateNewDto.picture = file.buffer.toString('base64');
    return this.newsService.update(admin, updateNewDto, newId);
  }

  @Delete(':newId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deleteNew(@Param('newId', ParseUUIDPipe) newId: string) {
    return this.newsService.delete(newId);
  }

  @Delete('by-year/:year')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deleteNewsByYear(@Param('year', ParseIntPipe) year: number) {
    return this.newsService.deleteByYear(year);
  }

  @Get(':new/:newId')
  getNewById(@Param('newId', ParseUUIDPipe) newId: string) {
    return this.newsService.getNewById(newId);
  }

  @Get()
  getAllNews(@Query() paginationDto: PaginationDto) {
    return this.newsService.getAllNews(paginationDto);
  }

  @Get(':term')
  getAllNewsByTerm(
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.newsService.getAllNewsByTerm(term, paginationDto);
  }

  @Get('image/:newId')
  async getImageFromNew(
    @Param('newId', ParseUUIDPipe) newId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.newsService.getImageFromNew(newId);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  }
}
