import React from 'react'

const Skeleton = ({ 
  type = 'text', 
  lines = 1, 
  className = '', 
  height,
  width,
  rounded = 'rounded',
  ...props 
}) => {
  const baseClasses = 'skeleton animate-pulse'
  
  const typeClasses = {
    text: 'h-4',
    title: 'h-6',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
    card: 'h-32',
    table: 'h-12',
    input: 'h-10',
    badge: 'h-6 w-16',
  }

  const getHeight = () => {
    if (height) return height
    return typeClasses[type] || typeClasses.text
  }

  if (type === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getHeight()} ${rounded}`}
            style={{ 
              width: index === lines - 1 ? '75%' : '100%',
              ...(width && { width })
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${getHeight()} ${rounded} ${className}`}
      style={{ width }}
      {...props}
    />
  )
}

export default Skeleton

