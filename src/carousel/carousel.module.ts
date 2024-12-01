import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { CarouselController } from './carousel.controller';
import { CarouselService } from './carousel.service';
import { CarouselItem } from './entities/carousel-item';

@Module({
  controllers: [CarouselController],
  providers: [CarouselService],
  imports: [AuthModule, CommonModule, TypeOrmModule.forFeature([CarouselItem])],
})
export class CarouselModule {}
