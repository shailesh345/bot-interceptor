import React from 'react'
import { motion } from 'framer-motion'

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200'
  
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    secondary: 'bg-gray-200 text-gray-700',
    destructive: 'bg-error-500 text-white',
    outline: 'border border-gray-300 text-gray-700',
    success: 'bg-success-500 text-white',
    warning: 'bg-warning-500 text-white',
    info: 'bg-info-500 text-white'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: '#f7fafc',
          color: '#4a5568',
        }
      case 'primary':
        return {
          backgroundColor: '#4a5568',
          color: '#ffffff',
        }
      case 'success':
        return {
          backgroundColor: '#38a169',
          color: '#ffffff',
        }
      case 'warning':
        return {
          backgroundColor: '#d69e2e',
          color: '#ffffff',
        }
      case 'danger':
        return {
          backgroundColor: '#e53e3e',
          color: '#ffffff',
        }
      case 'info':
        return {
          backgroundColor: '#3182ce',
          color: '#ffffff',
        }
      case 'secondary':
        return {
          backgroundColor: '#e2e8f0',
          color: '#4a5568',
        }
      default:
        return {}
    }
  }

  return (
    <motion.span
      className={`${baseClasses} ${variants[variant]} ${sizeClasses[size]} ${className}`}
      style={getVariantStyles()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </motion.span>
  )
}

export default Badge

