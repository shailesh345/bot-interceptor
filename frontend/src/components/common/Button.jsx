import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '', 
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'text-white shadow-sm hover:shadow-md',
    secondary: 'border-2 shadow-sm hover:shadow-md',
    outline: 'border-2 bg-transparent shadow-sm hover:shadow-md',
    ghost: 'bg-transparent shadow-sm hover:shadow-md',
    danger: 'text-white shadow-sm hover:shadow-md',
    success: 'text-white shadow-sm hover:shadow-md',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--text-primary)',
          color: 'var(--primary-bg)',
          borderColor: 'var(--text-primary)',
        }
      case 'secondary':
        return {
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-primary)',
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-primary)',
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
        }
      case 'danger':
        return {
          backgroundColor: '#ef4444',
          color: 'white',
          borderColor: '#ef4444',
        }
      case 'success':
        return {
          backgroundColor: '#10b981',
          color: 'white',
          borderColor: '#10b981',
        }
      default:
        return {}
    }
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={getVariantStyles()}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </motion.button>
  )
}

export default Button

