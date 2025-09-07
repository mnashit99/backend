import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'ali@example.com', description: 'Unique email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ali Khan', description: 'Full name of the user' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'securePass123', description: 'Password (min 6 chars)' })
  @MinLength(6)
  password: string;
}
