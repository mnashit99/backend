import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from '../categories/entities/category.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, Category]), CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
