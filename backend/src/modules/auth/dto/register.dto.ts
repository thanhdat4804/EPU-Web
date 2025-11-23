// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator'
import { Match } from '../../../common/decorators/match.decorator' // ← Tạo custom decorator

export class RegisterDto {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  name: string

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string

  @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu' })
  @Validate(Match, ['password'], { message: 'Mật khẩu xác nhận không khớp' })
  confirmPassword: string
}