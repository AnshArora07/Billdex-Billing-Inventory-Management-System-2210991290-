import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { saveAuth } from '../utils/auth'
import { useToast } from '../components/Toast'
import BrandWord from '../components/BrandWord'

export default function LoginPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authService.login(form)
      saveAuth(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <BrandWord dexClassName="text-gray-900" />
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Billing & Inventory made simple
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8">

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome back 👋
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please enter your details to sign in
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email address
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent text-sm transition"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent text-sm transition"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium 
                         hover:bg-blue-700 transition duration-200 disabled:opacity-70 
                         flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <Link to="/about" className="px-3 text-sm text-blue-600 hover:underline font-medium">
              Know About Us
            </Link>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}