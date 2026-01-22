import { useState, useEffect } from 'react';
import type { ParsedQuestion, AnswerOptionLabel } from '../types/exam';
import { User, ThumbsUp, Sparkles, Copy, Check } from 'lucide-react';

interface QuestionCardProps {
  question: ParsedQuestion;
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  selectedOptions: AnswerOptionLabel[];
  isSubmitted: boolean;
  onToggleOption: (label: AnswerOptionLabel) => void;
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  selectedOptions,
  isSubmitted,
  onToggleOption,
}: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [copied, setCopied] = useState(false);

  // 当切题时，重置内部状态，但如果题目已经提交过，通常需要保持显示答案状态？
  // 这里的逻辑是：如果父组件传进来的 isSubmitted 为 true，则自动显示答案。
  // 但用户也可以手动切换“显示/隐藏”。
  // 简单起见，如果 isSubmitted 变为 true，我们自动展开一次。
  useEffect(() => {
    // 只有当 isSubmitted 状态改变时才触发，避免不必要的重渲染
    // 并且我们只在变为 true 时自动展开，用户手动关闭后不会强制重新展开
  }, [isSubmitted]); 

  // 当切题时(question变化)，重置状态
  useEffect(() => {
    // 异步更新状态以避免副作用
    const timer = setTimeout(() => {
      if (isSubmitted) {
        setShowAnswer(true);
      } else {
        setShowAnswer(false);
        setShowDiscussion(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [question, isSubmitted]);

  const handleToggleAnswer = () => setShowAnswer((prev) => !prev);
  const handleToggleDiscussion = () => setShowDiscussion((prev) => !prev);

  const handleCopyQuestion = () => {
    if (!question) return;

    const optionsText = (question.options || [])
      .map(opt => `${opt.label}. ${opt.text}`)
      .join('\n');
    
    const correctText = (question.correctAnswers || []).join(', ');
    
    const textToCopy = `Question #${question.number ?? currentIndex + 1}
${question.text}

${optionsText}

Correct Answer: ${correctText}
${question.explanation ? `\nExplanation:\n${question.explanation}` : ''}`;

    // Fallback for non-secure contexts (e.g. HTTP on iOS)
    if (!navigator.clipboard || !window.isSecureContext) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  if (!question) {
    return <div className="error-message">题目数据丢失</div>;
  }

  const options = question.options || [];
  const correctAnswers = question.correctAnswers || [];

  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-number">
          Question #{question.number ?? currentIndex + 1}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={handleCopyQuestion}
            className="btn-nav"
            style={{ 
              padding: '4px 8px', 
              fontSize: '0.8rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              color: copied ? 'var(--success-color)' : 'inherit',
              borderColor: copied ? 'var(--success-color)' : 'var(--border-color)'
            }}
            title="复制题目和答案"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '已复制' : '复制'}
          </button>
          <span className="question-progress">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
      </div>

      <div className="question-body">
        <div className="question-text">{question.text}</div>

        <ul className="option-list">
          {options.map((opt) => {
            const isSelected = selectedOptions.includes(opt.label);
            const isCorrect = correctAnswers.includes(opt.label);
            
            // 样式逻辑：
            // 1. 如果显示答案(showAnswer):
            //    - 正确选项 -> correct (绿)
            //    - 选中但错误 -> wrong (红) (可选，用户没要求，但通常刷题网站会有)
            // 2. 如果没显示答案:
            //    - 选中 -> selected (蓝/灰)
            
            let className = 'option-item';
            if (showAnswer) {
              if (isCorrect) className += ' correct';
              else if (isSelected) className += ' wrong';
            } else {
              if (isSelected) className += ' selected';
            }

            return (
              <li
                key={opt.label}
                className={className}
                onClick={() => !isSubmitted && onToggleOption(opt.label)}
              >
                <span className="option-label">{opt.label}.</span>
                <span className="option-text">{opt.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="question-actions">
        <div className="nav-buttons">
          <button onClick={onPrev} disabled={currentIndex === 0} className="btn-nav">
            上一题
          </button>
          <button onClick={onNext} disabled={currentIndex === totalQuestions - 1} className="btn-nav">
            下一题
          </button>
        </div>

        <div className="control-buttons">
          {!isSubmitted && (
            <button onClick={onSubmit} className="btn-submit">
              提交本题
            </button>
          )}
          <button onClick={handleToggleAnswer} className="btn-toggle">
            {showAnswer ? '隐藏答案' : '显示答案'}
          </button>
          {question.discussion && (
            <button onClick={handleToggleDiscussion} className="btn-toggle">
              {showDiscussion ? '收起解析' : '展开解析'}
            </button>
          )}
        </div>
      </div>

      {showAnswer && question.explanation && (
        <div className="explanation-box">
          <div className="box-title">解析</div>
          <div className="box-content">{question.explanation}</div>
        </div>
      )}

      {showDiscussion && (
        <div className="discussion-box">
          <div className="box-title">社区讨论 / 详细解析</div>
          {question.comments && question.comments.length > 0 ? (
            <div className="comments-list">
              {question.comments.map((comment, idx) => (
                <div key={idx} className="comment-item">
                  <div className="comment-avatar">
                    <User size={24} className="avatar-icon" />
                  </div>
                  <div className="comment-main">
                    <div className="comment-header-compact">
                      <div className="header-top-row">
                        <span className="user-name">{comment.user}</span>
                        <span className="dot-separator">•</span>
                        <span className="comment-date">{comment.date}</span>
                      </div>
                      
                      {(comment.isHighlyVoted || comment.isMostRecent) && (
                        <div className="header-badges-row">
                          {comment.isHighlyVoted && (
                            <span className="badge highly-voted">
                              <ThumbsUp size={12} style={{ marginRight: 4 }} /> Highly Voted
                            </span>
                          )}
                          {comment.isMostRecent && (
                            <span className="badge most-recent">
                              <Sparkles size={12} style={{ marginRight: 4 }} /> Most Recent
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {comment.selectedAnswer && (
                      <div className="comment-selected-answer">
                        <span className="label">Selected Answer:</span> <strong>{comment.selectedAnswer}</strong>
                      </div>
                    )}
                    
                    <div className="comment-content">{comment.content}</div>
                    
                    {comment.voteCount !== undefined && (
                      <div className="comment-votes">
                        <ThumbsUp size={14} style={{ marginRight: 4 }} /> upvoted {comment.voteCount} times
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="box-content">{question.discussion}</pre>
          )}
        </div>
      )}
    </div>
  );
}
