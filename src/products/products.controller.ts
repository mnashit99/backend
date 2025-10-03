import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SearchProductDto } from './dto/search-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Product successfully created.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post(':productId/variants')
  @ApiOperation({ summary: 'Create a variant for a product (Admin Only)' })
  @ApiParam({ name: 'productId', description: 'ID of the product' })
  @ApiResponse({ status: 201, description: 'Variant successfully created.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createVariant(
    @Param('productId') productId: string,
    @Body() createProductVariantDto: CreateProductVariantDto,
  ) {
    return this.productsService.createVariant(productId, createProductVariantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'List of products.' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for products' })
  @ApiResponse({ status: 200, description: 'List of products matching the search query.' })
  search(@Query() searchProductDto: SearchProductDto) {
    return this.productsService.search(searchProductDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product details.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (Admin Only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch('variants/:variantId')
  @ApiOperation({ summary: 'Update a product variant (Admin Only)' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateVariant(
    @Param('variantId') variantId: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productsService.updateVariant(variantId, updateProductVariantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (Admin Only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Delete('variants/:variantId')
  @ApiOperation({ summary: 'Delete a product variant (Admin Only)' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiResponse({ status: 200, description: 'Variant deleted successfully.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteVariant(@Param('variantId') variantId: string) {
    return this.productsService.deleteVariant(variantId);
  }
}
