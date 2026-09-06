'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF3E0] px-4 text-[#3B2F2F] font-sans">
      <div className="w-full max-w-md space-y-6 bg-white/80 p-8 rounded-2xl border border-[#6F4E57]/20 shadow-sm">
        <h2 className="text-center text-2xl font-bold text-[#3B2F2F]">Create an account</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs text-center">{error}</div>}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E57] mb-2">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="mt-1 block w-full px-4 py-2.5 bg-white border border-[#6F4E57]/30 rounded-xl shadow-sm text-sm text-[#3B2F2F] placeholder-[#6F4E57]/60 focus:outline-none focus:border-[#6F4E57]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E57] mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1 block w-full px-4 py-2.5 bg-white border border-[#6F4E57]/30 rounded-xl shadow-sm text-sm text-[#3B2F2F] placeholder-[#6F4E57]/60 focus:outline-none focus:border-[#6F4E57]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E57] mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-2.5 bg-white border border-[#6F4E57]/30 rounded-xl shadow-sm text-sm text-[#3B2F2F] placeholder-[#6F4E57]/60 focus:outline-none focus:border-[#6F4E57]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-6 border border-transparent rounded-xl shadow-md text-white bg-[#C07C56] hover:bg-[#b06c48] font-bold text-sm uppercase tracking-wider transition-all mt-2"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-[#6F4E57]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#C07C56] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}