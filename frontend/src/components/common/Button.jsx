import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  tooltip,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-lg
    transition-all duration-300 ease-out transform
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
    active:scale-95 hover:scale-105
    shadow-sm hover:shadow-lg
    border border-transparent
  `

  const variantClasses = {
    primary: `
      bg-black text-white hover:bg-gray-800
      focus:ring-black/20 focus:ring-offset-2
      border-black hover:border-gray-800
      hover:shadow-black/25
    `,
    secondary: `
      bg-gray-100 text-black hover:bg-gray-200
      focus:ring-gray-500/20 focus:ring-offset-2
      border-gray-300 hover:border-gray-400
      hover:shadow-gray/25
    `,
    outline: `
      bg-transparent text-black border-2 border-black hover:bg-black hover:text-white
      focus:ring-black/20 focus:ring-offset-2
      hover:shadow-black/25
    `,
    ghost: `
      bg-transparent text-gray-600 hover:bg-gray-100 hover:text-black
      focus:ring-gray-500/20 focus:ring-offset-2
      border-transparent hover:border-gray-300
    `,
    danger: `
      bg-red-600 text-white hover:bg-red-700
      focus:ring-red-500/20 focus:ring-offset-2
      border-red-600 hover:border-red-700
      hover:shadow-red/25
    `,
    success: `
      bg-green-600 text-white hover:bg-green-700
      focus:ring-green-500/20 focus:ring-offset-2
      border-green-600 hover:border-green-700
      hover:shadow-green/25
    `,
    warning: `
      bg-yellow-500 text-black hover:bg-yellow-600
      focus:ring-yellow-500/20 focus:ring-offset-2
      border-yellow-500 hover:border-yellow-600
      hover:shadow-yellow/25
    `,
    info: `
      bg-blue-500 text-white hover:bg-blue-600
      focus:ring-blue-500/20 focus:ring-offset-2
      border-blue-500 hover:border-blue-600
      hover:shadow-blue/25
    `
  }

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3',
  }

  const isDisabled = disabled || loading
  const fullWidthClass = fullWidth ? 'w-full' : ''
  const roundedClass = rounded ? 'rounded-full' : ''

  return (
    <motion.button
      type={type}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidthClass}
        ${roundedClass}
        ${className}
        relative overflow-hidden
        group
      `}
      onClick={onClick}
      disabled={isDisabled}
      title={tooltip}
      whileHover={!isDisabled ? {
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={!isDisabled ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      {...props}
    >
      {/* Ripple effect background */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-lg"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 4, opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />

      {/* Loading spinner */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="animate-spin" />
        </motion.div>
      )}

      {/* Left icon */}
      {Icon && iconPosition === 'left' && !loading && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="flex-shrink-0" />
        </motion.div>
      )}

      {/* Button content */}
      <motion.span
        className="relative z-10 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        {children}
      </motion.span>

      {/* Right icon */}
      {Icon && iconPosition === 'right' && !loading && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="flex-shrink-0" />
        </motion.div>
      )}

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </motion.button>
  )
}

export default Button

