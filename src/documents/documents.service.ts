import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { BaseService } from '../common/services/base.service';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import { Document } from './entities/document.entity';
import { GetDocumentsParams } from './interfaces/get-documents-params.interface';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly baseService: BaseService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createDocument(
    admin: User,
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Document file is required');

    const document = await this.cloudinaryService.uploadFile(
      'Documentos',
      file,
    );

    createDocumentDto.document = document.secure_url;

    try {
      const document = this.documentRepository.create({
        ...createDocumentDto,
        createdAt: new Date(),
        createdBy: admin,
      });

      await this.documentRepository.save(document);
      return { document };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async getDocumentById(docId: string) {
    const document = await this.documentRepository.findOneBy({ id: docId });

    if (!document) {
      throw new NotFoundException(`Document with id ${docId} not found`);
    }

    return document;
  }

  async getDocumentsByTerm(options: GetDocumentsParams) {
    const { term, paginationDto, fecha, tipo } = options;
    const { page = 1, limit = 10 } = paginationDto;

    try {
      const queryBuilder = this.documentRepository
        .createQueryBuilder('documents')
        .where('documents.title ILIKE :term', { term: `%${term}%` })
        .orWhere(':term = ANY(documents.tags)', { term });

      if (fecha) {
        const [year, month] = fecha.split('-');
        if (year && month) {
          queryBuilder
            .andWhere('EXTRACT(YEAR FROM documents.date) = :year', { year })
            .andWhere('EXTRACT(MONTH FROM documents.date) = :month', { month });
        }
      }

      if (tipo) queryBuilder.andWhere('documents.type = :tipo', { tipo });

      const [documents, total] = await queryBuilder
        .select([
          'documents.id',
          'documents.title',
          'documents.document',
          'documents.createdAt',
          'documents.createdBy',
          'documents.type',
        ])
        .take(limit)
        .skip((page - 1) * limit)
        .getManyAndCount();

      return {
        data: documents,
        meta: this.baseService.createPaginationMetadata(total, page, limit),
      };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async updateDocument(
    admin: User,
    updateDocumentDto: UpdateDocumentDto,
    docId: string,
  ) {
    await this.getDocumentById(docId);

    const updateDocument = await this.documentRepository.preload({
      id: docId,
      ...updateDocumentDto,
    });

    try {
      updateDocument.markAsUpdated(admin);
      await this.documentRepository.save(updateDocument);

      return { updateDocument };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }

  async deleteDocument(admin: User, docId: string) {
    const document = await this.getDocumentById(docId);

    if (!document || !document.isActive) {
      throw new BadRequestException('Document not found');
    }

    try {
      document.markAsDeleted(admin);
      await this.documentRepository.save(document);

      return { document };
    } catch (error) {
      this.baseService.handleDBException(error);
    }
  }
}
