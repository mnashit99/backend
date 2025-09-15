import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule } from '@nestjs/config';


dotenv.config();

@Module({
  imports:[ConfigModule],
    providers: [MailService],
  exports: [MailService], 
})
export class MailModule {}
