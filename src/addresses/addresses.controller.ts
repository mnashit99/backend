import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Address } from './entities/address.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AddressesService } from './addresses.service';

@ApiTags('addresses')
@ApiBearerAuth() // tells Swagger this requires JWT auth
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully', type: Address })
  async create(@GetUser() user: User, @Body() dto: CreateAddressDto) {
    return this.addressService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses of the logged-in user' })
  @ApiResponse({ status: 200, description: 'List of addresses', type: [Address] })
  async findAll(@GetUser() user: User) {
    return this.addressService.findAll(user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated', type: Address })
  async update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async remove(@GetUser() user: User, @Param('id') id: string) {
    return this.addressService.remove(user.id, id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiResponse({ status: 200, description: 'Address set as default', type: Address })
  async setDefault(@GetUser() user: User, @Param('id') id: string) {
    return this.addressService.setDefault(user.id, id);
  }
}
