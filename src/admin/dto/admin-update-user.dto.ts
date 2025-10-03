import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ description: "Set the user's role (e.g., 'admin', 'customer')." })
  @IsOptional()
  @IsString()
  role?: string;
}
