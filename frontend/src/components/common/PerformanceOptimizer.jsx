import React, { Suspense, lazy, useState, useEffect } from 'react'
import LoadingSpinner from './LoadingSpinner'

// Lazy load components for better performance
const LazyComponent = ({ component: Component, fallback, ...props }) => {
  return (
    <Suspense fallback={fallback || <LoadingSpinner size="md" text="Loading..." />}>
      <Component {...props} />
    </Suspense>
  )
}

// Virtualized list component for large datasets
const VirtualizedList = ({ 
  items, 
  height = 400, 
  itemHeight = 60, 
  renderItem,
  className = '' 
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)

  const visibleItemCount = Math.ceil(height / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length)

  const visibleItems = items.slice(startIndex, endIndex)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop)
  }

  return (
    <div
      ref={setContainerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Debounced input component
const DebouncedInput = ({ 
  value, 
  onChange, 
  delay = 300, 
  placeholder = '', 
  className = '',
  ...props 
}) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, delay)

    return () => clearTimeout(timer)
  }, [localValue, onChange, delay])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className={`px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${className}`}
      style={{ 
        borderColor: 'var(--border-primary)',
        backgroundColor: 'var(--primary-bg)',
        color: 'var(--text-primary)'
      }}
      {...props}
    />
  )
}

// Image lazy loading component
const LazyImage = ({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  className = '',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageRef, setImageRef] = useState(null)

  useEffect(() => {
    let observer
    let didCancel = false

    if (imageRef && imageSrc === placeholder) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                !didCancel &&
                (entry.intersectionRatio > 0 || entry.isIntersecting)
              ) {
                setImageSrc(src)
                observer.unobserve(imageRef)
              }
            })
          },
          {
            threshold: 0.01,
            rootMargin: '75%',
          }
        )
        observer.observe(imageRef)
      } else {
        // Fallback for older browsers
        setImageSrc(src)
      }
    }
    return () => {
      didCancel = true
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef)
      }
    }
  }, [src, imageSrc, placeholder])

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${imageSrc === placeholder ? 'opacity-50' : 'opacity-100'} ${className}`}
      {...props}
    />
  )
}

// Memoized component wrapper
const MemoizedComponent = React.memo(({ children, ...props }) => {
  return React.cloneElement(children, props)
})

// Export all performance optimization components
export {
  LazyComponent,
  VirtualizedList,
  DebouncedInput,
  LazyImage,
  MemoizedComponent
}

