import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCarouselItemDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  url: string;

  @IsBoolean()
  @Type(() => Boolean)
  isImage: boolean;

  image: Express.Multer.File;
}
