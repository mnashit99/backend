import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { MailService } from '@sendgrid/mail';

@Module({
  imports:[JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
  UsersModule, PassportModule],
  providers: [AuthService,JwtStrategy,MailService],
  exports:[AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
