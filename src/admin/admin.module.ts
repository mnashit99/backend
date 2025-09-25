import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule], // Import OrdersModule to use OrdersService
  controllers: [AdminController],
})
export class AdminModule {}
