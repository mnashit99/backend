import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @IsEmail()
  @ApiProperty({ description: 'The email of the user requesting a password reset', example: 'user@example.com' })
  email: string;
}