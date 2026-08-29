import { Routes, Route } from 'react-router-dom';

import { ContentProvider } from './context/ContentContext';
import { SidebarProvider } from './context/SidebarContext';

import Navbar from './components/Navbar';

import OverviewLayout from './layouts/OverviewLayout';
import LearningLayout from './layouts/LearningLayout';

import Home from './pages/Home';
import DomainPage from './pages/DomainPage';
import SubjectPage from './pages/SubjectPage';
import LearningPage from './pages/LearningPage';
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
          </Route>

          {/*
            Everything from the module level downward (modules, topics,
            and lessons at any depth) is resolved content-driven from the
            content tree, so the URL depth is not hard-coded.
          */}
          <Route element={<LearningLayout />}>
            <Route
              path="/:domain/:subject/*"
              element={<LearningPage />}
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SidebarProvider>
    </ContentProvider>
  );
}