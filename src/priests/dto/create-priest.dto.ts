import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxDate,
} from 'class-validator';

export class CreatePriestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @MaxDate(new Date())
  birthDate: Date;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  picture: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  image: Express.Multer.File;
}
