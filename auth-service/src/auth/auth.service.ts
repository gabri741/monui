import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private USER_SERVICE_URL =
    process.env.USER_SERVICE_URL || 'http://user-service:3001';

  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async register(dto: RegisterDto) {
    try {
      const response = await axios.post(`${this.USER_SERVICE_URL}/users`, dto);
      const user = response.data;

      const payload = { user };

      return {
        access_token: await this.jwtService.signAsync(payload),
        user,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Erro ao registrar usuário',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateUser(email: string, password: string) {
    const response = await axios.post(
      `${this.USER_SERVICE_URL}/users/validate`,
      { email, password },
    );

    return response.data;
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.validateUser(dto.email, dto.password);
      if (!user) throw new UnauthorizedException('Credenciais inválidas');

      const token = await this.jwtService.signAsync({ user });

      return { access_token: token, user };
    } catch {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }
  async validateToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private async findUserByEmail(email: string) {
    try {
      const res = await axios.get(
        `${this.USER_SERVICE_URL}/users/email/${email}`,
      );
      return res.data;
    } catch {
      return null; 
    }
  }

  private async createGoogleUser(data: {
    email: string;
    name: string;
    avatar: string;
    googleId: string;
  }) {
    try {
      const res = await axios.post(`${this.USER_SERVICE_URL}/users/google`, {
        ...data,
      });
      return res.data;
    } catch (error) {
      console.error(error.response?.data);
      throw new HttpException(
        error.response?.data || 'Erro ao criar usuário Google',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async loginWithGoogle(credential: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid Google Token');

      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        throw new UnauthorizedException('Google account has no email');
      }

      let user = await this.findUserByEmail(email);


      if (!user) {
        const safeName = name || 'Usuário Google';
        const safeAvatar = picture || '';

        user = await this.createGoogleUser({
          email,
          name: safeName,
          avatar: safeAvatar,
          googleId,
        });
      }

      const token = await this.jwtService.signAsync({ user });

      return {
        access_token: token,
        user,
      };
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
