import { Outlet } from 'react-router-dom';

export default function OverviewLayout() {
  return (
    <div className="layout layout--overview">
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}