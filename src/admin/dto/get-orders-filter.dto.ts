import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '../../orders/entities/order-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetOrdersFilterDto {
  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter orders by status.' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Filter orders by user ID.' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
