import { Routes, Route } from 'react-router-dom';

import { ContentProvider } from './context/ContentContext';
import { SidebarProvider } from './context/SidebarContext';

import Navbar from './components/Navbar';

import OverviewLayout from './layouts/OverviewLayout';
import LearningLayout from './layouts/LearningLayout';

import Home from './pages/Home';
import DomainPage from './pages/DomainPage';
import SubjectPage from './pages/SubjectPage';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ContentProvider>
      <SidebarProvider>
        <Navbar />

        <Routes>
          <Route element={<OverviewLayout />}>
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
              path="*"
              element={<NotFoundPage />}
            />
          </Route>

          <Route element={<LearningLayout />}>
            <Route
              path="/:domain/:subject/:module"
              element={<ModulePage />}
            />

            <Route
              path="/:domain/:subject/:module/:lesson"
              element={<LessonPage />}
            />
          </Route>
        </Routes>
      </SidebarProvider>
    </ContentProvider>
  );
}