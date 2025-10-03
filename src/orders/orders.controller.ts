import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { GetCheckoutSummaryDto } from './dto/get-checkout-summary.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/checkout/confirm')
  @UseGuards(JwtAuthGuard)
  confirmOrder(
    @Body() confirmOrderDto: ConfirmOrderDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.confirmOrder(user, confirmOrderDto);
  }

  @Post('/checkout/summary')
  @UseGuards(JwtAuthGuard)
  getCheckoutSummary(
    @GetUser() user: User,
    @Body() getCheckoutSummaryDto: GetCheckoutSummaryDto,
  ) {
    return this.ordersService.getCheckoutSummary(user, getCheckoutSummaryDto);
  }

  @Get('/cart')
  @UseGuards(JwtAuthGuard)
  getCart(@GetUser() user: User) {
    return this.ordersService.getCart(user);
  }

  @Post('/cart/items')
  @UseGuards(JwtAuthGuard)
  addItemToCart(
    @Body() addItemToCartDto: AddItemToCartDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.addItemToCart(user, addItemToCartDto);
  }

  @Patch('/cart/items/:itemId')
  @UseGuards(JwtAuthGuard)
  updateCartItem(
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.updateCartItemQuantity(user, itemId, updateCartItemDto);
  }

  @Delete('/cart/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  removeItemFromCart(
    @Param('itemId') itemId: string,
    @GetUser() user: User,
  ) {
    return this.ordersService.removeItemFromCart(user, itemId);
  }

  // This is now the order history endpoint
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser() user: User) {
    return this.ordersService.findUserOrders(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.ordersService.findUserOrderById(user, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
