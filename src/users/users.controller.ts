import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { Auth } from '../auth/decorators/auth.decorator';
import { UpdateUserDto } from '../auth/dto';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/enums';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth(ValidRoles.user)
  getAllUsers(@Query() paginationDto: PaginationDto) {
    return this.usersService.getAllUsers(paginationDto);
  }

  @Get(':term')
  @Auth(ValidRoles.user)
  getAllUsersByTerm(
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.getAllUsersByTerm(term, paginationDto);
  }

  @Patch(':userId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  updateUser(
    @GetUser() admin: User,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(admin, userId, updateUserDto);
  }

  @Delete(':userId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deleteUser(
    @GetUser() admin: User,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.usersService.deleteUser(admin, userId);
  }
}
