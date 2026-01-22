import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Settings, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <aside className="main-sidebar">
        <div className="logo-section">
          <div className="logo-icon">
            <GraduationCap size={28} />
          </div>
          {/* <span className="logo-text">Exam</span> */}
        </div>
        
        <nav className="main-nav">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            title="刷题练习"
          >
            <BookOpen size={24} />
            <span className="nav-label">刷题</span>
          </NavLink>
          <NavLink
            to="/manage"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            title="题库管理"
          >
            <Settings size={24} />
            <span className="nav-label">管理</span>
          </NavLink>
        </nav>
      </aside>
      <main className="app-content">{children}</main>
    </div>
  );
}
