import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail/mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CategoriesModule } from './categories/categories.module';
import { AddressesModule } from './addresses/addresses.module';
import { typeOrmConfig } from './configs/database.config';
import { MailModule } from './mail/mail.module';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { ShippingChargesModule } from './shipping-charges/shipping-charges.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [
  
    TypeOrmModule.forRootAsync({
      useFactory: () => typeOrmConfig,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    AddressesModule,
    CategoriesModule,
    MailModule,
    ProductsModule,
    OrdersModule,
    ShippingChargesModule,
    PaymentsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
