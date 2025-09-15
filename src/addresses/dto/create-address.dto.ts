import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddressType } from '../entities/address.entity';


export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty({ enum: AddressType, example: AddressType.SHIPPING })
  @IsEnum(AddressType)
  type: AddressType;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
