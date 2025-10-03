import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchProductDto {
  @ApiPropertyOptional({
    example: 'iPhone',
    description: 'A search term to filter products by name, brand, category, tags, etc.',
  })
  @IsOptional()
  @IsString()
  query?: string;
}
