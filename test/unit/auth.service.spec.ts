import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../src/modules/auth/auth.service';
import type { UserRepository } from '../../src/modules/auth/user.repository';

const mockUserRepository = {
  findByUsername: jest.fn(),
  create: jest.fn(),
} as unknown as UserRepository;

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed.jwt.token'),
} as unknown as JwtService;

const service = new AuthService(mockUserRepository, mockJwtService);

beforeEach(() => jest.clearAllMocks());

describe('AuthService.register', () => {
  it('creates user when username is free', async () => {
    (mockUserRepository.findByUsername as jest.Mock).mockResolvedValue(null);
    (mockUserRepository.create as jest.Mock).mockResolvedValue({ id: 1 });

    await expect(
      service.register('newuser', 'password123'),
    ).resolves.toBeUndefined();

    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    const [username, hash] = (mockUserRepository.create as jest.Mock).mock
      .calls[0] as [string, string];
    expect(username).toBe('newuser');
    expect(await bcrypt.compare('password123', hash)).toBe(true);
  });

  it('throws ConflictException when username already taken', async () => {
    (mockUserRepository.findByUsername as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'taken',
      passwordHash: 'hash',
    });

    await expect(service.register('taken', 'password123')).rejects.toThrow(
      ConflictException,
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});

describe('AuthService.login', () => {
  const hash = bcrypt.hashSync('correct', 10);

  it('returns accessToken on valid credentials', async () => {
    (mockUserRepository.findByUsername as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'user',
      passwordHash: hash,
    });

    const result = await service.login('user', 'correct');

    expect(result).toEqual({ accessToken: 'signed.jwt.token' });
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 1,
      username: 'user',
    });
  });

  it('throws UnauthorizedException when user not found', async () => {
    (mockUserRepository.findByUsername as jest.Mock).mockResolvedValue(null);

    await expect(service.login('nobody', 'pass')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException on wrong password', async () => {
    (mockUserRepository.findByUsername as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'user',
      passwordHash: hash,
    });

    await expect(service.login('user', 'wrongpass')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
