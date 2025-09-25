import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from '../stripe/stripe.module';

export interface PaymentProcessingDto {
  amount: number;
  currency?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(@Inject(STRIPE_CLIENT) private readonly stripe: Stripe) {}

  async createPaymentIntent(dto: PaymentProcessingDto): Promise<{ clientSecret: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(dto.amount * 100), // Stripe expects the amount in cents
        currency: dto.currency || 'usd',
        automatic_payment_methods: { enabled: true },
      });

      if (!paymentIntent.client_secret) {
        throw new InternalServerErrorException('Failed to create payment intent: Client secret was not returned.');
      }

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      throw error;
    }
  }

  async verifyPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return intent.status === 'succeeded';
    } catch (error) {
      this.logger.error(`Failed to verify payment intent ${paymentIntentId}`, error);
      return false;
    }
  }
}
