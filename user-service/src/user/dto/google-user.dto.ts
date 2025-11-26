import { IsString, IsEmail } from 'class-validator';

export class GoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  avatar: string;

  @IsString()
  googleId: string;
}