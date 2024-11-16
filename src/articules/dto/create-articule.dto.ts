import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateArticuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  tags: string[];
}
