'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar.component';
import { STYLE } from '../config/style.consts';
import html2pdf from 'html2pdf.js';

export default function Dashboard() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <div className={STYLE.PAGE}>
      <Sidebar />
      <main className={STYLE.MAIN}>
        <h1 className={STYLE.TITLE}>Dashboard</h1>
      </main>
    </div>
  );
}
