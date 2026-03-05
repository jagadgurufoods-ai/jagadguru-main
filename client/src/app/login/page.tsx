'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'input' | 'otp'>('input');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');
    const { sendOtp, verifyOtp, passwordLogin, isLoggedIn, user, logout } = useAuth();
    const router = useRouter();

    const isEmail = (val: string) => val.includes('@');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return;
        setLoading(true);
        setError('');
        const type = isEmail(identifier) ? 'email' : 'phone';
        const result = await sendOtp(identifier, type as 'email' | 'phone');
        setLoading(true); // Keep loading state for transition
        setLoading(false);
        if (result.success) {
            setStep('otp');
        } else {
            setError(result.error || 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) return;
        setLoading(true);
        setError('');
        const type = isEmail(identifier) ? 'email' : 'phone';
        const result = await verifyOtp(identifier, otp, type as 'email' | 'phone');
        setLoading(false);
        if (result.success) {
            // Check if admin and redirect accordingly
            if (result.error === 'admin') router.push('/admin/dashboard');
            else router.push('/');
        } else {
            setError(result.error || 'Invalid OTP');
        }
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim() || !password.trim()) return;
        setLoading(true);
        setError('');
        const result = await passwordLogin(identifier, password);
        setLoading(false);
        if (result.success) {
            router.push('/admin/dashboard');
        } else {
            setError(result.error || 'Invalid admin credentials');
        }
    };

    if (isLoggedIn && user) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                        Welcome, {user.name}!
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        {user.email || user.phone}
                    </p>
                    {user.role === 'admin' && (
                        <p className="mt-2 text-center">
                            <a href="/admin/dashboard" className="font-medium text-green-600 hover:text-green-500 underline decoration-2 underline-offset-4">
                                Go to Admin Dashboard →
                            </a>
                        </p>
                    )}
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100 space-y-4">
                        <a href="/cart" className="block w-full text-center py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                            🛒 My Cart
                        </a>
                        <a href="/wishlist" className="block w-full text-center py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                            ❤️ My Wishlist
                        </a>
                        <button
                            onClick={() => { logout(); }}
                            className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all font-sans"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loginMode === 'admin' ? 'Admin Access' : 'Welcome back'}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500">
                    {loginMode === 'admin'
                        ? 'Login with your admin credentials'
                        : (step === 'input'
                            ? 'Enter your email or phone number to get started'
                            : `Enter the OTP sent to ${identifier}`)
                    }
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {loginMode === 'admin' ? (
                        <form className="space-y-6" onSubmit={handleAdminLogin}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Admin Email</label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        required
                                        placeholder="jagadgurufoods@gmail.com"
                                        className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Logging in...' : 'Login as Admin'}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setLoginMode('user'); setError(''); setIdentifier(''); }}
                                className="w-full text-center text-sm text-slate-500 hover:text-green-600 transition-colors"
                            >
                                ← Back to Customer Login
                            </button>
                        </form>
                    ) : (
                        step === 'input' ? (
                            <form className="space-y-6" onSubmit={handleSendOtp}>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Email or Phone Number</label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            required
                                            placeholder="email@example.com or 9876543210"
                                            className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </div>
                                <div className="pt-4 border-t border-slate-100 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setLoginMode('admin'); setError(''); setIdentifier(''); }}
                                        className="w-full text-center text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        Admin Dashboard Access
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form className="space-y-6" onSubmit={handleVerifyOtp}>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Enter OTP</label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            placeholder="Enter 6-digit OTP"
                                            className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-center text-2xl tracking-[0.3em] font-bold transition-all"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setStep('input'); setOtp(''); setError(''); }}
                                    className="w-full text-center text-sm text-slate-500 hover:text-green-600 transition-colors"
                                >
                                    ← Change email/phone
                                </button>
                            </form>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
