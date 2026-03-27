import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import {
  AuthResponse,
  ErrorResponse,
  OtpVerifyResponse,
  TokenPairResponse,
} from './dto/auth.response';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserResponse } from './dto/user.response';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/register')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 6, ttl: 300_000 } })
  @ApiOperation({
    summary: 'Request OTP — register flow',
    description:
      'Sends a 6-digit OTP to the phone. Phone must NOT already exist. Rate-limited to 6 requests per 5 minutes.',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully.' })
  @ApiResponse({
    status: 409,
    description: 'PHONE_ALREADY_EXISTS — phone is already registered.',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 429,
    description: 'RATE_LIMIT_EXCEEDED — too many OTP requests.',
    type: ErrorResponse,
  })
  async requestRegisterOtp(@Body() dto: RequestOtpDto): Promise<void> {
    await this.authService.requestRegisterOtp(dto.phone);
  }

  @Post('otp/forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 6, ttl: 300_000 } })
  @ApiOperation({
    summary: 'Request OTP — forgot-password flow',
    description:
      'Sends a 6-digit OTP to the phone. Phone MUST exist. Rate-limited to 6 requests per 5 minutes.',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully.' })
  @ApiResponse({
    status: 404,
    description: 'PHONE_NOT_FOUND — phone is not registered.',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 429,
    description: 'RATE_LIMIT_EXCEEDED — too many OTP requests.',
    type: ErrorResponse,
  })
  async requestForgotPasswordOtp(@Body() dto: RequestOtpDto): Promise<void> {
    await this.authService.requestForgotPasswordOtp(dto.phone);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP — returns otpToken',
    description:
      'Verifies the 6-digit OTP. Returns a short-lived otpToken (5 min) ' +
      'encoding the phone and purpose (register | reset). ' +
      'Pass otpToken to POST /auth/register or POST /auth/reset-password.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified. Returns otpToken.',
    type: OtpVerifyResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'OTP_INVALID or OTP_EXPIRED.',
    type: ErrorResponse,
  })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description:
      'Completes registration using the otpToken from POST /auth/otp/verify. ' +
      'Returns access + refresh tokens and the created user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered. Returns tokens and user.',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'PASSWORD_MISMATCH — password and confirmPassword differ.',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'OTP_PURPOSE_MISMATCH — otpToken was issued for a different flow.',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 409,
    description:
      'PHONE_ALREADY_EXISTS — phone was registered between OTP request and registration.',
    type: ErrorResponse,
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.otpToken, dto.name, dto.password, dto.confirmPassword);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticates with phone and password. Rate-limited to 10 requests per minute.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns tokens and user.',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'INVALID_CREDENTIALS — phone not found or wrong password.',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 429,
    description: 'RATE_LIMIT_EXCEEDED — too many login attempts.',
    type: ErrorResponse,
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.password);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Sets a new password using the otpToken from the forgot-password OTP flow. ' +
      'Returns access + refresh tokens on success.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset. Returns tokens and user.',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'PASSWORD_MISMATCH — newPassword and confirmPassword differ.',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'OTP_PURPOSE_MISMATCH or PHONE_NOT_FOUND.',
    type: ErrorResponse,
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.otpToken, dto.newPassword, dto.confirmPassword);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Rotates the refresh token: the submitted token is deleted and a new pair is issued. ' +
      'Each refresh token is single-use.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens rotated. Returns new access + refresh tokens.',
    type: TokenPairResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'REFRESH_TOKEN_INVALID — token not found, expired, or already used.',
    type: ErrorResponse,
  })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description: 'Invalidates the provided refresh token. Requires a valid access token.',
  })
  @ApiResponse({
    status: 204,
    description: 'Logged out. Refresh token invalidated.',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token.',
    type: ErrorResponse,
  })
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: "Returns the authenticated user's profile. Requires a valid access token.",
  })
  @ApiResponse({
    status: 200,
    description: 'Current authenticated user.',
    type: UserResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid access token.',
    type: ErrorResponse,
  })
  me(@CurrentUser() user: unknown) {
    return user;
  }
}
