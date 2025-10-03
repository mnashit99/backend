import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('admin')
  @ApiOperation({ summary: 'Register a new admin user' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createAdmin(@Body() createUserDto: CreateUserDto): Promise<User> {
    const admin = await this.usersService.create(createUserDto);
    admin.role = 'admin';
    return admin;
  }


@Post('login')
@ApiOperation({ summary: 'User login and get JWT token' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', example: 'user@example.com' },
      password: { type: 'string', example: 'mypassword123' },
    },
    required: ['email', 'password'],
  },
})
@ApiResponse({
  status: 200,
  description: 'Login successful, returns access token',
  schema: {
    type: 'object',
    properties: {
      access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR...' },
    },
  },
})
@ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

@UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@GetUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@GetUser() user: User, @Body() dto: UpdateProfileDto, @Body('phone') phone: string) {
    const updated = await this.usersService.updateProfile(user.id, dto, phone);
    return updated;
  }

@UseGuards(JwtAuthGuard)
  @Delete('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user profile' })
  @ApiResponse({ status: 200, description: 'User profile deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteProfile(@GetUser() user: User) {
    await this.usersService.remove(user.id);
  }
}
