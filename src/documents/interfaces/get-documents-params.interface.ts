import { PaginationDto } from '../../common/dto';

export interface GetDocumentsParams {
  term: string;
  fecha?: string;
  tipo?: string;
  paginationDto: PaginationDto;
}
