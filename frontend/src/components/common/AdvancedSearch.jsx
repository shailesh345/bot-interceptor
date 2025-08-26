import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  Clock,
  Tag,
  SortAsc,
  SortDesc,
  Save,
  Loader2
} from 'lucide-react'
import Button from './Button'
import Badge from './Badge'
import { DebouncedInput } from './PerformanceOptimizer'

const AdvancedSearch = ({
  onSearch,
  onFilterChange,
  onSortChange,
  filters = [],
  sortOptions = [],
  searchPlaceholder = 'Search...',
  showAdvancedFilters = true,
  showSortOptions = true,
  showSaveFilters = false,
  className = '',
  initialFilters = {},
  initialSort = null,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState(initialFilters)
  const [currentSort, setCurrentSort] = useState(initialSort)
  const [showFilters, setShowFilters] = useState(false)
  const [savedFilters, setSavedFilters] = useState([])
  const [filterName, setFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  
  const searchTimeoutRef = useRef(null)
  const filterTimeoutRef = useRef(null)

  useEffect(() => {
    // Debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch()
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  useEffect(() => {
    // Debounced filter changes
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current)
    }
    
    filterTimeoutRef.current = setTimeout(() => {
      handleFilterChange()
    }, 200)

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current)
      }
    }
  }, [activeFilters])

  useEffect(() => {
    // Load saved filters from localStorage
    const saved = localStorage.getItem('savedFilters')
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved))
      } catch (error) {
        // console.error('Failed to parse saved filters:', error) // Commented to prevent console errors
      }
    }
  }, [])

  const handleSearch = () => {
    onSearch?.(searchQuery, activeFilters, currentSort)
  }

  const handleFilterChange = () => {
    onFilterChange?.(activeFilters)
  }

  const handleSortChange = (sortOption) => {
    setCurrentSort(sortOption)
    onSortChange?.(sortOption)
  }

  const updateFilter = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
  }

  const removeFilter = (filterKey) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[filterKey]
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchQuery('')
    setCurrentSort(null)
  }

  const saveCurrentFilters = () => {
    if (!filterName.trim()) return
    
    const newFilter = {
      id: Date.now(),
      name: filterName.trim(),
      filters: activeFilters,
      sort: currentSort,
      search: searchQuery,
      createdAt: new Date().toISOString()
    }
    
    const updatedFilters = [...savedFilters, newFilter]
    setSavedFilters(updatedFilters)
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters))
    
    setFilterName('')
    setShowSaveDialog(false)
  }

  const loadSavedFilter = (savedFilter) => {
    setActiveFilters(savedFilter.filters)
    setCurrentSort(savedFilter.sort)
    setSearchQuery(savedFilter.search)
  }

  const deleteSavedFilter = (filterId) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId)
    setSavedFilters(updatedFilters)
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters))
  }

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => 
      activeFilters[key] !== null && 
      activeFilters[key] !== undefined && 
      activeFilters[key] !== ''
    ).length
  }

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={activeFilters[filter.key] || ''}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="">{filter.placeholder || 'Select...'}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={activeFilters[filter.key] || ''}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          />
        )
      
      case 'range':
        return (
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={activeFilters[filter.key]?.min || ''}
              onChange={(e) => updateFilter(filter.key, { 
                ...activeFilters[filter.key], 
                min: e.target.value 
              })}
              className="flex-1 px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="number"
              placeholder="Max"
              value={activeFilters[filter.key]?.max || ''}
              onChange={(e) => updateFilter(filter.key, { 
                ...activeFilters[filter.key], 
                max: e.target.value 
              })}
              className="flex-1 px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={activeFilters[filter.key]?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = activeFilters[filter.key] || []
                    if (e.target.checked) {
                      updateFilter(filter.key, [...currentValues, option.value])
                    } else {
                      updateFilter(filter.key, currentValues.filter(v => v !== option.value))
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )
      
      default:
        return (
          <input
            type="text"
            placeholder={filter.placeholder || 'Enter value...'}
            value={activeFilters[filter.key] || ''}
            onChange={(e) => updateFilter(filter.key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          />
        )
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <DebouncedInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        
        {showAdvancedFilters && (
          <Button
            variant="secondary"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="primary" size="sm">
                {getActiveFilterCount()}
              </Badge>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
        
        {showSortOptions && sortOptions.length > 0 && (
          <div className="relative">
            <select
              value={currentSort?.value || ''}
              onChange={(e) => {
                const selected = sortOptions.find(opt => opt.value === e.target.value)
                handleSortChange(selected)
              }}
              className="px-4 py-2 rounded-lg border text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2"
              style={{ 
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">Sort by...</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {currentSort && (
              <button
                onClick={() => handleSortChange(null)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        {showSaveFilters && (
          <Button
            variant="ghost"
            icon={Save}
            onClick={() => setShowSaveDialog(true)}
            disabled={getActiveFilterCount() === 0}
          >
            Save
          </Button>
        )}
        
        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-2"
        >
          {Object.entries(activeFilters).map(([key, value]) => {
            if (value === null || value === undefined || value === '') return null
            
            const filter = filters.find(f => f.key === key)
            if (!filter) return null
            
            let displayValue = value
            if (filter.type === 'select') {
              const option = filter.options?.find(opt => opt.value === value)
              displayValue = option?.label || value
            } else if (filter.type === 'range') {
              displayValue = `${value.min || 0} - ${value.max || '∞'}`
            } else if (filter.type === 'checkbox' && Array.isArray(value)) {
              const labels = value.map(v => {
                const option = filter.options?.find(opt => opt.value === v)
                return option?.label || v
              })
              displayValue = labels.join(', ')
            }
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>{filter.label}: {displayValue}</span>
                <button
                  onClick={() => removeFilter(key)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </motion.div>
      )}

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg p-4"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--primary-bg)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map(filter => (
                <div key={filter.key} className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                  {filter.description && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {filter.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Saved Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(savedFilter => (
              <Badge
                key={savedFilter.id}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => loadSavedFilter(savedFilter)}
              >
                {savedFilter.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSavedFilter(savedFilter.id)
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Save Filter Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              style={{ backgroundColor: 'var(--primary-bg)' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Save Current Filters
              </h3>
              <input
                type="text"
                placeholder="Enter filter name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border mb-4 transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                style={{ 
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--primary-bg)',
                  color: 'var(--text-primary)'
                }}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={saveCurrentFilters}
                  disabled={!filterName.trim()}
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" style={{ color: 'var(--text-secondary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Searching...</span>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch
