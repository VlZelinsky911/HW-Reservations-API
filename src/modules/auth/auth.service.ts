import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import type { AuthTokenDto, JwtPayload } from './types';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string): Promise<void> {
    const existing = await this.userRepository.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.userRepository.create(username, passwordHash);
  }

  async login(username: string, password: string): Promise<AuthTokenDto> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
