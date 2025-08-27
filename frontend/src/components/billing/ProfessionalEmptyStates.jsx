import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Receipt, 
  Search, 
  Plus, 
  AlertCircle,
  Wifi,
  Database,
  Lock,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Shield,
  Calendar,
  Settings
} from 'lucide-react';

const ProfessionalEmptyState = ({
  type = 'default',
  title,
  description,
  icon: CustomIcon,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  illustration = true,
  className = ''
}) => {
  const presets = {
    default: {
      icon: FileText,
      title: 'No data available',
      description: 'There are no items to display at this time.',
      color: 'gray'
    },
    billing: {
      icon: CreditCard,
      title: 'No billing information',
      description: 'Your billing information will appear here once you add a payment method.',
      actionText: 'Add Payment Method',
      color: 'blue'
    },
    invoices: {
      icon: Receipt,
      title: 'No invoices found',
      description: 'Your billing history will appear here after your first payment.',
      color: 'purple'
    },
    search: {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search criteria or filters to find what you\'re looking for.',
      color: 'gray'
    },
    subscriptions: {
      icon: Users,
      title: 'No active subscriptions',
      description: 'Start by choosing a subscription plan that fits your needs.',
      actionText: 'View Plans',
      color: 'green'
    },
    revenue: {
      icon: DollarSign,
      title: 'No revenue data',
      description: 'Revenue analytics will appear here once you start receiving payments.',
      color: 'green'
    },
    analytics: {
      icon: TrendingUp,
      title: 'No analytics data',
      description: 'Analytics and insights will be available once you have sufficient data.',
      color: 'blue'
    },
    security: {
      icon: Shield,
      title: 'No security events',
      description: 'All systems are secure. Security events and alerts will appear here.',
      color: 'red'
    },
    error: {
      icon: AlertCircle,
      title: 'Something went wrong',
      description: 'We encountered an error while loading your data. Please try again.',
      actionText: 'Retry',
      color: 'red'
    },
    offline: {
      icon: Wifi,
      title: 'You\'re offline',
      description: 'Please check your internet connection and try again.',
      actionText: 'Retry',
      color: 'orange'
    },
    unauthorized: {
      icon: Lock,
      title: 'Access denied',
      description: 'You don\'t have permission to view this content.',
      color: 'red'
    },
    maintenance: {
      icon: Settings,
      title: 'Under maintenance',
      description: 'This feature is temporarily unavailable while we perform maintenance.',
      color: 'yellow'
    }
  };

  const preset = presets[type] || presets.default;
  const Icon = CustomIcon || preset.icon;
  const finalTitle = title || preset.title;
  const finalDescription = description || preset.description;
  const finalActionText = actionText || preset.actionText;
  
  const colorVariants = {
    gray: {
      bg: 'bg-gray-100',
      icon: 'text-gray-400',
      title: 'text-gray-900',
      description: 'text-gray-500',
      button: 'bg-gray-600 hover:bg-gray-700 text-white',
      secondaryButton: 'border-gray-300 text-gray-700 hover:bg-gray-50'
    },
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-400',
      title: 'text-gray-900',
      description: 'text-gray-500',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondaryButton: 'border-blue-300 text-blue-700 hover:bg-blue-50'
    },
    green: {
      bg: 'bg-green-100',
      icon: 'text-green-400',
      title: 'text-gray-900',
      description: 'text-gray-500',
      button: 'bg-green-600 hover:bg-green-700 text-white',
      secondaryButton: 'border-green-300 text-green-700 hover:bg-green-50'
    },
    purple: {
      bg: 'bg-purple-100',
      icon: 'text-purple-400',
      title: 'text-gray-900',
      description: 'text-gray-500',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
      secondaryButton: 'border-purple-300 text-purple-700 hover:bg-purple-50'
    },
    red: {
      bg: 'bg-red-100',
      icon: 'text-red-400',
      title: 'text-gray-900',
      description: 'text-gray-500',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      secondaryButton: 'border-red-300 text-red-700 hover:bg-red-50'
    },
    orange: {
      bg: 'bg-orange-100',
      icon: 'text-orange-400',
      title: 'text-gray-900',
      description: 'text-gray-500',
      button: 'bg-orange-600 hover:bg-orange-700 text-white',
      secondaryButton: 'border-orange-300 text-orange-700 hover:bg-orange-50'
    },
    yellow: {
      bg: 'bg-yellow-100',
      icon: 'text-yellow-400',
      title: 'text-gray-900',
      description: 'text-gray-500',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      secondaryButton: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
    }
  };

  const colors = colorVariants[preset.color] || colorVariants.gray;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`text-center py-12 px-6 ${className}`}
    >
      {/* Illustration Background */}
      {illustration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-8"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 ${colors.bg} rounded-full opacity-20`}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 ${colors.bg} rounded-full opacity-40`}></div>
          </div>
          
          {/* Icon */}
          <motion.div
            variants={iconVariants}
            className={`relative flex items-center justify-center w-16 h-16 ${colors.bg} rounded-full mx-auto`}
          >
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </motion.div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div variants={itemVariants} className="max-w-md mx-auto">
        <h3 className={`text-lg font-semibold ${colors.title} mb-2`}>
          {finalTitle}
        </h3>
        <p className={`text-sm ${colors.description} mb-6 leading-relaxed`}>
          {finalDescription}
        </p>
      </motion.div>

      {/* Actions */}
      {(finalActionText || secondaryActionText) && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          {finalActionText && (
            <motion.button
              onClick={onAction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${colors.button} flex items-center space-x-2`}
            >
              <Plus className="w-4 h-4" />
              <span>{finalActionText}</span>
            </motion.button>
          )}
          
          {secondaryActionText && (
            <motion.button
              onClick={onSecondaryAction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 border rounded-lg font-medium transition-colors ${colors.secondaryButton}`}
            >
              {secondaryActionText}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Loading dots animation for certain states */}
      {(type === 'error' || type === 'offline') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center space-x-1 mt-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 ${colors.bg} rounded-full`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

// Specialized empty state components
export const BillingEmptyState = (props) => (
  <ProfessionalEmptyState type="billing" {...props} />
);

export const InvoicesEmptyState = (props) => (
  <ProfessionalEmptyState type="invoices" {...props} />
);

export const SearchEmptyState = (props) => (
  <ProfessionalEmptyState type="search" {...props} />
);

export const SubscriptionsEmptyState = (props) => (
  <ProfessionalEmptyState type="subscriptions" {...props} />
);

export const RevenueEmptyState = (props) => (
  <ProfessionalEmptyState type="revenue" {...props} />
);

export const AnalyticsEmptyState = (props) => (
  <ProfessionalEmptyState type="analytics" {...props} />
);

export const ErrorEmptyState = (props) => (
  <ProfessionalEmptyState type="error" {...props} />
);

export const OfflineEmptyState = (props) => (
  <ProfessionalEmptyState type="offline" {...props} />
);

export default ProfessionalEmptyState;
