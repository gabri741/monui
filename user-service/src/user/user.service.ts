import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto';
import { GoogleUserDto } from './dto/google-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<UserResponseDto> {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) throw new NotFoundException(`User with id ${id} not found`);

  const { password, ...rest } = user;
  return rest;
}

  // Listar todos
 async findAll(): Promise<UserResponseDto[]> {
  const users = await this.userRepository.find();
  return users.map(({ password, ...rest }) => rest);
}

  // Criar usuário com hash
  async create(userData: Partial<User>): Promise<any> {
    const exists = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (exists) throw new BadRequestException('E-mail já está em uso');

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);

    const { password, ...safeUser } = saved;
    return safeUser;
  }

 
  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;

    const { password: pw, ...safeUser } = user;
    return safeUser;
  }

    async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async createGoogleUser(dto: GoogleUserDto) {
    const user = this.userRepository.create({
      email: dto.email,
      firstName: dto.name,
      lastName: "",
      googleId: dto.googleId,
      isActive: true,
    });

    return this.userRepository.save(user);
  }
}
