import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class BaseService {
  protected readonly logger = new Logger(BaseService.name);

  handleDBException(error: any): never {
    this.logger.error(error);

    if (error instanceof QueryFailedError) {
      const msg = error.message;
      const errorCode = error.driverError.code;

      switch (errorCode) {
        case '23505':
          throw new BadRequestException(msg);
        default:
          throw new InternalServerErrorException(
            `Code: ${errorCode}, Message: ${msg}`,
          );
      }
    }

    throw new InternalServerErrorException('Error on AuthService');
  }

  createPaginationMetadata(dataCount: number, page: number, limit: number) {
    return {
      totalData: dataCount,
      totalPages: Math.ceil(dataCount / limit),
      currentPage: page,
      limit,
    };
  }
}
