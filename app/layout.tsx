import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Crude Dashboard',
  description: 'AI-powered crude futures and options dashboard for Groww and WTI feeds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
