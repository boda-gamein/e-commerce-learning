import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() createAuthDto: RegisterDto) {
    return this.authService.register(createAuthDto);
  }
  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }
}
