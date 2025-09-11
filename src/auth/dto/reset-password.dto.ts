import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The password reset token', example: 'your-unique-reset-token-here' })
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @ApiProperty({ description: 'The new password for the user', example: 'NewPass@123' })
  newPassword: string;
}