import React from 'react'

const LoadingSpinner = ({ size = 'md', color = 'primary', text = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3" data-testid="loading-spinner">
      <div className="relative">
        <div
          className={`animate-spin rounded-full border-2 ${sizeClasses[size]} border-transparent`}
          style={{
            borderTopColor: 'var(--text-primary)',
            borderRightColor: 'var(--text-secondary)',
            borderBottomColor: 'var(--text-muted)',
            borderLeftColor: 'var(--border-primary)',
          }}
        />
        <div
          className={`absolute inset-0 rounded-full ${sizeClasses[size]} animate-ping opacity-20`}
          style={{ backgroundColor: 'var(--text-primary)' }}
        />
      </div>
      {text && (
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner
