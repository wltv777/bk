'use client';
import { Toaster } from 'react-hot-toast';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { background: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px', fontSize: '14px' },
          success: { iconTheme: { primary: '#FFD700', secondary: '#000' } },
          error: { iconTheme: { primary: '#FF3B30', secondary: '#fff' } },
        }}
      />
    </>
  );
}
