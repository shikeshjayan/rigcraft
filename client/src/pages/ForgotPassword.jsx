import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import FadeUp from '../components/FadeUp';
import DynamicLogo from '../components/DynamicLogo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => setSent(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      forgotMutation.mutate(email.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <FadeUp>
        <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)]" style={{ borderRadius: 'var(--radius-sm)' }}>
          <div className="flex justify-center">
            <DynamicLogo />
          </div>

          {!sent ? (
            <>
              <div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                  Forgot Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {forgotMutation.isError && (
                  <p className="text-sm text-red-600 font-medium text-center">
                    {forgotMutation.error?.response?.data?.message || 'Something went wrong. Please try again.'}
                  </p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={forgotMutation.isPending}
                    className={`group relative cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all shadow-md ${forgotMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                  >
                    {forgotMutation.isPending ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 mt-8">
              <div className="text-green-600 text-5xl">✓</div>
              <h2 className="text-2xl font-extrabold text-gray-900">Check Your Email</h2>
              <p className="text-sm text-gray-600">
                We've sent a password reset link to <span className="font-bold text-black">{email}</span>
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 cursor-pointer py-3 px-6 border border-gray-300 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </FadeUp>
    </div>
  );
};

export default ForgotPassword;
