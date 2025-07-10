import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, User, Mail, Lock, BadgeCheck } from 'lucide-react'
import { registerUser } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const passwordStrength = (password) => {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']
const strengthColors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm()

  const password = watch('password')
  const strength = passwordStrength(password)

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data))
    if (result.type === 'auth/register/fulfilled') {
      reset()
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-8 border border-gray-100">
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <BadgeCheck className="text-primary-600 h-7 w-7" />
            <span className="text-primary-600 font-bold text-xl tracking-tight">Traffic Interceptor</span>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-500 transition"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                <span className="absolute left-3 top-9 text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  {...register('first_name', {
                    required: 'First name is required',
                  })}
                  type="text"
                  className={`input pl-10 ${errors.first_name ? 'border-red-400' : 'focus:border-primary-500'} transition`}
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
                )}
              </div>
            </div>
            <div className="relative">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1">
                <span className="absolute left-3 top-9 text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  {...register('last_name', {
                    required: 'Last name is required',
                  })}
                  type="text"
                  className={`input pl-10 ${errors.last_name ? 'border-red-400' : 'focus:border-primary-500'} transition`}
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <span className="absolute left-3 top-9 text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className={`input pl-10 ${errors.email ? 'border-red-400' : 'focus:border-primary-500'} transition`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1">
              <span className="absolute left-3 top-9 text-gray-400">
                <User className="h-4 w-4" />
              </span>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                })}
                type="text"
                className={`input pl-10 ${errors.username ? 'border-red-400' : 'focus:border-primary-500'} transition`}
                placeholder="Enter your username"
                autoComplete="username"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              Password
              <span
                className="ml-1 cursor-pointer relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Lock className="h-4 w-4 text-gray-400" />
                {showTooltip && (
                  <span className="absolute left-6 top-0 z-10 w-56 p-2 text-xs bg-gray-800 text-white rounded shadow-lg">
                    Password must be at least 8 characters, include a number, an uppercase letter, and a symbol.
                  </span>
                )}
              </span>
            </label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                className={`input pl-10 pr-10 ${errors.password ? 'border-red-400' : 'focus:border-primary-500'} transition`}
                placeholder="Enter your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {/* Password strength meter */}
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`h-2 w-24 rounded ${strengthColors[strength-1] || 'bg-red-400'} transition-all`}></div>
                <span className={`text-xs font-medium ${strengthColors[strength-1] || 'text-red-400'}`}>{strengthLabels[strength-1] || 'Weak'}</span>
              </div>
            )}
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                type="password"
                className={`input pl-10 ${errors.confirm_password ? 'border-red-400' : 'focus:border-primary-500'} transition`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary flex items-center justify-center text-base font-semibold py-2.5 mt-2 shadow-sm hover:shadow-md transition"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
