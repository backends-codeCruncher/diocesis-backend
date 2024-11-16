import { PartialType } from '@nestjs/mapped-types';
import { CreateArticuleDto } from './create-articule.dto';

export class UpdateArticuleDto extends PartialType(CreateArticuleDto) {}
