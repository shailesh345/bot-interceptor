import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Plus,
  X,
  Check,
  AlertCircle,
  Info,
  Star,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building,
  CreditCard,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
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
import LoadingSpinner from '../common/LoadingSpinner'

// Advanced Data Table Component
export const AdvancedDataTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  onSelectionChange,
  onSort,
  onFilter,
  className = '',
  emptyMessage = 'No data available',
  actions = []
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filters, setFilters] = useState({})
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const filteredData = useCallback(() => {
    let result = [...data]

    // Apply search
    if (searchQuery) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        result = result.filter(row => {
          if (typeof value === 'string') {
            return String(row[key]).toLowerCase().includes(value.toLowerCase())
          }
          if (typeof value === 'object' && value.min !== undefined) {
            return row[key] >= value.min && row[key] <= (value.max || Infinity)
          }
          return row[key] === value
        })
      }
    })

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchQuery, filters, sortConfig])

  const paginatedData = useCallback(() => {
    const filtered = filteredData()
    if (!pagination) return filtered
    
    const startIndex = (currentPage - 1) * pageSize
    return filtered.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(filteredData().length / pageSize)

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    onSort?.({ key, direction: sortConfig.direction })
  }

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
    onFilter?.({ key, value })
  }

  const handleRowSelect = (rowId) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId)
    } else {
      newSelection.add(rowId)
    }
    setSelectedRows(newSelection)
    onSelectionChange?.(Array.from(newSelection))
  }

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData().length) {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    } else {
      const allIds = paginatedData().map(row => row.id)
      setSelectedRows(new Set(allIds))
      onSelectionChange?.(allIds)
    }
  }

  const toggleRowExpansion = (rowId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row, column.key)
    }

    const value = row[column.key]
    
    switch (column.type) {
      case 'badge':
        return <Badge variant={column.badgeVariant || 'default'}>{value}</Badge>
      case 'status':
        return (
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(value)}`} />
            <span className="text-sm">{value}</span>
          </div>
        )
      case 'date':
        return <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      case 'currency':
        return <span className="font-mono">${parseFloat(value).toFixed(2)}</span>
      case 'percentage':
        return <span className="font-mono">{parseFloat(value).toFixed(1)}%</span>
      case 'number':
        return <span className="font-mono">{value.toLocaleString()}</span>
      default:
        return <span>{value}</span>
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'success':
      case 'completed':
        return 'bg-green-500'
      case 'pending':
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
      case 'failed':
      case 'inactive':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading data..." />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                style={{ 
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--primary-bg)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          )}
          
          {filterable && (
            <Button
              variant="secondary"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <span>Filters</span>
              {Object.keys(filters).filter(key => filters[key]).length > 0 && (
                <Badge variant="primary" size="sm">
                  {Object.keys(filters).filter(key => filters[key]).length}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {selectable && selectedRows.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {selectedRows.size} selected
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedRows(new Set())}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-lg border"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {columns
                .filter(col => col.filterable !== false)
                .map(column => (
                  <div key={column.key} className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {column.label}
                    </label>
                    {column.filterType === 'select' ? (
                      <select
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          borderColor: 'var(--border-primary)',
                          backgroundColor: 'var(--primary-bg)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="">All</option>
                        {column.filterOptions?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={`Filter ${column.label}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          borderColor: 'var(--border-primary)',
                          backgroundColor: 'var(--primary-bg)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: 'var(--accent-bg)' }}>
              {selectable && (
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData().length && paginatedData().length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`p-3 text-left font-medium text-sm ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-opacity-80' : ''
                  }`}
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`h-3 w-3 ${
                            sortConfig.key === column.key && sortConfig.direction === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                        <ChevronDown 
                          className={`h-3 w-3 ${
                            sortConfig.key === column.key && sortConfig.direction === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="p-3 text-left font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData().map((row, index) => (
              <React.Fragment key={row.id || index}>
                <tr
                  className={`border-b transition-all duration-200 hover:bg-opacity-50 ${
                    selectedRows.has(row.id) ? 'bg-blue-50' : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                  style={{ 
                    borderColor: 'var(--border-secondary)',
                    backgroundColor: selectedRows.has(row.id) ? 'rgba(59, 130, 246, 0.1)' : 'var(--primary-bg)'
                  }}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.key} className="p-3">
                      {renderCell(row, column)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            size="sm"
                            variant="ghost"
                            icon={action.icon}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(row)
                            }}
                            title={action.title}
                          />
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
                {expandedRows.has(row.id) && row.expandableContent && (
                  <tr>
                    <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                      <div className="p-4" style={{ backgroundColor: 'var(--accent-bg)' }}>
                        {row.expandableContent}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {paginatedData().length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <Info className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">{emptyMessage}</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData().length)} of {filteredData().length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              if (totalPages <= 5 || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? 'primary' : 'ghost'}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>
              }
              return null
            })}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Advanced Modal Component
export const AdvancedModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  footer,
  className = ''
}) => {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={closeOnOverlayClick ? onClose : undefined}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-2xl overflow-hidden ${className}`}
          style={{ backgroundColor: 'var(--primary-bg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h2>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={onClose}
                className="p-2"
              />
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Interactive Dashboard Widget
export const DashboardWidget = ({
  title,
  children,
  icon: Icon,
  variant = 'default',
  collapsible = false,
  expandable = false,
  onRefresh,
  onSettings,
  className = '',
  headerActions = []
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const variantStyles = {
    default: { backgroundColor: 'var(--primary-bg)', borderColor: 'var(--border-primary)' },
    accent: { backgroundColor: 'var(--accent-bg)', borderColor: 'var(--border-secondary)' },
    highlight: { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }
  }

  const currentStyle = variantStyles[variant]

  return (
    <Card 
      className={`transition-all duration-200 ${className}`}
      style={currentStyle}
      animation="fade-in-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <Icon className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
            </div>
          )}
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {headerActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              icon={action.icon}
              onClick={action.onClick}
              title={action.title}
            />
          ))}
          
          {onRefresh && (
            <Button
              size="sm"
              variant="ghost"
              icon={RotateCcw}
              onClick={onRefresh}
              title="Refresh"
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

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`${isExpanded ? 'fixed inset-4 z-50 bg-white rounded-lg shadow-2xl overflow-auto' : ''}`}
            style={isExpanded ? { backgroundColor: 'var(--primary-bg)' } : {}}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// Advanced Form Component
export const AdvancedForm = ({
  fields = [],
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  initialValues = {},
  validation = {},
  className = ''
}) => {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate field on blur
    if (validation[field]) {
      const error = validation[field](formData[field], formData)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors = {}
    Object.keys(validation).forEach(field => {
      const error = validation[field](formData[field], formData)
      if (error) {
        newErrors[field] = error
      }
    })
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    } else {
      setErrors(newErrors)
      setTouched(Object.keys(validation).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    }
  }

  const renderField = (field) => {
    const { name, label, type, placeholder, options, required, ...props } = field
    const hasError = touched[name] && errors[name]
    
    const baseClasses = "w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
    const errorClasses = hasError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
    const inputClasses = `${baseClasses} ${errorClasses}`

    switch (type) {
      case 'select':
        return (
          <select
            value={formData[name] || ''}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
            className={inputClasses}
            style={{ 
              borderColor: hasError ? '#ef4444' : 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
            {...props}
          >
            <option value="">{placeholder || `Select ${label}...`}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'textarea':
        return (
          <textarea
            value={formData[name] || ''}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
            placeholder={placeholder}
            className={inputClasses}
            style={{ 
              borderColor: hasError ? '#ef4444' : 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
            {...props}
          />
        )
      
      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData[name] || false}
              onChange={(e) => handleChange(name, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          </label>
        )
      
      default:
        return (
          <input
            type={type}
            value={formData[name] || ''}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
            placeholder={placeholder}
            className={inputClasses}
            style={{ 
              borderColor: hasError ? '#ef4444' : 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
            {...props}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          {field.type !== 'checkbox' && (
            <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          {renderField(field)}
          
          {touched[field.name] && errors[field.name] && (
            <p className="text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}
      
      <div className="flex items-center justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  )
}

// Export all components
export default {
  AdvancedDataTable,
  AdvancedModal,
  DashboardWidget,
  AdvancedForm
}
