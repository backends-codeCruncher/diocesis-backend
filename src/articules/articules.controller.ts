import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ArticulesService } from './articules.service';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/enums';
import { User } from '../auth/entities/user.entity';
import { CreateArticuleDto, UpdateArticuleDto } from './dto';
import { PaginationDto } from '../common/dto';

@Controller('articules')
export class ArticulesController {
  constructor(private readonly articulesService: ArticulesService) {}

  @Post()
  @Auth(ValidRoles.super, ValidRoles.admin)
  createNew(
    @GetUser() admin: User,
    @Body() createArticuleDto: CreateArticuleDto,
  ) {
    return this.articulesService.create(admin, createArticuleDto);
  }

  @Patch(':articuleId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  updateNew(
    @GetUser() admin: User,
    @Body() updateArticuleDto: UpdateArticuleDto,
    @Param('articuleId', ParseUUIDPipe) articuleId: string,
  ) {
    return this.articulesService.update(admin, updateArticuleDto, articuleId);
  }

  @Delete(':articuleId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deleteNew(@Param('articuleId', ParseUUIDPipe) articuleId: string) {
    return this.articulesService.delete(articuleId);
  }

  @Delete('by-year/:year')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deleteArticulesByYear(@Param('year', ParseIntPipe) year: number) {
    return this.articulesService.deleteByYear(year);
  }

  @Get(':articuleId')
  getNewById(@Param('articuleId', ParseUUIDPipe) articuleId: string) {
    return this.articulesService.getArticuleById(articuleId);
  }

  @Get()
  getAllNews(@Query() paginationDto: PaginationDto) {
    return this.articulesService.getAllArticules(paginationDto);
  }

  @Get(':term')
  getAllNewsByTerm(
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.articulesService.getAllArticulesByTerm(term, paginationDto);
  }
}
