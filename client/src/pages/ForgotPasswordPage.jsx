import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      setMessage(res.data.message || 'Password reset link has been sent to your email.');
      setStatus('success');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-xl">IF</span>
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">InvoiceFlow</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Forgot your password?
        </h2>
        <p className="text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          {status === 'success' ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Check your inbox</h3>
              <p className="text-sm text-gray-500 mb-6">
                {message}
              </p>
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      status === 'error' ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                    placeholder="you@example.com"
                  />
                </div>
                {status === 'error' && (
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <Link to="/login" className="font-medium text-sm text-indigo-600 hover:text-indigo-500">
                  Wait, I remember my password
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
