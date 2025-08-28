import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, Table, Columns, Eye, Edit, Trash2, Plus, 
  RefreshCw, Search, Filter, Download, Upload, 
  AlertTriangle, CheckCircle, XCircle, Info
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import Card from '../common/Card'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const DatabaseManager = () => {
  const [loading, setLoading] = useState(false)
  const [databaseInfo, setDatabaseInfo] = useState(null)
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [tableData, setTableData] = useState([])
  const [tableSchema, setTableSchema] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [healthStatus, setHealthStatus] = useState({})
  const [backupStatus, setBackupStatus] = useState('idle')

  useEffect(() => {
    loadDatabaseInfo()
    checkDatabaseHealth()
  }, [])

  const loadDatabaseInfo = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getSystemStats()
      setDatabaseInfo(response.data.database || {})
      setTables(response.data.tables || [])
    } catch (error) {
      console.error('Failed to load database info:', error)
      toast.error('Failed to load database information')
    } finally {
      setLoading(false)
    }
  }

  const checkDatabaseHealth = async () => {
    try {
      const response = await adminAPI.getSystemHealth()
      setHealthStatus(response.data.health || {})
    } catch (error) {
      console.error('Failed to check database health:', error)
    }
  }

  const loadTableData = async (tableName) => {
    setLoading(true)
    try {
      const response = await adminAPI.getTableData(tableName)
      setTableData(response.data.records || [])
      setTableSchema(response.data.schema || [])
      setSelectedTable(tableName)
    } catch (error) {
      console.error(`Failed to load table ${tableName}:`, error)
      toast.error(`Failed to load table ${tableName}`)
    } finally {
      setLoading(false)
    }
  }

  const exportTableData = async (tableName) => {
    try {
      const response = await adminAPI.exportTableData(tableName)
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${tableName}_export.json`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Table ${tableName} exported successfully`)
    } catch (error) {
      console.error(`Failed to export table ${tableName}:`, error)
      toast.error(`Failed to export table ${tableName}`)
    }
  }

  const backupDatabase = async () => {
    setBackupStatus('backing_up')
    try {
      await adminAPI.backupDatabase()
      setBackupStatus('completed')
      toast.success('Database backup completed successfully')
    } catch (error) {
      console.error('Backup failed:', error)
      setBackupStatus('failed')
      toast.error('Database backup failed')
    }
  }

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading && !databaseInfo) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Database Manager</h1>
            <p className="text-gray-600">Monitor and manage your database</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={loadDatabaseInfo}
            icon={RefreshCw}
            variant="outline"
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            onClick={backupDatabase}
            icon={Download}
            variant="primary"
            disabled={backupStatus === 'backing_up'}
          >
            {backupStatus === 'backing_up' ? 'Backing Up...' : 'Backup DB'}
          </Button>
        </div>
      </div>

      {/* Database Health Overview */}
      <Card header="Database Health Status">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getHealthIcon(healthStatus.connection)}
              <div>
                <h3 className="font-medium text-gray-900">Connection</h3>
                <p className={`text-sm ${getHealthColor(healthStatus.connection)}`}>
                  {healthStatus.connection || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getHealthIcon(healthStatus.performance)}
              <div>
                <h3 className="font-medium text-gray-900">Performance</h3>
                <p className={`text-sm ${getHealthColor(healthStatus.performance)}`}>
                  {healthStatus.performance || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getHealthIcon(healthStatus.integrity)}
              <div>
                <h3 className="font-medium text-gray-900">Data Integrity</h3>
                <p className={`text-sm ${getHealthColor(healthStatus.integrity)}`}>
                  {healthStatus.integrity || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Database Information */}
      <Card header="Database Information">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900">Database Type</h4>
            <p className="text-lg font-semibold text-blue-700">
              {databaseInfo?.type || 'SQLite'}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-900">Total Tables</h4>
            <p className="text-lg font-semibold text-green-700">
              {tables.length}
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-900">Total Records</h4>
            <p className="text-lg font-semibold text-purple-700">
              {databaseInfo?.totalRecords || 0}
            </p>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg">
            <h4 className="text-sm font-medium text-orange-900">Size</h4>
            <p className="text-lg font-semibold text-orange-700">
              {databaseInfo?.size || 'Unknown'}
            </p>
          </div>
        </div>
      </Card>

      {/* Tables List */}
      <Card header="Database Tables">
        <div className="space-y-4">
          {tables.map((table) => (
            <motion.div
              key={table.name}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Table className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{table.name}</h3>
                    <p className="text-sm text-gray-600">
                      {table.recordCount || 0} records • {table.columns || 0} columns
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => loadTableData(table.name)}
                    icon={Eye}
                    variant="outline"
                    size="sm"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => exportTableData(table.name)}
                    icon={Download}
                    variant="outline"
                    size="sm"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Table Data Viewer */}
      {selectedTable && (
        <Card header={`Table: ${selectedTable}`}>
          <div className="space-y-4">
            {/* Table Schema */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Schema</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Column
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nullable
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Default
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableSchema.map((column, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {column.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.nullable ? 'Yes' : 'No'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.default || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Data */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Preview</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {tableSchema.map((column, index) => (
                        <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {column.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {tableSchema.map((column, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[column.name] !== null && row[column.name] !== undefined 
                              ? String(row[column.name]).substring(0, 50)
                              : 'NULL'
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tableData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing first 10 records of {tableData.length} total records
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default DatabaseManager
