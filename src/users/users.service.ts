import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({
    email: createUserDto.email,
  });
   if (existingUser) {
    throw new BadRequestException('Email already registered');
  }
    const role = 'customer';
    const { password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({...createUserDto, password: hashedPassword,role:role });
    return this.usersRepository.save(user);
  }
  async findOneByEmail(email: string) {
  return this.usersRepository.findOne({ where: { email } });
}
async findByResetToken(token: string) {
  return this.usersRepository.findOne({ where: { resetToken: token } });
}


  // async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
  //   const { password, profile } = updateUserDto;
  //   const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  //   await this.usersRepository.update(id, { ...(password && { password: hashedPassword }), ...(profile && { profile }) });
  // }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}