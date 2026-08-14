import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { ContentProvider } from './context/ContentContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import DomainPage from './pages/DomainPage';
import SubjectPage from './pages/SubjectPage';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ContentProvider>
      <Navbar
        onMenuClick={() =>
          setSidebarOpen(open => !open)
        }
      />

      <div className="layout">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/:domain"
              element={<DomainPage />}
            />

            <Route
              path="/:domain/:subject"
              element={<SubjectPage />}
            />

            <Route
              path="/:domain/:subject/:module"
              element={<ModulePage />}
            />

            <Route
              path="/:domain/:subject/:module/:lesson"
              element={<LessonPage />}
            />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Routes>
        </main>
      </div>
    </ContentProvider>
  );
}