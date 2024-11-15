import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { LoginDto, RegisterDto } from './dto';
import { User } from './entities/user.entity';
import { ValidRoles } from './enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  //@Auth(ValidRoles.super, ValidRoles.admin)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Delete(':userId')
  @Auth(ValidRoles.super, ValidRoles.admin)
  deleteUser(
    @GetUser() admin: User,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.authService.deleteUser(admin, userId);
  }
}
