import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { saveAuth } from '../utils/auth'
import { useToast } from '../components/Toast'
import BrandWord from '../components/BrandWord'

export default function SignupPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organisationName: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authService.signup(form)
      saveAuth(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Signup failed. Please try again.'
      console.error('Signup error details:', { 
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      })
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: 'Full Name',         name: 'name',             type: 'text',     placeholder: 'Ravi Kumar' },
    { label: 'Email',             name: 'email',            type: 'email',    placeholder: 'you@example.com' },
    { label: 'Password',          name: 'password',         type: 'password', placeholder: 'Min. 6 characters' },
    { label: 'Organisation Name', name: 'organisationName', type: 'text',     placeholder: 'Ravi Electronics' },
  ]

  return (
    <div className="auth-shell">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-7">
          <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-brand-700 bg-blue-100 mb-4">
            Get Started
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Create your <BrandWord className="text-brand-600" dexClassName="text-gray-900" /> account
          </h1>
          <p className="text-sm text-gray-500 mt-2">Set up your workspace in under a minute</p>
        </div>

        <div className="auth-card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <input
                  className="input"
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required
                  minLength={f.name === 'password' ? 6 : undefined}
                />
              </div>
            ))}

            <button type="submit" className="btn-primary w-full mt-3" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
