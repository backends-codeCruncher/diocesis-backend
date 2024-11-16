import { PartialType } from '@nestjs/mapped-types';
import { PaginationDto } from './pagination.dto';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DatePaginationDto extends PartialType(PaginationDto) {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;
}
