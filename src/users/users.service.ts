import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from './profile-embeddable';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
    const user = await this.usersRepository.create({...createUserDto, password: hashedPassword,role:role });
    return await this.usersRepository.save(user);
  }
  async findOneByEmail(email: string) {
  return this.usersRepository.findOne({ where: { email } });
}
async findByResetToken(token: string) {
  return this.usersRepository.findOne({ where: { resetToken: token } });
}


async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // ensure profile object exists
    user.profile = {
    ...user.profile,
    ...dto,
    birthday: dto.birthday ? new Date(dto.birthday) : user.profile?.birthday,
  };

    await this.usersRepository.save(user);
    // return fresh user (omit password in controller/transformer)
    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  async getProfile(userId: string): Promise<Partial<User> | null> {
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  if (!user) return null;

  // omit sensitive info
  const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
  return safeUser;
}

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}