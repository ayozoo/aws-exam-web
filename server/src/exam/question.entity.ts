import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exam } from './exam.entity';
import { AnswerOption, AnswerOptionLabel } from '../pdf/pdf.types';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Exam, (exam) => exam.questions, {
    onDelete: 'CASCADE',
  })
  exam: Exam;

  @Column({ type: 'integer', nullable: true })
  number: number | null;

  @Column('text')
  text: string;

  @Column('simple-json')
  options: AnswerOption[];

  @Column('simple-json')
  correctAnswers: AnswerOptionLabel[];

  @Column('text', { nullable: true })
  explanation?: string;

  @Column('text', { nullable: true })
  discussion?: string;

  @Column('simple-json', { nullable: true })
  comments?: any[];
}
