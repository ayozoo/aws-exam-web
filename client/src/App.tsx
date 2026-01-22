import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ExamPractice } from './pages/ExamPractice';
import { ExamManagement } from './pages/ExamManagement';
import type { ExamSummary, ParsedExam } from './types/exam';
import './App.css';

function App() {
  const [examList, setExamList] = useState<ExamSummary[]>([]);
  const [currentExam, setCurrentExam] = useState<ParsedExam | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 如果环境变量未定义，则自动推断：
  // 1. 如果是 localhost 访问，默认用 localhost:3000
  // 2. 如果是局域网 IP 访问 (如 192.168.x.x)，默认尝试同 IP 的 3000 端口
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 
    `${window.location.protocol}//${window.location.hostname}:3000`;

  const loadExamList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/exams`);
      if (!response.ok) {
        throw new Error('获取试卷列表失败');
      }
      const data = (await response.json()) as ExamSummary[];
      setExamList(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '获取试卷列表时出错');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadExamList();
  }, []);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseUrl}/pdf/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || '上传或解析失败');
      }

      await loadExamList();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
      throw err; // 让调用者也能捕获
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExam = async (examId: number) => {
    // -1 means deselect
    if (examId === -1) {
      setCurrentExam(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/exams/${examId}`);
      if (!response.ok) {
        throw new Error('获取试卷详情失败');
      }
      const data = (await response.json()) as ParsedExam;
      setCurrentExam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取试卷详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOne = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/exams/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('删除失败');

      await loadExamList();
      if (currentExam?.id === id) {
        setCurrentExam(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/exams`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('清空失败');

      await loadExamList();
      setCurrentExam(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '清空失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <ExamPractice
                examList={examList}
                currentExam={currentExam}
                loading={loading}
                error={error}
                onSelectExam={handleSelectExam}
              />
            }
          />
          <Route
            path="/manage"
            element={
              <ExamManagement
                examList={examList}
                onUpload={handleUpload}
                onDeleteOne={handleDeleteOne}
                onDeleteAll={handleDeleteAll}
                loading={loading}
                error={error}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
