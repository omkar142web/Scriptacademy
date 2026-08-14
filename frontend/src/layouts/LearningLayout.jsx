import { Outlet } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';

export default function LearningLayout() {
  const { open, close } = useSidebar();

  return (
    <div className="layout layout--learning">
      <Sidebar open={open} onClose={close} />

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}