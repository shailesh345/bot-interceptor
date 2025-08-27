import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  Info
} from 'lucide-react';

const ProfessionalBillingCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  onClick,
  actionText,
  loading = false,
  gradient = true
}) => {
  const colorVariants = {
    blue: {
      bg: gradient ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-blue-50',
      icon: 'bg-blue-500 text-white',
      text: 'text-blue-900',
      subtitle: 'text-blue-700',
      border: 'border-blue-200',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    green: {
      bg: gradient ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-green-50',
      icon: 'bg-green-500 text-white',
      text: 'text-green-900',
      subtitle: 'text-green-700',
      border: 'border-green-200',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    purple: {
      bg: gradient ? 'bg-gradient-to-br from-purple-50 to-purple-100' : 'bg-purple-50',
      icon: 'bg-purple-500 text-white',
      text: 'text-purple-900',
      subtitle: 'text-purple-700',
      border: 'border-purple-200',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    orange: {
      bg: gradient ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-orange-50',
      icon: 'bg-orange-500 text-white',
      text: 'text-orange-900',
      subtitle: 'text-orange-700',
      border: 'border-orange-200',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    },
    white: {
      bg: 'bg-white',
      icon: 'bg-gray-100 text-gray-600',
      text: 'text-gray-900',
      subtitle: 'text-gray-600',
      border: 'border-gray-200',
      trend: {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
      }
    }
  };

  const colors = colorVariants[color];
  
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3" />;
      case 'down': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    whileHover: { 
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    whileTap: { 
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className={`${colors.bg} ${colors.border} border rounded-xl p-6 space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="animate-pulse bg-gray-300 h-4 w-24 rounded"></div>
            <div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-300 h-3 w-20 rounded"></div>
          </div>
          <div className="animate-pulse bg-gray-300 w-12 h-12 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      whileTap={onClick ? "whileTap" : undefined}
      className={`
        ${colors.bg} ${colors.border} 
        border rounded-xl p-6 cursor-pointer
        shadow-sm hover:shadow-md transition-shadow duration-200
        group relative overflow-hidden
      `}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white translate-y-12 -translate-x-12"></div>
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={`text-sm font-medium ${colors.subtitle}`}>{title}</h3>
              {actionText && (
                <ArrowUpRight className={`w-4 h-4 ${colors.subtitle} opacity-0 group-hover:opacity-100 transition-opacity`} />
              )}
            </div>
            
            <div className={`text-2xl font-bold ${colors.text} mb-1`}>
              {value}
            </div>
            
            {subtitle && (
              <p className={`text-sm ${colors.subtitle}`}>{subtitle}</p>
            )}
          </div>
          
          {Icon && (
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              className={`${colors.icon} rounded-lg p-3 shadow-sm`}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          )}
        </div>

        {/* Trend Indicator */}
        {trend && trendValue && (
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${colors.trend[trend]}`}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
            
            {actionText && (
              <span className={`text-xs font-medium ${colors.subtitle} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {actionText}
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        {actionText && !trend && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <span className={`text-sm font-medium ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity flex items-center`}>
              {actionText}
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfessionalBillingCard;
