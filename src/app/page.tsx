'use client';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';

export default function LoginPage() {
  const router = useRouter();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      // Handle errors
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[var(--shadow)]">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Keeping ERP</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Entrar</h1>
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="mb-4 w-full rounded-lg border border-slate-300 bg-surface px-4 py-3 text-slate-900 outline-none transition focus:border-primary"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          className="mb-6 w-full rounded-lg border border-slate-300 bg-surface px-4 py-3 text-slate-900 outline-none transition focus:border-primary"
          required
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-hover">
          Entrar
        </button>
      </form>
    </div>
  );
}
