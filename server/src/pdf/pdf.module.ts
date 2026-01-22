import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { ExamModule } from '../exam/exam.module';

@Module({
  imports: [MulterModule.register(), ExamModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
