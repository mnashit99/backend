import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 15 Pro Max',
    description: 'The name of the product',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Apple',
    description: 'Brand or manufacturer of the product',
  })
  @IsNotEmpty()
  @IsString()
  brand: string;

  @ApiProperty({
    example: 'https://example.com/images/iphone-15-pro-max.jpg',
    description: 'Thumbnail image URL for the product',
  })
  @IsNotEmpty()
  @IsString()
  thumbnail: string;

  @ApiPropertyOptional({
    example: ['smartphone', 'apple', 'ios'],
    description: 'List of tags associated with the product',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is active or not (default: true)',
  })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    example: 'a5f2c111-3b42-4f92-b182-1ac7c96a64fa',
    description: 'The ID of the category this product belongs to',
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
