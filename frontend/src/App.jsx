import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import Lesson from './pages/Lesson';

export default function App() {
  return (
    <>
      <Navbar />

      <div className="layout">
        <Sidebar />

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="*"
              element={<Lesson />}
            />
          </Routes>
        </main>
      </div>
    </>
  );
}