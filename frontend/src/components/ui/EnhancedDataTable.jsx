import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  ArrowUpDown,
  Settings,
  X
} from 'lucide-react';

const EnhancedDataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  onRowClick,
  onSelectionChange,
  onExport,
  onRefresh,
  className = '',
  loading = false,
  emptyMessage = 'No data available',
  showPagination = true,
  showPageSize = true,
  showSearch = true,
  showFilters = true,
  showActions = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(pageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery && searchable) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          const value = row[col.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        filtered = filtered.filter(row => {
          const cellValue = row[key];
          if (cellValue == null) return false;
          return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key && sortable) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, filters, sortConfig, columns, searchable, sortable]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSizeState);
  const startIndex = (currentPage - 1) * pageSizeState;
  const endIndex = startIndex + pageSizeState;
  const currentData = processedData.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Handle row selection
  const handleRowSelection = useCallback((rowId, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  }, [selectedRows, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      const allIds = currentData.map(row => row.id || row[columns[0]?.key]);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(allIds);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  }, [currentData, columns, onSelectionChange]);

  // Handle row expansion
  const handleRowExpansion = useCallback((rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  }, [expandedRows]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Export data
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(processedData);
    } else {
      // Default export behavior
      const csvContent = [
        columns.map(col => col.label || col.key).join(','),
        ...processedData.map(row => 
          columns.map(col => {
            const value = row[col.key];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'table_data.csv';
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [processedData, columns, onExport]);

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // Render cell value
  const renderCellValue = (row, column) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (value == null) {
      return <span className="text-gray-400">-</span>;
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    if (column.type === 'datetime') {
      return new Date(value).toLocaleString();
    }
    
    if (column.type === 'boolean') {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    
    if (column.type === 'status') {
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        suspended: 'bg-gray-100 text-gray-800'
      };
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[value] || statusColors.inactive}`}>
          {value}
        </span>
      );
    }
    
    return String(value);
  };

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header with search, filters, and actions */}
      <div className="p-4 border-b-2 border-gray-200 bg-gray-50 rounded-t-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Data Table</h3>
          
          <div className="flex items-center space-x-2">
            {showActions && (
              <>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                )}
                
                <button
                  onClick={handleExport}
                  className="p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-lg transition-all duration-200"
                  title="Export"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    showFiltersPanel ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-black hover:bg-gray-200'
                  }`}
                  title="Filters"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search and filters row */}
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-all duration-200"
              />
            </div>
          )}
          
          {showPageSize && (
            <select
              value={pageSizeState}
              onChange={(e) => {
                setPageSizeState(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-all duration-200"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          )}
          
          <div className="text-sm text-gray-600">
            {processedData.length} of {data.length} records
          </div>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t-2 border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Filters</h4>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  Clear all
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {columns.filter(col => col.filterable !== false).map(column => (
                  <div key={column.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {column.label || column.key}
                    </label>
                    <input
                      type="text"
                      placeholder={`Filter ${column.label || column.key}...`}
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === currentData.length && currentData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
              )}
              
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label || column.key}</span>
                    {sortable && column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              
              {showActions && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y-2 divide-gray-100">
            <AnimatePresence>
              {currentData.map((row, index) => (
                <motion.tr
                  key={row.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`hover:bg-gray-50 transition-all duration-200 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${expandedRows.has(row.id || index) ? 'bg-blue-50' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id || index)}
                        onChange={(e) => handleRowSelection(row.id || index, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {columns.map(column => (
                    <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                      {renderCellValue(row, column)}
                    </td>
                  ))}
                  
                  {showActions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowExpansion(row.id || index);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          title="Expand"
                        >
                          {expandedRows.has(row.id || index) ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {currentData.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-2">No data found</p>
          <p className="text-sm">{emptyMessage}</p>
          {searchQuery || Object.values(filters).some(v => v) && (
            <button
              onClick={clearFilters}
              className="mt-3 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t-2 border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, processedData.length)} of {processedData.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                if (totalPages <= 5 || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:text-black hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDataTable;
