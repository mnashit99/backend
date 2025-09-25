import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsUUID, Min, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCheckoutSummaryDto {
  @ApiProperty({ description: 'An array of cart item IDs to get a summary for. Use this for partial cart checkout.', required: false, type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  @ValidateIf(o => !o.buyNowVariantId)
  cartItemIds?: string[];

  @ApiProperty({ description: 'The variant ID for a \'Buy Now\' checkout.', required: false })
  @ValidateIf(o => !o.cartItemIds)
  @IsUUID()
  buyNowVariantId?: string;

  @ApiProperty({ description: 'The quantity for a \'Buy Now\' checkout.', required: false, minimum: 1 })
  @ValidateIf(o => !o.cartItemIds)
  @IsInt()
  @Min(1)
  buyNowQuantity?: number;

  @ApiProperty({ description: 'The ID of the shipping address to use for calculating shipping costs.', required: false })
  @IsOptional()
  @IsUUID()
  shippingAddressId?: string;
}