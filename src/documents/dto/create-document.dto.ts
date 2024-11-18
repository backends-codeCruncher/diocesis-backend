import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DocumentEnum } from '../enums/document-types.enum';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  document: string;

  @IsEnum(DocumentEnum)
  @IsNotEmpty()
  type: DocumentEnum;

  @IsArray()
  tags: string[];

  file: Express.Multer.File;
}
