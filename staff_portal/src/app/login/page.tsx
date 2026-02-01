'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [staffId, setStaffId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(staffId.trim(), password);
            router.push('/dashboard');
        } catch (err) {
            const error = err as { message?: string };
            setError(error?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Partner logos data
    const partnerLogos = Array.from({ length: 30 }, (_, i) => {
        const logoNumber = 1868 + i;
        const extension = [1870, 1878, 1892].includes(logoNumber) ? 'png' : 'PNG';
        return `/assets/participating-organization_logos/IMG_${logoNumber}.${extension}`;
    });

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding & Partners */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary text-white p-12 flex-col justify-center items-center">
                <div className="w-full max-w-2xl">
                    {/* Centered Large Logo */}
                    <div className="flex justify-center mb-16">
                        <Image
                            src="/assets/UNITED HEALTH INITIATIVE.png"
                            alt="United Health Initiative Global Staff Portal"
                            width={600}
                            height={225}
                            className="w-full h-auto max-w-2xl"
                            priority
                        />
                    </div>

                    {/* Divider with Heading */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-0.5" style={{ backgroundColor: '#002f6c' }}></div>
                            <h3 className="text-lg font-semibold tracking-wide uppercase" style={{ color: '#002f6c', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                                Participating Organizations
                            </h3>
                            <div className="flex-1 h-0.5" style={{ backgroundColor: '#002f6c' }}></div>
                        </div>
                    </div>

                    {/* Partner Showcase */}
                    <section aria-label="Participating Organizations">

                        {/* Two-Row Scrolling Partner Carousel */}
                        <div className="space-y-4">
                            {/* First Row - Scrolling Left to Right */}
                            <div className="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm p-4">
                                <div className="flex gap-4 animate-scroll-right">
                                    {partnerLogos.slice(0, 15).map((logo, index) => (
                                        <div
                                            key={index}
                                            className="flex-shrink-0 w-20 h-20 bg-white rounded-lg p-2 flex items-center justify-center"
                                        >
                                            <Image
                                                src={logo}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                    {/* Duplicate for seamless loop */}
                                    {partnerLogos.slice(0, 15).map((logo, index) => (
                                        <div
                                            key={`dup1-${index}`}
                                            className="flex-shrink-0 w-20 h-20 bg-white rounded-lg p-2 flex items-center justify-center"
                                        >
                                            <Image
                                                src={logo}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Second Row - Scrolling Right to Left */}
                            <div className="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm p-4">
                                <div className="flex gap-4 animate-scroll-left">
                                    {partnerLogos.slice(15, 30).map((logo, index) => (
                                        <div
                                            key={index}
                                            className="flex-shrink-0 w-20 h-20 bg-white rounded-lg p-2 flex items-center justify-center"
                                        >
                                            <Image
                                                src={logo}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                    {/* Duplicate for seamless loop */}
                                    {partnerLogos.slice(15, 30).map((logo, index) => (
                                        <div
                                            key={`dup2-${index}`}
                                            className="flex-shrink-0 w-20 h-20 bg-white rounded-lg p-2 flex items-center justify-center"
                                        >
                                            <Image
                                                src={logo}
                                                alt=""
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="text-sm opacity-75">
                    © 2025 United Health Initiative. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#e3f2fd' }}>
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-8 text-center">
                            STAFF LOGIN
                        </h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <input
                                    type="text"
                                    id="staffId"
                                    value={staffId}
                                    onChange={(e) => setStaffId(e.target.value)}
                                    placeholder="Username"
                                    required
                                    className="input"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    className="input"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary btn-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    'LOG IN'
                                )}
                            </button>

                            <div className="flex justify-between text-sm">
                                <Link href="#" className="link">
                                    Forgot Username?
                                </Link>
                                <Link href="#" className="link">
                                    Forgot Password?
                                </Link>
                            </div>
                        </form>

                        {/* Instructions */}
                        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-3">INSTRUCTIONS</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                <li>Use your assigned credentials.</li>
                                <li>Contact IT Support for issues.</li>
                                <li>Ensure secure connection.</li>
                                <li>Read privacy policy.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scrollRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-left {
          animation: scrollLeft 40s linear infinite;
        }
        
        .animate-scroll-right {
          animation: scrollRight 40s linear infinite;
        }
        
        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
}
