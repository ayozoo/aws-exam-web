import { Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ExamDetailDto, ExamService, ExamSummaryDto } from './exam.service';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) { }

  @Get()
  getAll(): Promise<ExamSummaryDto[]> {
    return this.examService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number): Promise<ExamDetailDto> {
    return this.examService.findOneWithQuestions(id);
  }

  @Delete(':id')
  async deleteOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.examService.removeOne(id);
  }

  @Delete()
  async deleteAll(): Promise<void> {
    await this.examService.removeAll();
  }
}
