import { Controller, Patch, Param, Body, UseGuards, Get, Query, Delete } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetOrdersFilterDto } from './dto/get-orders-filter.dto';
import { UsersService } from '../users/users.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    ) {}

  @Get('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllOrders(@Query() filterDto: GetOrdersFilterDto) {
    return this.ordersService.findAllOrders(filterDto);
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto.status);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllUsers() {
    return this.usersService.findAll();
  }

  @Patch('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateUser(
    @Param('id') id: string,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    return this.usersService.updateByAdmin(id, adminUpdateUserDto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
