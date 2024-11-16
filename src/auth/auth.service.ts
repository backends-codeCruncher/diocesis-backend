import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
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
    private readonly baseService: BaseService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { password, ...userData } = registerDto;

      const user = this.userRepository.create({
        ...userData,
        createdAt: new Date(),
        password: bcryptAdapter.hash(password),
      });

      await this.userRepository.save(user);

      delete user.password;

      return { user };
    } catch (error) {
      this.baseService.handleDBException(error);
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

  async checkAuthStatus(user: User) {
    delete user.password;

    const token = this.getJWT({ id: user.id });

    return {
      user,
      token,
    };
  }

  private getJWT(payload: JWTPayload) {
    return this.jwtService.sign(payload);
  }
}
