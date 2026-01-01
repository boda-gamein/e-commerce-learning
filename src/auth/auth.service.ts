import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, first_name, last_name } = registerDto;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const customerRole = await this.prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });
    if (!customerRole) throw new BadRequestException('CUSTOMER role is missing in DB');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        password: hashed,
        roleId: customerRole.id,
      },
      include: { role: true },
    });

    const token = await this.signToken(user.id, user.email, user.role.name);

    return {
      user: this.safeUser(user),
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.signToken(user.id, user.email, user.role.name);

    return {
      user: this.safeUser(user),
      access_token: token,
    };
  }

  private async signToken(userId: string, email: string, role: string) {
    // keep payload small + useful
    return this.jwt.signAsync({
      sub: userId,
      email,
      role,
    }, { expiresIn: "2d" });
  }

  private safeUser(user: any) {
    // Remove password from response
    const { password, ...rest } = user;
    return rest;
  }
}
