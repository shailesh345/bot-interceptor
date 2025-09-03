import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, User, Lock, LogIn, ArrowRight } from 'lucide-react'
import { loginUser, clearError } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [showPassword, setShowPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const watchedFields = watch()
  const hasContent = watchedFields.username && watchedFields.password

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data))
      if (result.type === 'auth/login/fulfilled') {
        // Clear any previous errors
        dispatch(clearError())
        
        // Navigate to dashboard with success feedback
        navigate('/dashboard', { 
          state: { 
            message: `Welcome back, ${result.payload.user.first_name || result.payload.user.username}!` 
          }
        })
      } else if (result.type === 'auth/login/rejected') {
        // Error is already handled in the Redux slice
        console.error('Login failed:', result.payload)
      }
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 animate-fade-in-up">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-black font-yandex tracking-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-neutral-600 font-yandex">
          Sign in to access your dashboard
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <div>
              <p className="text-sm text-black font-yandex font-medium">
                {error === 'Invalid credentials' 
                  ? 'Username or password is incorrect'
                  : error === 'Account is deactivated'
                  ? 'Your account has been deactivated. Please contact support.'
                  : error.includes('Network')
                  ? 'Unable to connect. Please check your internet connection.'
                  : error
                }
              </p>
              {error === 'Invalid credentials' && (
                <p className="text-xs text-neutral-600 mt-1">
                  Try the demo credentials below or check your login details.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Username Field */}
        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium text-black font-yandex">
            Username or Email
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 2,
                  message: 'Username must be at least 2 characters'
                }
              })}
              type="text"
              id="username"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-md text-sm font-yandex bg-white
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-black focus:border-black
                ${errors.username 
                  ? 'border-neutral-400 bg-neutral-50' 
                  : 'border-neutral-300 hover:border-neutral-400'
                }
                ${watchedFields.username ? 'border-black' : ''}
              `}
              placeholder="Enter your username or email"
              autoComplete="username"
              spellCheck="false"
            />
          </div>
          {errors.username && (
            <p className="text-xs text-neutral-600 font-yandex mt-1 animate-fade-in">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-black font-yandex">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className={`w-full pl-10 pr-12 py-2.5 border rounded-md text-sm font-yandex bg-white
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-black focus:border-black
                ${errors.password 
                  ? 'border-neutral-400 bg-neutral-50' 
                  : 'border-neutral-300 hover:border-neutral-400'
                }
                ${watchedFields.password ? 'border-black' : ''}
              `}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 
                hover:bg-neutral-100 rounded transition-colors duration-150"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-neutral-500" />
              ) : (
                <Eye className="w-4 h-4 text-neutral-500" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-neutral-600 font-yandex mt-1 animate-fade-in">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isValid}
          className={`w-full py-2.5 px-4 rounded-md text-sm font-medium font-yandex
            transition-all duration-200 ease-in-out
            flex items-center justify-center space-x-2
            ${loading || !hasContent
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : 'bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 hover:shadow-md'
            }
          `}
        >
          {loading ? (
            <LoadingSpinner size="sm" color="currentColor" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="space-y-3 text-center">
        <div className="text-sm">
          <Link
            to="/forgot-password"
            className="text-neutral-600 hover:text-black font-yandex font-medium
              transition-colors duration-150 underline decoration-neutral-300 hover:decoration-black"
          >
            Forgot your password?
          </Link>
        </div>
        
        <div className="text-sm text-neutral-600 font-yandex">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-black hover:text-neutral-700
              transition-colors duration-150 underline decoration-neutral-300 hover:decoration-black"
          >
            Create account
          </Link>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 text-center">
        <p className="text-xs text-neutral-600 font-yandex mb-2 font-medium">Demo Credentials</p>
        <div className="text-xs text-neutral-800 font-yandex space-y-1">
          <div><span className="font-medium">Username:</span> admin</div>
          <div><span className="font-medium">Password:</span> admin123</div>
        </div>
      </div>
    </div>
  )
}

export default Login
