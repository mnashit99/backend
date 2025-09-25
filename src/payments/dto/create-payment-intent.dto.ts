import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'The amount to be charged.' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'The currency of the charge.', required: false, default: 'usd' })
  @IsString()
  @IsOptional()
  currency?: string;
}
