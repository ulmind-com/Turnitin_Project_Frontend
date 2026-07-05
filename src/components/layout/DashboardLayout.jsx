import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
