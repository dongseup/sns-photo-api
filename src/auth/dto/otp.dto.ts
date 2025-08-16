import { IsString, IsEmail, Matches } from 'class-validator';

export class SendSmsOtpDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: '올바른 전화번호 형식이 아닙니다. (예: +821012345678)',
  })
  phoneNumber: string;
}

export class VerifySmsOtpDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: '올바른 전화번호 형식이 아닙니다. (예: +821012345678)',
  })
  phoneNumber: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: '인증번호는 6자리 숫자여야 합니다.',
  })
  token: string;
}

export class SendEmailOtpDto {
  @IsEmail()
  email: string;
}

export class VerifyEmailOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, {
    message: '인증번호는 6자리 숫자여야 합니다.',
  })
  token: string;
}
