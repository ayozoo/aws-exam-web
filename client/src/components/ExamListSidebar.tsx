import type { ExamSummary } from '../types/exam';
import { FileText } from 'lucide-react';

interface ExamListSidebarProps {
  exams: ExamSummary[];
  currentExamId: number | null;
  onSelectExam: (id: number) => void;
  loading: boolean;
}

export function ExamListSidebar({
  exams,
  currentExamId,
  onSelectExam,
  loading,
}: ExamListSidebarProps) {
  if (loading && exams.length === 0) {
    return <div className="sidebar-loading">加载中...</div>;
  }

  if (exams.length === 0) {
    return <div className="sidebar-empty">暂无试卷，请先上传</div>;
  }

  const getProgress = (examId: number, totalQuestions: number) => {
    try {
      const saved = localStorage.getItem(`exam_progress_${examId}`);
      if (!saved) return null;
      const data = JSON.parse(saved);
      // Count questions that are either submitted OR have selected options
      const submittedIds = Object.keys(data.submittedMap || {});
      const selectedIds = Object.keys(data.selectedOptions || {}).filter(k => {
        const val = data.selectedOptions[k];
        return Array.isArray(val) && val.length > 0;
      });
      
      // Use Set to get unique count
      const uniqueDone = new Set([...submittedIds, ...selectedIds]);
      const doneCount = uniqueDone.size;
      
      return {
        count: doneCount,
        percent: Math.round((doneCount / totalQuestions) * 100)
      };
    } catch {
      return null;
    }
  };

  return (
    <div className="exam-sidebar">
      <h3 className="sidebar-title">试卷列表</h3>
      <ul className="sidebar-list">
        {exams.map((exam) => {
          const progress = getProgress(exam.id, exam.questionCount);
          return (
            <li
              key={exam.id}
              className={`sidebar-item ${exam.id === currentExamId ? 'active' : ''}`}
              onClick={() => onSelectExam(exam.id)}
            >
              <div className="item-icon">
                <FileText size={16} />
              </div>
              <div className="item-info">
                <div className="item-title" title={exam.title}>
                  {exam.title}
                </div>
                <div className="item-meta">
                  <span>{exam.questionCount} 题</span>
                  {progress && progress.count > 0 && (
                    <span style={{ marginLeft: '8px', color: 'var(--primary-color)' }}>
                      (已做 {progress.count})
                    </span>
                  )}
                </div>
                {progress && progress.count > 0 && (
                  <div style={{ 
                    marginTop: '4px', 
                    width: '100%', 
                    height: '4px', 
                    background: '#e5e7eb', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress.percent}%`,
                      height: '100%',
                      background: 'var(--primary-color)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
