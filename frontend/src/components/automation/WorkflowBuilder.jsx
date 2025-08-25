import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Save, 
  Download, 
  Upload,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  Zap,
  Target,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Star,
  Heart,
  Shield,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Video,
  FileText,
  Image,
  Video as VideoIcon,
  Music,
  Archive,
  Folder,
  File,
  Code,
  Terminal,
  Command,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Workflow,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  GripVertical,
  Layout,
  Layers,
  Palette,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Unlink,
  ExternalLink,
  Maximize2,
  Minimize2,

} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Badge from '../common/Badge'
import LoadingSpinner from '../common/LoadingSpinner'

const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([])
  const [currentWorkflow, setCurrentWorkflow] = useState(null)
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [draggedNode, setDraggedNode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showNodePalette, setShowNodePalette] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)

  // Mock workflow data
  const mockWorkflows = [
    {
      id: 1,
      name: 'Security Alert Response',
      description: 'Automated response to security incidents',
      status: 'active',
      createdAt: '2024-08-20',
      lastRun: '2024-08-25 14:30',
      runs: 45,
      successRate: 98.5,
      nodes: 8,
      connections: 7
    },
    {
      id: 2,
      name: 'Traffic Analysis Pipeline',
      description: 'Real-time traffic analysis and reporting',
      status: 'active',
      createdAt: '2024-08-18',
      lastRun: '2024-08-25 14:25',
      runs: 120,
      successRate: 99.2,
      nodes: 12,
      connections: 11
    },
    {
      id: 3,
      name: 'User Onboarding',
      description: 'Automated user registration and setup',
      status: 'draft',
      createdAt: '2024-08-22',
      lastRun: null,
      runs: 0,
      successRate: 0,
      nodes: 6,
      connections: 5
    }
  ]

  // Node types for the palette
  const nodeTypes = [
    {
      id: 'trigger',
      name: 'Trigger',
      description: 'Start workflow on event',
      icon: Zap,
      color: 'blue',
      category: 'triggers'
    },
    {
      id: 'condition',
      name: 'Condition',
      description: 'Check if condition is met',
      icon: Target,
      color: 'orange',
      category: 'logic'
    },
    {
      id: 'action',
      name: 'Action',
      description: 'Perform an action',
      icon: Play,
      color: 'green',
      category: 'actions'
    },
    {
      id: 'delay',
      name: 'Delay',
      description: 'Wait for specified time',
      icon: Clock,
      color: 'purple',
      category: 'timing'
    },
    {
      id: 'notification',
      name: 'Notification',
      description: 'Send notification',
      icon: Bell,
      color: 'yellow',
      category: 'communications'
    },
    {
      id: 'api-call',
      name: 'API Call',
      description: 'Make API request',
      icon: Code,
      color: 'indigo',
      category: 'integrations'
    },
    {
      id: 'data-transform',
      name: 'Data Transform',
      description: 'Transform data format',
      icon: Database,
      color: 'pink',
      category: 'data'
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Send email',
      icon: Mail,
      color: 'red',
      category: 'communications'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send Slack message',
      icon: MessageSquare,
      color: 'purple',
      category: 'integrations'
    },
    {
      id: 'webhook',
      name: 'Webhook',
      description: 'Trigger webhook',
      icon: Link,
      color: 'gray',
      category: 'integrations'
    }
  ]

  // Mock nodes for current workflow
  const mockNodes = [
    {
      id: 1,
      type: 'trigger',
      name: 'Security Alert',
      position: { x: 100, y: 100 },
      data: {
        event: 'security_alert',
        severity: 'high',
        source: 'ids'
      },
      status: 'active'
    },
    {
      id: 2,
      type: 'condition',
      name: 'Check Severity',
      position: { x: 300, y: 100 },
      data: {
        condition: 'severity == "high"',
        operator: 'equals'
      },
      status: 'active'
    },
    {
      id: 3,
      type: 'action',
      name: 'Block IP',
      position: { x: 500, y: 50 },
      data: {
        action: 'block_ip',
        duration: '1h',
        reason: 'Security threat'
      },
      status: 'active'
    },
    {
      id: 4,
      type: 'notification',
      name: 'Alert Team',
      position: { x: 500, y: 150 },
      data: {
        channel: 'slack',
        message: 'High severity security alert detected',
        recipients: ['security-team']
      },
      status: 'active'
    },
    {
      id: 5,
      type: 'api-call',
      name: 'Log Incident',
      position: { x: 700, y: 100 },
      data: {
        endpoint: '/api/incidents',
        method: 'POST',
        payload: 'incident_data'
      },
      status: 'active'
    }
  ]

  // Mock connections between nodes
  const mockConnections = [
    { id: 1, from: 1, to: 2, type: 'success' },
    { id: 2, from: 2, to: 3, type: 'true' },
    { id: 3, from: 2, to: 4, type: 'false' },
    { id: 4, from: 3, to: 5, type: 'success' },
    { id: 5, from: 4, to: 5, type: 'success' }
  ]

  useEffect(() => {
    loadWorkflows()
  }, [])

  useEffect(() => {
    if (currentWorkflow) {
      loadWorkflowNodes()
    }
  }, [currentWorkflow])

  const loadWorkflows = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWorkflows(mockWorkflows)
    } catch (error) {
      toast.error('Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  const loadWorkflowNodes = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setNodes(mockNodes)
      setConnections(mockConnections)
    } catch (error) {
      toast.error('Failed to load workflow nodes')
    } finally {
      setLoading(false)
    }
  }

  const createWorkflow = async (workflowData) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newWorkflow = {
        id: Date.now(),
        ...workflowData,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        lastRun: null,
        runs: 0,
        successRate: 0,
        nodes: 0,
        connections: 0
      }
      
      setWorkflows(prev => [...prev, newWorkflow])
      setCurrentWorkflow(newWorkflow)
      setNodes([])
      setConnections([])
      toast.success('Workflow created successfully!')
    } catch (error) {
      toast.error('Failed to create workflow')
    } finally {
      setLoading(false)
    }
  }

  const addNode = (nodeType, position) => {
    const nodeTypeData = nodeTypes.find(type => type.id === nodeType)
    if (!nodeTypeData) return

    const newNode = {
      id: Date.now(),
      type: nodeType,
      name: nodeTypeData.name,
      position: position || { x: 200, y: 200 },
      data: {},
      status: 'inactive'
    }

    setNodes(prev => [...prev, newNode])
    setShowNodePalette(false)
    toast.success(`${nodeTypeData.name} node added!`)
  }

  const updateNodePosition = (nodeId, newPosition) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ))
  }

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId))
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId))
    toast.success('Node deleted successfully!')
  }

  const addConnection = (fromNodeId, toNodeId) => {
    const newConnection = {
      id: Date.now(),
      from: fromNodeId,
      to: toNodeId,
      type: 'success'
    }
    setConnections(prev => [...prev, newConnection])
    toast.success('Connection added!')
  }

  const deleteConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
    toast.success('Connection deleted!')
  }

  const saveWorkflow = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedWorkflow = {
        ...currentWorkflow,
        nodes: nodes.length,
        connections: connections.length,
        lastModified: new Date().toISOString()
      }
      
      setWorkflows(prev => prev.map(wf => 
        wf.id === currentWorkflow.id ? updatedWorkflow : wf
      ))
      setCurrentWorkflow(updatedWorkflow)
      toast.success('Workflow saved successfully!')
    } catch (error) {
      toast.error('Failed to save workflow')
    } finally {
      setLoading(false)
    }
  }

  const runWorkflow = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Workflow executed successfully!')
    } catch (error) {
      toast.error('Failed to execute workflow')
    } finally {
      setLoading(false)
    }
  }

  const getNodeColor = (nodeType) => {
    const nodeTypeData = nodeTypes.find(type => type.id === nodeType)
    return nodeTypeData?.color || 'gray'
  }

  const getNodeIcon = (nodeType) => {
    const nodeTypeData = nodeTypes.find(type => type.id === nodeType)
    return nodeTypeData?.icon || Circle
  }

  const renderNode = (node) => {
    const IconComponent = getNodeIcon(node.type)
    const color = getNodeColor(node.type)
    
    return (
      <div
        key={node.id}
        className={`absolute bg-white border-2 rounded-lg p-3 shadow-lg cursor-move ${
          selectedNode?.id === node.id ? 'border-blue-500' : 'border-gray-300'
        } ${node.status === 'active' ? 'ring-2 ring-green-200' : ''}`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoom})`
        }}
        onClick={() => setSelectedNode(node)}
        draggable={editMode}
        onDragStart={(e) => setDraggedNode(node)}
        onDragEnd={(e) => {
          if (draggedNode) {
            const rect = canvasRef.current.getBoundingClientRect()
            const newPosition = {
              x: (e.clientX - rect.left - pan.x) / zoom,
              y: (e.clientY - rect.top - pan.y) / zoom
            }
            updateNodePosition(node.id, newPosition)
            setDraggedNode(null)
          }
        }}
      >
        <div className="flex items-center space-x-2">
          <IconComponent className={`w-5 h-5 text-${color}-600`} />
          <span className="text-sm font-medium text-gray-900">{node.name}</span>
        </div>
        {editMode && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteNode(node.id)
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  const renderConnection = (connection) => {
    const fromNode = nodes.find(n => n.id === connection.from)
    const toNode = nodes.find(n => n.id === connection.to)
    
    if (!fromNode || !toNode) return null

    const fromX = fromNode.position.x + 100
    const fromY = fromNode.position.y + 25
    const toX = toNode.position.x
    const toY = toNode.position.y + 25

    return (
      <svg
        key={connection.id}
        className="absolute pointer-events-none"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
        }}
      >
        <defs>
          <marker
            id={`arrow-${connection.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0,0 0,6 9,3"
              fill={connection.type === 'success' ? '#10B981' : '#F59E0B'}
            />
          </marker>
        </defs>
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke={connection.type === 'success' ? '#10B981' : '#F59E0B'}
          strokeWidth="2"
          markerEnd={`url(#arrow-${connection.id})`}
        />
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Builder</h1>
          <p className="text-gray-600">Visual workflow automation with drag-and-drop interface</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg ${
              editMode 
                ? 'text-white bg-blue-600 hover:bg-blue-700' 
                : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>{editMode ? 'Done' : 'Edit'}</span>
          </button>
          <button
            onClick={() => setShowNodePalette(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Node</span>
          </button>
          <button
            onClick={saveWorkflow}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={runWorkflow}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <Play className="w-4 h-4" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Workflow List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Workflows</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                    currentWorkflow?.id === workflow.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setCurrentWorkflow(workflow)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{workflow.name}</h3>
                    <Badge 
                      variant={workflow.status === 'active' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {workflow.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{workflow.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{workflow.nodes} nodes</span>
                    <span>{workflow.runs} runs</span>
                    <span>{workflow.successRate}% success</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workflow Canvas */}
      {currentWorkflow && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentWorkflow.name} - Workflow Builder
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="relative h-96 overflow-hidden bg-gray-50">
            <div
              ref={canvasRef}
              className="relative w-full h-full"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
              }}
            >
              {/* Render connections first (behind nodes) */}
              {connections.map(renderConnection)}
              
              {/* Render nodes */}
              {nodes.map(renderNode)}
            </div>
          </div>
        </div>
      )}

      {/* Node Palette Modal */}
      {showNodePalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Node</h3>
              <button
                onClick={() => setShowNodePalette(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodeTypes.map((nodeType) => (
                <button
                  key={nodeType.id}
                  onClick={() => addNode(nodeType.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <nodeType.icon className={`w-6 h-6 text-${nodeType.color}-600`} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{nodeType.name}</h4>
                      <p className="text-xs text-gray-500">{nodeType.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowBuilder
