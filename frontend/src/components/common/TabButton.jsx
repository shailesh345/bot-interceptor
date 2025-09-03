import React from 'react'
import { motion } from 'framer-motion'

const TabButton = ({ 
  isActive = false, 
  icon: Icon, 
  children, 
  onClick, 
  className = '',
  disabled = false,
  showIndicator = true,
  variant = 'enhanced', // 'enhanced', 'underline', 'minimal'
  size = 'md', // 'sm', 'md', 'lg'
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (variant === 'underline') {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          flex items-center border-b-2 font-medium transition-all duration-300
          ${sizeClasses[size]}
          ${isActive 
            ? 'border-black text-black' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        whileHover={!disabled ? { y: -1 } : {}}
        whileTap={!disabled ? { y: 0 } : {}}
        {...props}
      >
        {Icon && (
          <motion.div
            whileHover={!disabled ? { scale: 1.05 } : {}}
          >
            <Icon className={`${iconSizes[size]} mr-2 transition-colors duration-300`} />
          </motion.div>
        )}
        <span>{children}</span>
      </motion.button>
    )
  }

  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative flex items-center font-medium rounded-lg transition-all duration-300
          ${sizeClasses[size]}
          ${isActive 
            ? 'bg-gray-100 text-black' 
            : 'text-black hover:text-black hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        {...props}
      >
        {Icon && (
          <motion.div
            whileHover={!disabled ? { scale: 1.05 } : {}}
          >
            <Icon className={`${iconSizes[size]} mr-2 transition-colors duration-300`} />
          </motion.div>
        )}
        <span>{children}</span>
      </motion.button>
    )
  }

  // Enhanced variant (default)
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex items-center font-medium rounded-lg 
        transition-all duration-300 overflow-hidden border
        ${sizeClasses[size]}
        ${isActive 
          ? 'bg-black text-white shadow-lg border-gray-800' 
          : 'text-gray-600 hover:text-black hover:bg-gray-50 border-transparent hover:border-gray-200'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Active State Ripple Effect */}
      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black"
        />
      )}
      
      {/* White Circle Indicator */}
      {isActive && showIndicator && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
          className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-md"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-white rounded-full opacity-60"
          />
        </motion.div>
      )}
      
      {/* Icon */}
      {Icon && (
        <motion.div
          whileHover={!disabled ? { scale: 1.05 } : {}}
          className="relative z-10"
        >
          <Icon className={`${iconSizes[size]} mr-2 transition-colors duration-300 ${
            isActive ? 'text-white' : ''
          }`} />
        </motion.div>
      )}
      
      {/* Text Content */}
      <motion.span
        className={`relative z-10 transition-all duration-300 ${
          isActive ? 'text-white font-semibold' : ''
        }`}
        whileHover={!disabled ? { x: 1 } : {}}
      >
        {children}
      </motion.span>
      
      {/* Hover ripple effect */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileHover={!disabled ? { scale: 1, opacity: 0.1 } : {}}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-lg"
      />
      
      {/* Active shimmer effect */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{ width: '200%' }}
          />
        </div>
      )}
    </motion.button>
  )
}

export default TabButton
