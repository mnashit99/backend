import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from './profile-embeddable';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminUpdateUserDto } from '../admin/dto/admin-update-user.dto';

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

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find();
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findOneByEmail(email: string) {
  return await this.usersRepository.findOne({ where: { email } });
}
async findByResetToken(token: string) {
  return await this.usersRepository.findOne({ where: { resetToken: token } });
}


async updateProfile(userId: string, dto: UpdateProfileDto, phone: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Update profile data
    user.profile = {
        ...user.profile,
        ...dto,
        birthday: dto.birthday ? new Date(dto.birthday) : user.profile?.birthday,
    };

    // Update phone only if provided
    if (phone !== undefined) {
        user.phone = phone; // Direct string assignment
    }

    await this.usersRepository.save(user);
    return await this.usersRepository.findOne({ where: { id: userId } });
}

  async updateByAdmin(id: string, adminUpdateUserDto: AdminUpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID #${id} not found.`);
    }

    Object.assign(user, adminUpdateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    const { password, ...result } = updatedUser;
    return result;
  }

  async getProfile(userId: string): Promise<Partial<User> | null> {
  const user = await this.usersRepository.findOne({ where: { id: userId } });
  if (!user) return null;

  // omit sensitive info
  const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
  return safeUser;
}

  async remove(id: string): Promise<User> {
   const deletedUser = await this.usersRepository.findOne({ where: { id } });
   if(!deletedUser){
    throw new NotFoundException('User not found');
   }
   await this.usersRepository.delete(id);
   return deletedUser;
  }
}