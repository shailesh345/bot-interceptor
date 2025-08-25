import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  header, 
  footer, 
  hover = true, 
  animation = 'fade-in-up',
  delay = 0,
  ...props 
}) => {
  const animationVariants = {
    'fade-in-up': {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, delay }
    },
    'fade-in': {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3, delay }
    },
    'scale-in': {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.2, delay }
    }
  }

  return (
    <motion.div
      className={`card ${hover ? 'hover:shadow-medium hover:-translate-y-1' : ''} ${className}`}
      variants={animationVariants[animation]}
      initial="initial"
      animate="animate"
      whileHover={hover ? { scale: 1.02 } : {}}
      {...props}
    >
      {header && (
        <div className="card-header">
          {typeof header === 'string' ? (
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {header}
            </h3>
          ) : (
            header
          )}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </motion.div>
  )
}

export default Card

