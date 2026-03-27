import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from './user.response';

export class TokenPairResponse {
  @ApiProperty({ description: 'JWT access token (HS256, expires per JWT_EXPIRES_IN)' })
  accessToken: string;

  @ApiProperty({ description: 'Opaque refresh token (30-day TTL, single-use)' })
  refreshToken: string;
}

export class AuthResponse extends TokenPairResponse {
  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}

export class OtpVerifyResponse {
  @ApiProperty({
    description:
      'Short-lived JWT carrying phone + purpose (register | reset). ' +
      'Pass as otpToken in POST /auth/register or POST /auth/reset-password.',
  })
  otpToken: string;
}

export class ErrorResponse {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Invalid or incorrect verification code' })
  message: string;

  @ApiProperty({
    example: 'OTP_INVALID',
    description:
      'Machine-readable error code. Use for client-side i18n. ' +
      'Possible values: PHONE_ALREADY_EXISTS | PHONE_NOT_FOUND | OTP_INVALID | ' +
      'OTP_EXPIRED | OTP_PURPOSE_MISMATCH | INVALID_CREDENTIALS | PASSWORD_MISMATCH | ' +
      'REFRESH_TOKEN_INVALID | RATE_LIMIT_EXCEEDED',
  })
  code: string;
}
