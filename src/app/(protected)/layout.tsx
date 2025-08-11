import { AppHeader } from '@/components/ui/AppHeader';
import { AppFooter } from '@/components/ui/AppFooter';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}