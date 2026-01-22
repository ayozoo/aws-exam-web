import { useState, useEffect } from 'react';
import { ExamListSidebar } from '../components/ExamListSidebar';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionNavigator } from '../components/QuestionNavigator';
import type { ExamSummary, ParsedExam, AnswerOptionLabel } from '../types/exam';
import { Menu, X } from 'lucide-react';

interface ExamPracticeProps {
  examList: ExamSummary[];
  currentExam: ParsedExam | null;
  loading: boolean;
  error: string | null;
  onSelectExam: (id: number) => void;
}

interface ExamProgress {
  currentIndex: number;
  selectedOptions: Record<number, AnswerOptionLabel[]>;
  submittedMap: Record<number, boolean>;
}

export function ExamPractice({
  examList,
  currentExam,
  loading,
  error,
  onSelectExam,
}: ExamPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, AnswerOptionLabel[]>>({});
  const [submittedMap, setSubmittedMap] = useState<Record<number, boolean>>({});

  const [sidebarWidth, setSidebarWidth] = useState(280); // Increased default width
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Calculate columns based on width
  // Assume ~42px min per item + 8px gap
  // columns = floor((width - padding) / (itemWidth + gap))
  const gridColumns = Math.max(3, Math.floor((sidebarWidth - 32) / 50)); 

  // Handle resizing
  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Limit min and max width
      const newWidth = Math.max(200, Math.min(600, e.clientX - 72)); // 72 is main-sidebar width
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // 1. 当切换试卷时，尝试从 localStorage 读取进度
  useEffect(() => {
    if (!currentExam) return;

    const savedProgress = localStorage.getItem(`exam_progress_${currentExam.id}`);
    if (savedProgress) {
      try {
        const progress: ExamProgress = JSON.parse(savedProgress);
        
        // 验证 index 是否越界
        let safeIndex = progress.currentIndex || 0;
        if (currentExam.questions && currentExam.questions.length > 0) {
           if (safeIndex >= currentExam.questions.length) {
             safeIndex = 0;
           }
        } else {
           safeIndex = 0;
        }

        setCurrentIndex(safeIndex);
        setSelectedOptions(progress.selectedOptions || {});
        setSubmittedMap(progress.submittedMap || {});
      } catch (e) {
        console.error('Failed to parse exam progress', e);
        // Fallback to default
        setCurrentIndex(0);
        setSelectedOptions({});
        setSubmittedMap({});
      }
    } else {
      // 无记录，重置
      setCurrentIndex(0);
      setSelectedOptions({});
      setSubmittedMap({});
    }
  }, [currentExam?.id]);

  // Add safe check for questions
  const questions = currentExam?.questions || [];
  const currentQuestion = questions[currentIndex];


  // 2. 监听状态变化，自动保存到 localStorage
  useEffect(() => {
    if (!currentExam) return;

    const progress: ExamProgress = {
      currentIndex,
      selectedOptions,
      submittedMap,
    };
    
    localStorage.setItem(`exam_progress_${currentExam.id}`, JSON.stringify(progress));
  }, [currentExam, currentIndex, selectedOptions, submittedMap]);

  // 3. 计算答题状态 (Correct/Wrong)
  const answerStatusMap: Record<number, 'correct' | 'wrong' | 'unsubmitted'> = {};
  if (currentExam) {
    currentExam.questions.forEach((q, idx) => {
      if (submittedMap[idx]) {
        const userSelected = selectedOptions[idx] || [];
        const correctAnswers = q.correctAnswers || [];
        
        // 简单判断：数组内容是否完全一致（排序后比较）
        const sortedUser = [...userSelected].sort();
        const sortedCorrect = [...correctAnswers].sort();
        
        const isCorrect = 
          sortedUser.length === sortedCorrect.length &&
          sortedUser.every((val, i) => val === sortedCorrect[i]);
          
        answerStatusMap[idx] = isCorrect ? 'correct' : 'wrong';
      } else {
        answerStatusMap[idx] = 'unsubmitted';
      }
    });
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!currentExam) return;
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };
  
  const handleJumpTo = (index: number) => {
    if (!currentExam) return;
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      closeMobileSidebar(); // Close sidebar on mobile when selecting a question
    }
  };

  const handleToggleOption = (label: AnswerOptionLabel) => {
    if (!currentExam || !currentQuestion) return;
    
    setSelectedOptions((prev) => {
      const prevSelected = prev[currentIndex] || [];
      const isMulti = currentQuestion.correctAnswers.length > 1;
      
      let nextSelected: AnswerOptionLabel[];
      if (isMulti) {
        nextSelected = prevSelected.includes(label)
          ? prevSelected.filter((l) => l !== label)
          : [...prevSelected, label];
      } else {
        nextSelected = prevSelected.includes(label) ? [] : [label];
      }
      
      return { ...prev, [currentIndex]: nextSelected };
    });
  };

  const handleBackToExamList = () => {
    // 简单地清除当前选中的 exam，回到列表视图
    // 注意：这里需要父组件或者路由配合。
    // 在当前架构下，onSelectExam 只是选中。
    // 我们需要一种方式告诉父组件 "取消选中" 或者传递 null
    onSelectExam(-1); // 假设 -1 代表取消选中，或者我们需要修改接口
  };

  const handleSubmitCurrent = () => {
    setSubmittedMap((prev) => ({ ...prev, [currentIndex]: true }));
  };

  if (error) {
    return <div className="practice-error">{error}</div>;
  }

  return (
    <div className="practice-layout">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleMobileSidebar}
      >
        {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`practice-sidebar-overlay ${isMobileSidebarOpen ? 'visible' : ''}`}
        onClick={closeMobileSidebar}
      />

      <aside 
        className={`practice-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
        style={{ width: `${sidebarWidth}px`, minWidth: '200px', maxWidth: '600px' }}
      >
        {currentExam ? (
          <QuestionNavigator
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            submittedMap={submittedMap}
            answerStatusMap={answerStatusMap}
            onSelect={handleJumpTo}
            onBackToExamList={() => {
              onSelectExam(-1);
              closeMobileSidebar();
            }}
            gridColumns={gridColumns}
          />
        ) : (
          <ExamListSidebar
            exams={examList}
            currentExamId={null}
            onSelectExam={(id) => {
              onSelectExam(id);
              closeMobileSidebar();
            }}
            loading={loading}
          />
        )}
      </aside>

      <div 
        className={`sidebar-resizer ${isResizing ? 'resizing' : ''}`}
        onMouseDown={startResizing}
      />

      <main className="practice-main">
        {!currentExam ? (
          <>
            <div className="practice-empty desktop-only">
              <h2>欢迎开始刷题</h2>
              <p>请从左侧选择一份试卷开始练习。</p>
              {examList.length === 0 && <p>暂无试卷，请先去管理页面上传。</p>}
            </div>
            {/* Mobile: Show exam list directly in main area when no exam selected */}
            <div className="mobile-only-list">
              <ExamListSidebar
                exams={examList}
                currentExamId={null}
                onSelectExam={(id) => {
                  onSelectExam(id);
                  // No need to close sidebar as we are not in sidebar
                }}
                loading={loading}
              />
            </div>
          </>
        ) : (
          <div className="practice-content">
            <div className="exam-header">
              <h2>{currentExam.title}</h2>
            </div>
            {questions.length > 0 && currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                onPrev={handlePrev}
                onNext={handleNext}
                onSubmit={handleSubmitCurrent}
                selectedOptions={selectedOptions[currentIndex] || []}
                isSubmitted={submittedMap[currentIndex] || false}
                onToggleOption={handleToggleOption}
              />
            ) : (
               <div className="practice-error">该试卷暂无题目或题目解析失败。</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
