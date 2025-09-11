import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { MailService } from '@sendgrid/mail';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports:[JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    MailService,
  forwardRef(() => UsersModule), PassportModule,MailModule],
  providers: [AuthService,JwtStrategy,MailService],
  exports:[AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
