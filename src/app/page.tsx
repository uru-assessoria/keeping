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
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-6 bg-gray-200 white rounded-md shadow-md">
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="mb-4 block w-full rounded-md border-2 border-gray-300 p-2 focus:border-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-400"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="mb-4 block w-full rounded-md border-2 border-gray-300 p-2 focus:border-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-400"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none">
        Login
      </button>
    </form>
  );
}
