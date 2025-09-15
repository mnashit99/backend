import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['addresses'],
    });
    if (!user) throw new NotFoundException('User not found');

    const address = this.addressRepository.create({ ...dto, user });

    // if it's the first address, force as default
    if (!user.addresses.length) {
      address.isDefault = true;
    }

    // if explicitly marked default
    if (dto.isDefault) {
      await this.addressRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
      address.isDefault = true;
    }

    return this.addressRepository.save(address);
  }

  async findAll(userId: string): Promise<Address[]> {
    return this.addressRepository.find({ where: { user: { id: userId } } });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');

    Object.assign(address, dto);

    if (dto.isDefault) {
      await this.addressRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
      address.isDefault = true;
    }

    return this.addressRepository.save(address);
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');

    const wasDefault = address.isDefault;
    await this.addressRepository.remove(address);

    if (wasDefault) {
      const another = await this.addressRepository.findOne({
        where: { user: { id: userId } },
      });
      if (another) {
        another.isDefault = true;
        await this.addressRepository.save(another);
      }
    }
    return { message: 'Address deleted successfully' };
  }

  async setDefault(userId: string, id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');

    await this.addressRepository.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    address.isDefault = true;
    return this.addressRepository.save(address);
  }
}
