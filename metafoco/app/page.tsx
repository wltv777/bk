import { redirect } from 'next/navigation';

// Server-side redirect — no JS needed, instant, never gets stuck
export default function RootPage() {
  redirect('/login');
}
