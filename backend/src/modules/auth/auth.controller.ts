import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/register')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 6, ttl: 300_000 } })
  @ApiOperation({
    summary: 'Request OTP — register flow (phone must not exist)',
  })
  async requestRegisterOtp(@Body() dto: RequestOtpDto): Promise<void> {
    await this.authService.requestRegisterOtp(dto.phone);
  }

  @Post('otp/forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 6, ttl: 300_000 } })
  @ApiOperation({
    summary: 'Request OTP — forgot-password flow (phone must exist)',
  })
  async requestForgotPasswordOtp(@Body() dto: RequestOtpDto): Promise<void> {
    await this.authService.requestForgotPasswordOtp(dto.phone);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP — returns otpToken (purpose=register|reset)',
  })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user with otpToken + password' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.otpToken,
      dto.name,
      dto.password,
      dto.confirmPassword,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login with phone and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.password);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password using otpToken from forgot-password flow',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.otpToken,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@CurrentUser() user: unknown) {
    return user;
  }
}
