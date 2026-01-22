import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './exam.entity';
import { Question } from './question.entity';
import { ParsedExam } from '../pdf/pdf.types';

export interface ExamSummaryDto {
  id: number;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface ExamDetailDto {
  id: number;
  title: string;
  questions: Question[];
}

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) { }

  async createFromParsedExam(parsed: ParsedExam): Promise<ExamDetailDto> {
    const exam = this.examRepository.create({
      title: parsed.title,
      questions: parsed.questions.map((q) =>
        this.questionRepository.create({
          number: q.number,
          text: q.text,
          options: q.options,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation,
          discussion: q.discussion,
          comments: q.comments,
        }),
      ),
    });

    const saved = await this.examRepository.save(exam);

    const withQuestions = await this.examRepository.findOne({
      where: { id: saved.id },
      relations: ['questions'],
      order: {
        questions: {
          number: 'ASC',
        },
      },
    });

    if (!withQuestions) {
      throw new NotFoundException('试卷保存失败');
    }

    return this.toDetailDto(withQuestions);
  }

  async findAll(): Promise<ExamSummaryDto[]> {
    const exams = await this.examRepository.find({
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });

    return exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      questionCount: exam.questions.length,
      createdAt: exam.createdAt.toISOString(),
    }));
  }

  async findOneWithQuestions(id: number): Promise<ExamDetailDto> {
    const exam = await this.examRepository.findOne({
      where: { id },
      relations: ['questions'],
      order: {
        questions: {
          number: 'ASC',
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('试卷不存在');
    }

    return this.toDetailDto(exam);
  }

  async removeOne(id: number): Promise<void> {
    const exam = await this.examRepository.findOne({
      where: { id },
    });
    if (!exam) {
      throw new NotFoundException('试卷不存在');
    }
    await this.examRepository.remove(exam);
  }

  async removeAll(): Promise<void> {
    await this.examRepository.clear();
  }

  private toDetailDto(exam: Exam): ExamDetailDto {
    return {
      id: exam.id,
      title: exam.title,
      questions: exam.questions,
    };
  }
}
