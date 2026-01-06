import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersController } from 'src/users/users.controller';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.registerAsync(
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "15d" }
      })
    }
  ),],
  controllers: [AuthController, UsersController],
  providers: [AuthService, PrismaService, JwtStrategy, UsersService],
})
export class AuthModule { }
