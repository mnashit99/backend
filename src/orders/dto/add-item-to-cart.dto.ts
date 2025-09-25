import { IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemToCartDto {
  @ApiProperty({ description: 'The UUID of the product variant to add.' })
  @IsUUID()
  productVariantId: string;

  @ApiProperty({ description: 'The quantity of the item to add.', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
