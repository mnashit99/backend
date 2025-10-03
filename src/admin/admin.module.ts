import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [OrdersModule, UsersModule], // Import OrdersModule and UsersModule to use their services
  controllers: [AdminController],
})
export class AdminModule {}
