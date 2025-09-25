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
  ) {}

  async create(user: User, dto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create({ ...dto, user });

    // if it's the first address, force as default
    const existingAddresses = await this.findAll(user);
    if (existingAddresses.length === 0) {
      address.isDefault = true;
    }

    // if explicitly marked default, unset other defaults first
    if (dto.isDefault) {
      await this.addressRepository.update(
        { user: { id: user.id } },
        { isDefault: false },
      );
      address.isDefault = true;
    }

    return this.addressRepository.save(address);
  }

  async findAll(user: User): Promise<Address[]> {
    return this.addressRepository.find({ where: { user: { id: user.id } } });
  }

  async update(user: User, id: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!address) throw new NotFoundException('Address not found');

    Object.assign(address, dto);

    if (dto.isDefault) {
      await this.addressRepository.update(
        { user: { id: user.id } },
        { isDefault: false },
      );
      address.isDefault = true;
    }

    return this.addressRepository.save(address);
  }

  async remove(user: User, id: string): Promise<{ message: string }> {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!address) throw new NotFoundException('Address not found');

    const wasDefault = address.isDefault;
    await this.addressRepository.remove(address);

    if (wasDefault) {
      const another = await this.addressRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (another) {
        another.isDefault = true;
        await this.addressRepository.save(another);
      }
    }
    return { message: 'Address deleted successfully' };
  }

  async setDefault(user: User, id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!address) throw new NotFoundException('Address not found');

    await this.addressRepository.update(
      { user: { id: user.id } },
      { isDefault: false },
    );

    address.isDefault = true;
    return this.addressRepository.save(address);
  }
}
