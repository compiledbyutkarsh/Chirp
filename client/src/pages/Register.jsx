import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🐦</span>
          <h1 className="text-3xl font-bold text-white mt-4">Join Chirp today</h1>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Full Name"
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          />
          <input
            type="text" placeholder="Username"
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
            value={form.username} onChange={e => setForm({...form, username: e.target.value})}
          />
          <input
            type="email" placeholder="Email"
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          />
          <input
            type="password" placeholder="Password"
            className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-sky-500"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
