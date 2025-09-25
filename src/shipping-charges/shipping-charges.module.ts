import { Module } from '@nestjs/common';
import { ShippingChargesService } from './shipping-charges.service';
import { ShippingChargesController } from './shipping-charges.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ShippingChargesController],
  providers: [ShippingChargesService],
  exports: [ShippingChargesService],
})
export class ShippingChargesModule {}
