import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersController } from 'src/users/users.controller';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET || 'dev_secret_change_me',
    signOptions: { expiresIn: '1h' },
  }),],
  controllers: [AuthController , UsersController],
  providers: [AuthService, PrismaService, JwtStrategy , UsersService],
})
export class AuthModule { }
