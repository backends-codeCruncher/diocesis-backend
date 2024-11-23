import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/enums';
import { fileFilter } from '../config/helpers';
import { PriestsService } from './priests.service';
import { GetUser } from 'src/auth/decorators';
import { User } from '../auth/entities/user.entity';
import { CreatePriestDto, UpdatePriestDto } from './dto';
import { PaginationDto } from '../common/dto';

@Controller('priests')
export class PriestsController {
  constructor(private readonly priestsService: PriestsService) {}

  // Crear sacerdote
  @Post()
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: fileFilter,
    }),
  )
  createPriest(
    @GetUser() admin: User,
    @Body() createPriestDto: CreatePriestDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    return this.priestsService.createPriest(admin, createPriestDto, file);
  }

  // Obtener sacerdotes
  @Get()
  getPriestList(@Query() paginationDto: PaginationDto) {
    return this.priestsService.getPriestList(paginationDto);
  }

  // Obtener sacerdote por id
  @Get('priest/:priestId')
  getPriestById(@Param('priestId', ParseUUIDPipe) priestId: string) {
    return this.priestsService.getPriestById(priestId);
  }

  // Obtener sacerdotes por nombre
  @Get(':term')
  getPriestByTerm(
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.getPriestByTerm(term, paginationDto);
  }

  // Actualizar sacerdote
  @Patch(':priestId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: fileFilter,
    }),
  )
  updatePriest(
    @GetUser() admin: User,
    @Body() updatePriestDto: UpdatePriestDto,
    @Param('priestId', ParseUUIDPipe) priestId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) updatePriestDto.picture = file.buffer.toString('base64');
    return this.priestsService.updatePriest(admin, updatePriestDto, priestId);
  }

  // Borrar sacerdote
  @Delete(':priestId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deletePriest(
    @GetUser() admin: User,
    @Param('priestId', ParseUUIDPipe) priestId: string,
  ) {
    return this.priestsService.deletePriest(admin, priestId);
  }
}
