import React from 'react'

const Progress = ({ 
  value = 0, 
  max = 100, 
  className = '', 
  showLabel = false,
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className={`w-full ${className}`} {...props}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-black h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-600 mt-1 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

export { Progress }
