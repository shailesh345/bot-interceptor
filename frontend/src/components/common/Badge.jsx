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
    default: 'bg-gray-100 text-black',
    secondary: 'bg-gray-200 text-black',
    destructive: 'bg-gray-800 text-white',
    outline: 'border border-gray-300 text-black',
    success: 'bg-gray-700 text-white',
    warning: 'bg-gray-600 text-white',
    info: 'bg-gray-500 text-white'
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
          backgroundColor: '#f3f4f6',
          color: '#000000',
        }
      case 'primary':
        return {
          backgroundColor: '#000000',
          color: '#ffffff',
        }
      case 'success':
        return {
          backgroundColor: '#374151',
          color: '#ffffff',
        }
      case 'warning':
        return {
          backgroundColor: '#4b5563',
          color: '#ffffff',
        }
      case 'danger':
        return {
          backgroundColor: '#1f2937',
          color: '#ffffff',
        }
      case 'info':
        return {
          backgroundColor: '#6b7280',
          color: '#ffffff',
        }
      case 'secondary':
        return {
          backgroundColor: '#e5e7eb',
          color: '#000000',
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

