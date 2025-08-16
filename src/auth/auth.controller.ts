import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ResetPasswordDto, UpdatePasswordDto } from './dto/reset-password.dto';
import { SendSmsOtpDto, VerifySmsOtpDto, SendEmailOtpDto, VerifyEmailOtpDto } from './dto/otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  // @Body() 데코레이터는 HTTP 요청의 body에 담긴 데이터를 signUpDto 파라미터로 매핑해줍니다.
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  // 로그인 시 성공적으로 인증되면 200 OK 상태 코드를 반환합니다.
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  // JWT 인증이 필요한 엔드포인트임을 나타냅니다.
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req
  ) {
    return this.authService.updatePassword(updatePasswordDto.newPassword);
  }

  @Post('google')
  async signInWithGoogle() {
    return this.authService.signInWithGoogle();
  }

  @Post('facebook')
  async signInWithFacebook() {
    return this.authService.signInWithFacebook();
  }

  @Post('github')
  async signInWithGithub() {
    return this.authService.signInWithGithub();
  }

  @Get('callback')
  async handleSocialCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    return this.authService.handleSocialCallback(code, state);
  }

  @Post('sms/send')
  async sendSmsOtp(@Body() sendSmsOtpDto: SendSmsOtpDto) {
    return this.authService.sendSmsOtp(sendSmsOtpDto.phoneNumber);
  }

  @Post('sms/verify')
  async verifySmsOtp(@Body() verifySmsOtpDto: VerifySmsOtpDto) {
    return this.authService.verifySmsOtp(verifySmsOtpDto.phoneNumber, verifySmsOtpDto.token);
  }

  @Post('email-otp/send')
  async sendEmailOtp(@Body() sendEmailOtpDto: SendEmailOtpDto) {
    return this.authService.sendEmailOtp(sendEmailOtpDto.email);
  }

  @Post('email-otp/verify')
  async verifyEmailOtp(@Body() verifyEmailOtpDto: VerifyEmailOtpDto) {
    return this.authService.verifyEmailOtp(verifyEmailOtpDto.email, verifyEmailOtpDto.token);
  }
}
