import { IsOptional, IsString, IsEmail, IsIn, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ali Khan' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '1995-08-15', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  birthday?: string; // accept ISO date string; convert to Date in service

  @ApiPropertyOptional({ example: 'male', enum: ['male','female','other'] })
  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';
}
