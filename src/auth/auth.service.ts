import { Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  register(registerDto: RegisterDto) {
    return 'This action adds a new auth';
  }

  login(loginDto: LoginDto) {
    return `This action returns all auth`;
  }

}
