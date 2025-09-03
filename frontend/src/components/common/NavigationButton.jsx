import React from 'react'
import { motion } from 'framer-motion'

const NavigationButton = ({ 
  isActive = false, 
  icon: Icon, 
  children, 
  onClick, 
  className = '',
  disabled = false,
  showIndicator = true,
  ...props 
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex items-center px-3 py-2 text-sm font-medium rounded-md 
        transition-all duration-300 overflow-hidden border
        ${isActive 
          ? 'bg-black text-white shadow-lg border-gray-800' 
          : 'text-black hover:text-black hover:bg-gray-50 border-transparent hover:border-gray-200'
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
          className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-md nav-circle-indicator"
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
          <Icon 
            className={`w-4 h-4 mr-3 transition-colors duration-300 ${
              isActive ? 'text-white' : ''
            }`} 
          />
        </motion.div>
      )}
      
      {/* Text Content */}
      <motion.span
        className={`relative z-10 transition-all duration-300 ${
          isActive ? 'text-white font-semibold' : ''
        }`}
        whileHover={!disabled ? { x: 2 } : {}}
      >
        {children}
      </motion.span>
      
      {/* Hover ripple effect */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileHover={!disabled ? { scale: 1, opacity: 0.1 } : {}}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-md"
      />
      
      {/* Active shimmer effect */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden rounded-md">
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

export default NavigationButton
