import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { Priest } from './entities/priest.entity';
import { PriestsController } from './priests.controller';
import { PriestsService } from './priests.service';

@Module({
  controllers: [PriestsController],
  providers: [PriestsService],
  imports: [AuthModule, CommonModule, TypeOrmModule.forFeature([Priest])],
})
export class PriestsModule {}
