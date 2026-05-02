import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  registerSchema,
  loginSchema,
  type RegisterDto,
  type LoginDto,
} from './dto/auth.dto';
import type { AuthTokenDto, RegisterSuccessDto } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
  ): Promise<RegisterSuccessDto> {
    await this.authService.register(dto.username, dto.password);
    return { success: true, message: 'User registered successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
  ): Promise<AuthTokenDto> {
    return this.authService.login(dto.username, dto.password);
  }
}
