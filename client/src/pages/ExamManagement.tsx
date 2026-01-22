import { useState, type ChangeEvent } from 'react';
import type { ExamSummary } from '../types/exam';
import { Trash2, Upload, AlertCircle } from 'lucide-react';

interface ExamManagementProps {
  examList: ExamSummary[];
  onUpload: (file: File) => Promise<void>;
  onDeleteOne: (id: number) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function ExamManagement({
  examList,
  onUpload,
  onDeleteOne,
  onDeleteAll,
  loading,
  error,
}: ExamManagementProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (file) {
      await onUpload(file);
      setFile(null); // 上传成功后清空文件选择
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>题库管理</h2>
        <p className="page-subtitle">上传 PDF 题库，或管理已有的试卷。</p>
      </div>

      <div className="management-content">
        <div className="upload-section card">
          <h3>上传新题库</h3>
          <div className="upload-area">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              id="file-upload"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-label">
              <Upload size={24} />
              <span>{file ? file.name : '点击选择或拖拽 PDF 文件'}</span>
            </label>
            <button
              onClick={handleUploadClick}
              disabled={!file || loading}
              className="btn-primary btn-upload"
            >
              {loading ? '处理中...' : '上传并解析'}
            </button>
          </div>
          {error && (
            <div className="error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="list-section card">
          <div className="section-header">
            <h3>已上传试卷 ({examList.length})</h3>
            {examList.length > 0 && (
              <button onClick={onDeleteAll} className="btn-danger btn-sm" disabled={loading}>
                <Trash2 size={16} /> 清空全部
              </button>
            )}
          </div>
          
          {examList.length === 0 ? (
            <div className="empty-state">
              暂无试卷，请先上传。
            </div>
          ) : (
            <ul className="management-list">
              {examList.map((exam) => (
                <li key={exam.id} className="management-item">
                  <div className="item-info">
                    <span className="item-title">{exam.title}</span>
                    <span className="item-meta">
                      {exam.questionCount} 题 • {new Date(exam.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteOne(exam.id)}
                    className="btn-icon-danger"
                    title="删除此试卷"
                    disabled={loading}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
