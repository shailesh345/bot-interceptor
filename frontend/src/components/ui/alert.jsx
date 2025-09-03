import React from 'react'

const Alert = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'px-4 py-3 rounded-md border'
  
  const variantClasses = {
    default: 'bg-gray-50 border-gray-200 text-black',
    destructive: 'bg-gray-100 border-gray-300 text-black',
    warning: 'bg-gray-50 border-gray-200 text-gray-800',
    success: 'bg-white border-gray-300 text-black'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

const AlertTitle = ({ children, className = '', ...props }) => {
  return (
    <h5 className={`font-medium mb-1 ${className}`} {...props}>
      {children}
    </h5>
  )
}

const AlertDescription = ({ children, className = '', ...props }) => {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  )
}

export { Alert, AlertTitle, AlertDescription }
