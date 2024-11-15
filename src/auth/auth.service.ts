import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { bcryptAdapter } from '../config';
import { LoginDto, RegisterDto } from './dto';
import { User } from './entities/user.entity';
import { JWTPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { password, ...userData } = registerDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcryptAdapter.hash(password),
      });

      await this.userRepository.save(user);

      delete user.password;

      return { user };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async login(loginDto: LoginDto) {
    const { password, email } = loginDto;

    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException('User credentials are not valid');
    }

    if (!user.isActive) {
      throw new BadRequestException('User not active');
    }

    if (!bcryptAdapter.compare(password, user.password)) {
      throw new UnauthorizedException('User credentials are not valid');
    }

    delete user.password;

    return {
      user,
      token: this.getJWT({ id: user.id }),
    };
  }

  async deleteUser(admin: User, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user || !user.isActive) {
      throw new BadRequestException('User not found or not active');
    }

    user.isActive = false;
    user.deletedBy = admin;
    user.deletedAt = new Date();

    try {
      await this.userRepository.save(user);

      delete user.password;
      delete user.deletedBy.password;

      return {
        user,
      };
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async checkAuthStatus(user: User) {
    delete user.password;

    const token = this.getJWT({ id: user.id });

    return {
      user,
      token,
    };
  }

  private handleDBException(error: any) {
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

  private getJWT(payload: JWTPayload) {
    return this.jwtService.sign(payload);
  }
}
