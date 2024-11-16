import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNewDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  picture: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  tags: string[];

  image: Express.Multer.File;
}
