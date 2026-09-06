'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        localStorage.removeItem('cart_items');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E0] text-[#3B2F2F] flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-white/80 border border-[#6F4E57]/20 rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#3B2F2F]">Sign In to VELVET</h1>
          <p className="text-sm text-[#6F4E57] mt-1">Enter your credentials to access your account and saved cart.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E57] mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-[#6F4E57]/30 rounded-xl px-4 py-2.5 text-sm text-[#3B2F2F] placeholder-[#6F4E57]/60 focus:outline-none focus:border-[#6F4E57]"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E57] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-[#6F4E57]/30 rounded-xl px-4 py-2.5 text-sm text-[#3B2F2F] placeholder-[#6F4E57]/60 focus:outline-none focus:border-[#6F4E57]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C07C56] hover:bg-[#b06c48] text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 uppercase tracking-wider"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-[#6F4E57]">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#C07C56] font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}