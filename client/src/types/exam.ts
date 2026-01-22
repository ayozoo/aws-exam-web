export type AnswerOptionLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface AnswerOption {
  label: AnswerOptionLabel;
  text: string;
}

export interface DiscussionComment {
  user: string;
  date: string;
  content: string;
  voteCount?: number;
  selectedAnswer?: string;
  isHighlyVoted?: boolean;
  isMostRecent?: boolean;
}

export interface ParsedQuestion {
  number: number | null;
  text: string;
  options: AnswerOption[];
  correctAnswers: AnswerOptionLabel[];
  explanation?: string;
  discussion?: string;
  comments?: DiscussionComment[];
}

export interface ParsedExam {
  id: number;
  title: string;
  questions: ParsedQuestion[];
}

export interface ExamSummary {
  id: number;
  title: string;
  questionCount: number;
  createdAt: string;
}
