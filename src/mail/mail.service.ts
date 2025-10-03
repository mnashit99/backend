import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
  ) {}
  emailTransport(){
    const transportor = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
    return transportor;
  }

  async sendPasswordReset(email: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password/${token}`;
    const text = `Hi, \nTo reset your password, click here: ${resetLink}\nIf you did not request this, please ignore this email.`;
    const transport = this.emailTransport();
    const options : nodemailer.SendMailOptions = {
      from: `"No Reply" <${this.configService.get('MAIL_USER')}>`,
      to: email,
      subject: 'Password Reset Request',
      html: text,
    };
    try{
    await transport.sendMail(options);
    console.log('Email sent successfully');
    }
    catch(error){
    console.error('Error sending email:', error);
  }
  } 
    // await this.mailerService.sendMail({
    //   to: email,
    //   subject: 'Password Reset Request',
    //   text,
    //   context: { resetLink },
    // });
  }

