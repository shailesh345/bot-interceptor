import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Settings, 
  Minimize2, 
  Maximize2,
  MoreHorizontal,
  Eye,
  Download,
  Share2,
  Edit,
  Trash2,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  Lightbulb,
  Rocket,
  Sparkles
} from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'

const DashboardWidget = ({
  title,
  children,
  icon: Icon,
  variant = 'default',
  collapsible = false,
  expandable = false,
  onRefresh,
  onSettings,
  onEdit,
  onDelete,
  onShare,
  onDownload,
  className = '',
  headerActions = [],
  metrics = [],
  trend = null,
  status = null,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'No data available',
  emptyIcon: EmptyIcon = Activity
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const variantStyles = {
    default: { 
      backgroundColor: 'var(--primary-bg)', 
      borderColor: 'var(--border-primary)',
      headerBg: 'var(--accent-bg)'
    },
    accent: { 
      backgroundColor: 'var(--accent-bg)', 
      borderColor: 'var(--border-secondary)',
      headerBg: 'var(--primary-bg)'
    },
    highlight: { 
      backgroundColor: 'rgba(59, 130, 246, 0.05)', 
      borderColor: 'rgba(59, 130, 246, 0.2)',
      headerBg: 'rgba(59, 130, 246, 0.1)'
    },
    success: { 
      backgroundColor: 'rgba(16, 185, 129, 0.05)', 
      borderColor: 'rgba(16, 185, 129, 0.2)',
      headerBg: 'rgba(16, 185, 129, 0.1)'
    },
    warning: { 
      backgroundColor: 'rgba(245, 158, 11, 0.05)', 
      borderColor: 'rgba(245, 158, 11, 0.2)',
      headerBg: 'rgba(245, 158, 11, 0.1)'
    },
    danger: { 
      backgroundColor: 'rgba(239, 68, 68, 0.05)', 
      borderColor: 'rgba(239, 68, 68, 0.2)',
      headerBg: 'rgba(239, 68, 68, 0.1)'
    }
  }

  const currentStyle = variantStyles[variant]

  const getTrendIcon = (trend) => {
    if (!trend) return null
    
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getTrendColor = (trend) => {
    if (!trend) return 'var(--text-secondary)'
    
    if (trend > 0) return '#10b981'
    if (trend < 0) return '#ef4444'
    return 'var(--text-secondary)'
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'success':
      case 'online':
        return '#10b981'
      case 'pending':
      case 'warning':
      case 'maintenance':
        return '#f59e0b'
      case 'error':
      case 'failed':
      case 'offline':
        return '#ef4444'
      default:
        return 'var(--text-muted)'
    }
  }

  const renderMetrics = () => {
    if (!metrics || metrics.length === 0) return null

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <div className="flex items-center justify-center space-x-2 mb-2">
              {metric.icon && <metric.icon className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />}
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {metric.label}
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {metric.value}
            </div>
            {metric.change && (
              <div className="flex items-center justify-center space-x-1 mt-1">
                {getTrendIcon(metric.change)}
                <span 
                  className="text-xs font-medium"
                  style={{ color: getTrendColor(metric.change) }}
                >
                  {Math.abs(metric.change)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: 'var(--text-primary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Error loading data</p>
          <p className="text-sm">{error}</p>
        </div>
      )
    }

    if (empty) {
      return (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <EmptyIcon className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      )
    }

    return children
  }

  return (
    <>
      <Card 
        className={`transition-all duration-200 ${className}`}
        style={currentStyle}
        animation="fade-in-up"
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 rounded-t-lg"
          style={{ backgroundColor: currentStyle.headerBg }}
        >
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-bg)' }}>
                <Icon className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
              
              {trend && (
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(trend)}
                  <span 
                    className="text-xs font-medium"
                    style={{ color: getTrendColor(trend) }}
                  >
                    {trend > 0 ? '+' : ''}{trend}% from last period
                  </span>
                </div>
              )}
            </div>
            
            {status && (
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {status}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Custom Header Actions */}
            {headerActions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant="ghost"
                icon={action.icon}
                onClick={action.onClick}
                title={action.title}
                disabled={action.disabled}
              />
            ))}
            
            {/* Built-in Actions */}
            {onRefresh && (
              <Button
                size="sm"
                variant="ghost"
                icon={RotateCcw}
                onClick={onRefresh}
                title="Refresh"
                disabled={loading}
              />
            )}
            
            {onSettings && (
              <Button
                size="sm"
                variant="ghost"
                icon={Settings}
                onClick={onSettings}
                title="Settings"
              />
            )}
            
            {/* More Actions Menu */}
            {(onEdit || onDelete || onShare || onDownload) && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={MoreHorizontal}
                  onClick={() => setShowMenu(!showMenu)}
                  title="More actions"
                />
                
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-10"
                      style={{ 
                        backgroundColor: 'var(--primary-bg)',
                        borderColor: 'var(--border-primary)'
                      }}
                    >
                      <div className="py-1">
                        {onEdit && (
                          <button
                            onClick={() => {
                              onEdit()
                              setShowMenu(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-opacity-50 transition-colors flex items-center space-x-2"
                            style={{ 
                              color: 'var(--text-primary)',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                        )}
                        
                        {onShare && (
                          <button
                            onClick={() => {
                              onShare()
                              setShowMenu(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-opacity-50 transition-colors flex items-center space-x-2"
                            style={{ 
                              color: 'var(--text-primary)',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                        )}
                        
                        {onDownload && (
                          <button
                            onClick={() => {
                              onDownload()
                              setShowMenu(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-opacity-50 transition-colors flex items-center space-x-2"
                            style={{ 
                              color: 'var(--text-primary)',
                              backgroundColor: 'transparent'
                            }}
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        )}
                        
                        {onDelete && (
                          <button
                            onClick={() => {
                              onDelete()
                              setShowMenu(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-opacity-50 transition-colors flex items-center space-x-2 text-red-600"
                            style={{ backgroundColor: 'transparent' }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {expandable && (
              <Button
                size="sm"
                variant="ghost"
                icon={isExpanded ? Minimize2 : Maximize2}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize' : 'Maximize'}
              />
            )}
            
            {collapsible && (
              <Button
                size="sm"
                variant="ghost"
                icon={isCollapsed ? ChevronDown : ChevronUp}
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? 'Expand' : 'Collapse'}
              />
            )}
          </div>
        </div>

        {/* Metrics */}
        {!isCollapsed && renderMetrics()}

        {/* Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4"
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full h-full max-w-7xl bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--primary-bg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Expanded Header */}
              <div 
                className="flex items-center justify-between p-6 border-b"
                style={{ 
                  backgroundColor: currentStyle.headerBg,
                  borderColor: 'var(--border-primary)'
                }}
              >
                <div className="flex items-center space-x-3">
                  {Icon && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--primary-bg)' }}>
                      <Icon className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {title}
                  </h2>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Minimize2}
                  onClick={() => setIsExpanded(false)}
                  title="Minimize"
                />
              </div>

              {/* Expanded Content */}
              <div className="p-6 h-full overflow-auto">
                {renderContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default DashboardWidget
