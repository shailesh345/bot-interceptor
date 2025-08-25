import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Info
} from 'lucide-react'
import Button from '../common/Button'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const AdvancedDataTable = ({
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
              <tr
                key={row.id || index}
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

export default AdvancedDataTable
