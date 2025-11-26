import { Controller, Get, Param, Post, Body, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { GoogleUserDto } from './dto/google-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Buscar por e-mail
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // Criar usuário Google
  @Post('google')
  createGoogle(@Body() dto: GoogleUserDto) {
    return this.userService.createGoogleUser(dto);
  }

  @Post('validate')
  validate(@Body() body: { email: string; password: string }) {
    return this.userService.validateUser(body.email, body.password);
  }

  @Get()
  findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Post()
  create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
  }
}
