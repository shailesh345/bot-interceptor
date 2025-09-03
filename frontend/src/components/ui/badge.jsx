import React from 'react'

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  const variantClasses = {
    default: 'bg-gray-100 text-black',
    secondary: 'bg-gray-200 text-black',
    destructive: 'bg-gray-800 text-white',
    outline: 'border border-gray-300 text-black',
  }
  
  const sizeClasses = {
    default: 'px-2.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export { Badge }
