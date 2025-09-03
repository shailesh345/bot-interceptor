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
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-black',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
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
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--text-secondary)',
        }
      case 'primary':
        return {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
        }
      case 'success':
        return {
          backgroundColor: '#d1fae5',
          color: '#065f46',
        }
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
        }
      case 'danger':
        return {
          backgroundColor: '#fee2e2',
          color: '#991b1b',
        }
      case 'info':
        return {
          backgroundColor: '#cffafe',
          color: '#0e7490',
        }
      case 'secondary':
        return {
          backgroundColor: '#f3e8ff',
          color: '#7c3aed',
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

