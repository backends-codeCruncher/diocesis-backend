import { Module } from '@nestjs/common';
import { ArticulesService } from './articules.service';
import { ArticulesController } from './articules.controller';
import { Articule } from './entities/articule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [ArticulesController],
  providers: [ArticulesService],
  imports: [AuthModule, CommonModule, TypeOrmModule.forFeature([Articule])],
})
export class ArticulesModule {}
