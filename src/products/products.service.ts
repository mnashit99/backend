import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Brackets, Repository } from 'typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { categoryId, ...productDetails } = createProductDto;
    const newProduct = this.productRepository.create({
      ...productDetails,
      category: { id: categoryId },
    });
    return this.productRepository.save(newProduct);
  }

  
  async createVariant(productId: string, createProductVariantDto: CreateProductVariantDto) {
    const product = await this.productRepository.findOne({ where: { id: productId, isActive: true } });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    const newVariant = this.productVariantRepository.create({
      ...createProductVariantDto,
      product,
    });
    return this.productVariantRepository.save(newVariant);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, search, categoryId } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoin('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('variant.isActive = :isActive', { isActive: true });

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('product.name ILIKE :search', { search: `%${search}%` })
            .orWhere('product.brand ILIKE :search')
            .orWhere('category.name ILIKE :search');
        }),
      );
    }

    queryBuilder.orderBy('product.name', 'ASC').skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    product.variants = product.variants.filter((v) => v.isActive);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId, ...productDetails } = updateProductDto;
    const payload = {
      ...productDetails,
      ...(categoryId && { category: { id: categoryId } }),
    };
    await this.productRepository.update(id, payload);
    return this.findOne(id);
  }

  async updateVariant(variantId: string, updateProductVariantDto: UpdateProductVariantDto) {
    await this.productVariantRepository.update(variantId, updateProductVariantDto);
    return this.productVariantRepository.findOne({ where: { id: variantId } });
  }

  async remove(id: string) {
    return this.productRepository.update(id, { isActive: false });
  }

  async deleteVariant(variantId: string) {
    return this.productVariantRepository.update(variantId, { isActive: false });
  }
}
