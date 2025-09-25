import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../payments/payment-method.enum';

export class ConfirmOrderDto {
  @ApiProperty({ description: 'The ID of the successful Stripe Payment Intent. Required only for STRIPE payment method.', required: false })
  @IsString()
  @IsOptional()
  @ValidateIf(o => o.paymentMethod === PaymentMethod.STRIPE)
  paymentIntentId?: string;

  @ApiProperty({ description: 'The ID of the chosen shipping address.' })
  @IsUUID()
  shippingAddressId: string;

  @ApiProperty({ enum: PaymentMethod, description: 'The chosen payment method.' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'An array of cart item IDs to purchase. Required unless doing a \'Buy Now\' order.', required: false, type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  @ValidateIf(o => !o.buyNowVariantId)
  cartItemIds?: string[];

  @ApiProperty({ description: 'The variant ID for a \'Buy Now\' order.', required: false })
  @ValidateIf(o => !o.cartItemIds)
  @IsUUID()
  buyNowVariantId?: string;

  @ApiProperty({ description: 'The quantity for a \'Buy Now\' order.', required: false, minimum: 1 })
  @ValidateIf(o => !o.cartItemIds)
  @IsInt()
  @Min(1)
  buyNowQuantity?: number;
}