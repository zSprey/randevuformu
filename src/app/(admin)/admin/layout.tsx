import { ReactNode } from 'react';
import AdminSidebar from './components/AdminSidebar';

export const metadata = {
  title: 'Super Admin | Dashboard',
  description: 'Super Admin Dashboard for Platform Management',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
