import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'Stock keeping unit (unique identifier)',
    example: 'SKU12345',
  })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Description of the product variant',
    example: 'Red, Large size variant of T-Shirt',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Price of the product variant',
    example: 1999,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Stock count of the product variant',
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @ApiPropertyOptional({
    description: 'Extra options in JSON format',
    example: { color: 'red', size: 'L' },
    type: Object,
  })
  @IsOptional()
  options: any;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
