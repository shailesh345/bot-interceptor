import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  CheckCircle, 
  Circle, 
  Shield, 
  Activity, 
  Zap,
  Search,
  Filter
} from 'lucide-react'

const DomainSelector = ({ 
  domains = [], 
  selectedDomains = [], 
  onSelectionChange,
  showFilters = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [localSelectedDomains, setLocalSelectedDomains] = useState(selectedDomains)

  useEffect(() => {
    setLocalSelectedDomains(selectedDomains)
  }, [selectedDomains])

  // Filter domains based on search and status
  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.domain_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'verified' && (domain.status === 'verified' || domain.status === 'active' || domain.is_verified)) ||
      (statusFilter === 'pending' && domain.status === 'pending' && !domain.is_verified) ||
      (statusFilter === 'failed' && domain.status === 'failed')
    
    return matchesSearch && matchesStatus
  })

  const handleDomainToggle = (domain) => {
    // Debug: Log domain structure when toggling
    console.log('🔍 DomainSelector - Toggling domain:', domain)
    console.log('🔍 DomainSelector - Domain keys:', Object.keys(domain))
    console.log('🔍 DomainSelector - Domain ID fields:', {
      id: domain.id,
      domain_id: domain.domain_id,
      uuid: domain.uuid,
      ID: domain.ID,
      DOMAIN_ID: domain.DOMAIN_ID,
      UUID: domain.UUID
    })
    
    const isSelected = localSelectedDomains.some(d => d.id === domain.id)
    let newSelection
    
    if (isSelected) {
      newSelection = localSelectedDomains.filter(d => d.id !== domain.id)
    } else {
      newSelection = [...localSelectedDomains, domain]
    }
    
    setLocalSelectedDomains(newSelection)
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    const allSelected = filteredDomains.length === localSelectedDomains.filter(d => 
      filteredDomains.some(fd => fd.id === d.id)
    ).length
    
    if (allSelected) {
      // Deselect all filtered domains
      const newSelection = localSelectedDomains.filter(d => 
        !filteredDomains.some(fd => fd.id === d.id)
      )
      setLocalSelectedDomains(newSelection)
      onSelectionChange(newSelection)
    } else {
      // Select all filtered domains
      const newDomains = filteredDomains.filter(d => 
        !localSelectedDomains.some(ld => ld.id === d.id)
      )
      const newSelection = [...localSelectedDomains, ...newDomains]
      setLocalSelectedDomains(newSelection)
      onSelectionChange(newSelection)
    }
  }

  const getStatusBadge = (domain) => {
    if (domain.is_verified || domain.status === 'verified' || domain.status === 'active') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Verified
        </span>
      )
    } else if (domain.status === 'pending') {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          Pending
        </span>
      )
    } else if (domain.status === 'failed') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          Failed
        </span>
      )
    }
    return null
  }

  const isAllSelected = filteredDomains.length > 0 && 
    filteredDomains.every(d => localSelectedDomains.some(ld => ld.id === d.id))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Select Domains for Monitoring</h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose which domains you want to monitor. Only verified domains can be monitored.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {localSelectedDomains.length} of {domains.length} selected
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified Only</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Select All Button */}
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      )}

      {/* Domain List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredDomains.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No domains found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDomains.map((domain) => {
              const isSelected = localSelectedDomains.some(d => d.id === domain.id)
              const isVerified = domain.is_verified || domain.status === 'verified' || domain.status === 'active'
              
              return (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleDomainToggle(domain)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Selection Checkbox */}
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* Domain Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {domain.domain_name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(domain)}
                            {domain.ssl_enabled && (
                              <span className="inline-flex items-center px-2 py-1 bg-black text-white rounded-full text-xs font-medium">
                                <Shield className="h-3 w-3 mr-1" />
                                SSL
                              </span>
                            )}
                            {domain.traffic_enabled && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-700 text-white rounded-full text-xs font-medium">
                                <Activity className="h-3 w-3 mr-1" />
                                Monitor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Monitoring Status */}
                    <div className="flex-shrink-0 text-right">
                      {isVerified ? (
                        <span className="text-xs text-green-600 font-medium">
                          Ready for monitoring
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 font-medium">
                          Verification required
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {localSelectedDomains.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{localSelectedDomains.length}</span> domain(s) selected for monitoring
            </div>
            <div className="text-xs text-gray-500">
              Only verified domains will be actively monitored
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DomainSelector
