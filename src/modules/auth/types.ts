export interface JwtPayload {
  sub: number;
  username: string;
}

export interface AuthTokenDto {
  accessToken: string;
}

export interface RegisterSuccessDto {
  success: true;
  message: string;
}

export interface UserRecord {
  id: number;
  username: string;
  passwordHash: string;
}
