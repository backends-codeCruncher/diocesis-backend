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
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/enums';
import { PaginationDto } from '../common/dto';
import { documentFilter } from '../config/helpers';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: documentFilter,
    }),
  )
  createDocument(
    @GetUser() admin: User,
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    return this.documentsService.createDocument(admin, createDocumentDto, file);
  }

  @Get('document/:docId')
  getDocumentById(@Param('docId', ParseUUIDPipe) docId: string) {
    return this.documentsService.getDocumentById(docId);
  }

  @Get(':term')
  getDocumentsByTerm(
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
    @Query('fecha') fecha?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.documentsService.getDocumentsByTerm({
      term,
      fecha,
      tipo,
      paginationDto,
    });
  }

  @Patch(':docId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: documentFilter,
    }),
  )
  updateDocument(
    @GetUser() admin: User,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Param('docId', ParseUUIDPipe) docId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) updateDocumentDto.document = file.buffer.toString('base64');
    return this.documentsService.updateDocument(
      admin,
      updateDocumentDto,
      docId,
    );
  }

  @Delete(':docId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deleteDocument(
    @GetUser() admin: User,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return this.documentsService.deleteDocument(admin, docId);
  }
}
