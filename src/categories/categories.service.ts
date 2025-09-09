import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      const category = this.categoryRepository.create({ name: dto.name });

      if (dto.parentId) {
        const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
        if (!parent) throw new NotFoundException('Parent category not found');
        category.parent = parent;
      }

      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find({ relations: ['parent', 'children'] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: string): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['parent', 'children'],
      });
      if (!category) throw new NotFoundException('Category not found');
      return category;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    try {
      const category = await this.findOne(id);

      if (dto.name) category.name = dto.name;
      if (dto.parentId) {
        const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
        if (!parent) throw new NotFoundException('Parent category not found');
        category.parent = parent;
      }

      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const category = await this.findOne(id);
      await this.categoryRepository.remove(category);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}