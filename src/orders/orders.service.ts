import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { AddItemToCartDto } from './dto/add-item-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ShippingChargesService } from '../shipping-charges/shipping-charges.service';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { PaymentsService } from '../payments/payments.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { GetCheckoutSummaryDto } from './dto/get-checkout-summary.dto';
import { Address } from '../addresses/entities/address.entity';
import { OrderStatus } from './entities/order-status.enum';
import { PaymentMethod } from '../payments/payment-method.enum';
import { GetOrdersFilterDto } from '../admin/dto/get-orders-filter.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly shippingChargesService: ShippingChargesService,
    private readonly paymentsService: PaymentsService,
    private readonly dataSource: DataSource,
  ) {}

  // --- Cart Management ---

  private async findOrCreateCart(user: User): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.variant'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user, items: [] });
    }
    return cart;
  }

  async getCart(user: User) {
    return this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: {
        items: {
          variant: {
            product: true,
          },
        },
      },
    });
  }

async addItemToCart(user: User, addItemToCartDto: AddItemToCartDto) {
  const { productVariantId, quantity } = addItemToCartDto;
  const cart = await this.findOrCreateCart(user);

  const variant = await this.variantRepository.findOne({ where: { id: productVariantId } });
  if (!variant) {
    throw new NotFoundException(`Product Variant with ID #${productVariantId} not found.`);
  }
  if (variant.stock < quantity) {
    throw new BadRequestException(`Insufficient stock for variant #${variant.sku}.`);
  }

  // Check if item already exists in cart using query
  const existingCartItem = await this.cartItemRepository.findOne({
    where: {
      cart: { id: cart.id },
      variant: { id: productVariantId }
    }
  });

  if (existingCartItem) {
    // Update existing item using query builder
    await this.cartItemRepository
      .createQueryBuilder()
      .update()
      .set({ quantity: () => `quantity + ${quantity}` }) // Use SQL expression to increment
      .where('id = :id', { id: existingCartItem.id })
      .execute();
  } else {
    // Create new cart item
    const cartItem = this.cartItemRepository.create({ 
      cart, 
      variant, 
      quantity 
    });
    await this.cartItemRepository.save(cartItem);
  }

  return this.getCart(user);
}

  async updateCartItemQuantity(user: User, itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;
    const cart = await this.findOrCreateCart(user);

    const cartItem = cart.items.find(item => item.id === itemId);
    if (!cartItem) {
      throw new NotFoundException(`Item with ID #${itemId} not found in your cart.`);
    }

    if (cartItem.variant.stock < quantity) {
      throw new BadRequestException(`Insufficient stock for variant #${cartItem.variant.sku}.`);
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem);
    return cart;
  }

  async removeItemFromCart(user: User, itemId: string) {
    const cart = await this.findOrCreateCart(user);
    const cartItem = cart.items.find(item => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException(`Item with ID #${itemId} not found in your cart.`);
    }

    await this.cartItemRepository.remove(cartItem);
    return this.getCart(user);
  }

  // --- Order Management ---

  async getCheckoutSummary(user: User, dto: GetCheckoutSummaryDto) {
    let itemsToSummarize: any[] = [];
    let subtotal = 0;

    if (dto.buyNowVariantId && dto.buyNowQuantity) {
      const variant = await this.variantRepository.findOne({ where: { id: dto.buyNowVariantId } });
      if (!variant) throw new NotFoundException('Product variant not found.');
      if (variant.stock < dto.buyNowQuantity) throw new BadRequestException('Insufficient stock.');

      itemsToSummarize = [{ variant, quantity: dto.buyNowQuantity }];
      subtotal = variant.price * dto.buyNowQuantity;
    }
    else {
      const cart = await this.getCart(user);
      if (!cart || cart.items.length === 0) {
        throw new NotFoundException('No active cart found.');
      }
      const allItems = cart.items;
      let itemsToSummarize = allItems;

      if (dto.cartItemIds) {
        itemsToSummarize = allItems.filter(item => dto.cartItemIds?.includes(item.id));
        if (itemsToSummarize.length !== dto.cartItemIds.length) {
          throw new BadRequestException('Some items were not found in your cart.');
        }
      }

      subtotal = itemsToSummarize.reduce((total, item) => total + (item.variant.price * item.quantity), 0);
    }

    let shippingCharge = 0;
    if (dto.shippingAddressId) {
      const address = await this.addressRepository.findOne({ where: { id: dto.shippingAddressId, user: { id: user.id } } });
      if (address) {
        shippingCharge = await this.shippingChargesService.calculateCharges(address);
      }
    }

    const finalTotal = subtotal + shippingCharge;

    return {
      items: itemsToSummarize,
      subtotal,
      shippingCharge,
      finalTotal,
    };
  }

  async confirmOrder(user: User, confirmOrderDto: ConfirmOrderDto) {
    const { paymentMethod, paymentIntentId, shippingAddressId, cartItemIds, buyNowVariantId, buyNowQuantity } = confirmOrderDto;

    if (paymentMethod === PaymentMethod.STRIPE) {
      if (!paymentIntentId) {
        throw new BadRequestException('Payment Intent ID is required for Stripe payments.');
      }

      const existingOrder = await this.orderRepository.findOne({ where: { paymentIntentId } });
      if (existingOrder) {
        return existingOrder; // Idempotency: Order already processed
      }

      const isPaymentVerified = await this.paymentsService.verifyPaymentIntent(paymentIntentId);
      if (!isPaymentVerified) {
        throw new BadRequestException('Payment verification failed. Please try again.');
      }
    } else if (paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      if (paymentIntentId) {
        throw new BadRequestException('Payment Intent ID should not be provided for Cash on Delivery.');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let itemsToCheckout: { variant: ProductVariant, quantity: number }[] = [];
    let cartItemsToRemove: CartItem[] = [];

    try {
      const shippingAddress = await this.addressRepository.findOne({ where: { id: shippingAddressId, user: { id: user.id } } });
      if (!shippingAddress) throw new NotFoundException('Shipping address not found.');

      if (buyNowVariantId && buyNowQuantity) {
        const variant = await queryRunner.manager.findOne(ProductVariant, { where: { id: buyNowVariantId } });
        if (!variant) throw new NotFoundException('Product variant not found.');
        itemsToCheckout = [{ variant, quantity: buyNowQuantity }];
      }
      else if (cartItemIds) {
        const cart = await queryRunner.manager.findOne(Cart, { where: { user: { id: user.id } }, relations: ['items', 'items.variant'] });
        if (!cart) throw new NotFoundException('No active cart found.');
        cartItemsToRemove = cart.items.filter(item => cartItemIds.includes(item.id));
        if (cartItemsToRemove.length !== cartItemIds.length) {
          throw new BadRequestException('Some items selected for checkout were not found in your cart.');
        };
        itemsToCheckout = cartItemsToRemove;
      }
      else {
        throw new BadRequestException('No items provided for checkout.');
      }

      const subtotal = itemsToCheckout.reduce((total, item) => total + item.variant.price * item.quantity, 0);
      const shippingCharge = await this.shippingChargesService.calculateCharges(shippingAddress);
      const finalTotal = subtotal + shippingCharge;

      for (const item of itemsToCheckout) {
        if (!item.variant) continue; // Safety check
        const variant = await queryRunner.manager.findOne(ProductVariant, { where: { id: item.variant.id }, lock: { mode: 'pessimistic_write' } });
        if (!variant || variant.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for variant #${item.variant?.sku || 'N/A'}.`);
        }
      }

      const newOrder = this.orderRepository.create({
        user,
        shippingAddress,
        totalAmount: finalTotal,
        status: OrderStatus.PROCESSING,
        paymentMethod: paymentMethod,
        paymentIntentId: paymentMethod === PaymentMethod.STRIPE ? paymentIntentId : null,
        orderItems: itemsToCheckout.map(item => this.orderItemRepository.create({ variant: item.variant, quantity: item.quantity, price: item.variant.price })),
      });
      await queryRunner.manager.save(newOrder);

      for (const item of newOrder.orderItems) {
        await queryRunner.manager.decrement(ProductVariant, { id: item.variant.id }, 'stock', item.quantity);
      }

      if (cartItemsToRemove.length > 0) {
        await queryRunner.manager.remove(CartItem, cartItemsToRemove);
      }

      await queryRunner.commitTransaction();
      return newOrder;

    }
    catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred during order confirmation.');
    }
    finally {
      await queryRunner.release();
    }
  }

  async findUserOrders(user: User) {
    return this.orderRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findUserOrderById(user: User, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: user.id } },
      relations: { orderItems: { variant: { product: true } } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID #${orderId} not found.`);
    }
    return order;
  }

  async findAllOrders(filterDto: GetOrdersFilterDto): Promise<Order[]> {
    const { status, userId } = filterDto;
    const where: FindOptionsWhere<Order> = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.user = { id: userId };
    }

    return this.orderRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID #${orderId} not found.`);
    }
    order.status = status;
    return this.orderRepository.save(order);
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}