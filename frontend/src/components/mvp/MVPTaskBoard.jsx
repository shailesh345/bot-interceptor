import React from 'react'
import { CheckCircle, Circle, Clock, Users, Calendar, Target } from 'lucide-react'
import { MVP_CONFIG, MVP_ROADMAP } from '../../config/mvp'

// Utility functions
const getStatusIcon = (status) => {
  switch(status) {
    case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />
    case 'pending': return <Circle className="w-4 h-4 text-gray-400" />
    default: return <Circle className="w-4 h-4 text-gray-400" />
  }
}

const getStatusColor = (status) => {
  switch(status) {
    case 'completed': return 'bg-green-100 border-green-300 text-green-800'
    case 'in_progress': return 'bg-blue-100 border-blue-300 text-blue-800'
    case 'pending': return 'bg-gray-100 border-gray-300 text-gray-600'
    default: return 'bg-gray-100 border-gray-300 text-gray-600'
  }
}

const getPhaseProgress = (phase) => {
  if (!phase.tasks || phase.tasks.length === 0) return 0
  const completed = phase.tasks.filter(task => task.status === 'completed').length
  const total = phase.tasks.length
  return (completed / total) * 100
}

const MVPTaskBoard = () => {
  // Helper to get phase description if available
  const getPhaseDescription = (phaseName) => {
    const criteria = MVP_CONFIG.LAUNCH_CRITERIA
    if (!criteria) return ''
    // Try to match by phase name or feature
    const match = Object.values(criteria).find(c => c.description && c.description.toLowerCase().includes(phaseName.toLowerCase()))
    return match ? match.description : ''
  }
  // Convert MVP_CONFIG.PHASES to tasks format, include priority and completion
  const tasks = Object.entries(MVP_CONFIG.PHASES).reduce((acc, [key, phase], idx) => {
    acc[key] = {
      title: phase.name,
      status: phase.status === 'active' ? 'in_progress' : phase.status,
      priority: phase.priority,
      completion: phase.completion,
      features: phase.features,
      tasks: (phase.features || []).map((feature, i) => ({
        id: `${key}-${i}`,
        title: feature,
        status: phase.completion === 100 ? 'completed' : (phase.completion >= 80 ? 'in_progress' : 'pending'),
        assignee: 'Full Team'
      }))
    }
    return acc
  }, {})

  const totalTasks = Object.values(tasks).reduce((acc, phase) => acc + phase.tasks.length, 0)
  const completedTasks = Object.values(tasks).reduce((acc, phase) => 
    acc + phase.tasks.filter(task => task.status === 'completed').length, 0
  )
  const overallProgress = (completedTasks / totalTasks) * 100

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MVP Task Board</h1>
        <p className="text-gray-600">Track development progress across all MVP phases</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                {completedTasks}/{totalTasks} tasks completed
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {Math.round(overallProgress)}% Complete
          </div>
        </div>
      </div>

      {/* Phase Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.entries(tasks).map(([phaseKey, phase]) => {
          const progress = getPhaseProgress(phase)
          let progressBarColor = 'bg-gray-400';
          if (phase.status === 'completed') progressBarColor = 'bg-green-600';
          else if (phase.status === 'in_progress' || phase.status === 'active') progressBarColor = 'bg-blue-600';
          else if (phase.status === 'planned') progressBarColor = 'bg-yellow-400';

          return (
            <div key={phaseKey} className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(phase.status)}`}>
                    {phase.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500">Priority: {phase.priority}</span>
                  <span className="text-xs text-gray-500">{phase.completion}% done</span>
                </div>
                <div className="mb-1 text-xs text-gray-500 italic">
                  {getPhaseDescription(phase.title)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${progressBarColor} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {Math.round(progress)}% Complete
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {phase.tasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{task.assignee}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MVP Feature Checklist */}
      <div className="bg-white rounded-lg shadow-sm border mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            MVP Feature Checklist
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {Object.entries(tasks).map(([phaseKey, phase]) => (
              <div key={phaseKey}>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">{phase.title} <span className="text-xs font-normal text-gray-500">({phase.priority})</span></h3>
                <ul className="list-none ml-0">
                  {phase.tasks.map((task) => (
                    <li key={task.id} className="flex items-center mb-2">
                      <span className="mr-2">
                        {getStatusIcon(task.status)}
                      </span>
                      <span className={`text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>{task.title}</span>
                      <span className="ml-2 text-xs text-gray-400">{task.assignee}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Development Timeline
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(tasks).map(([phaseKey, phase], index) => (
              <div key={phaseKey} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                    phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{phase.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(phase.status)}`}>
                      {phase.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {phase.tasks.length} tasks • {phase.tasks.filter(t => t.status === 'completed').length} completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Roadmap Milestones */}
        <div className="p-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">MVP Roadmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(MVP_ROADMAP).map(([quarter, data]) => (
              <div key={quarter} className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-medium text-blue-700 mb-1">{quarter}: {data.title}</h3>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  {data.milestones.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {/* Upcoming Phases & Planned Features */}
        <div className="p-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Phases & Planned Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(tasks)
              .filter(([_, phase]) => phase.status === 'planned')
              .map(([phaseKey, phase]) => (
                <div key={phaseKey} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="font-medium text-yellow-700 mb-1">{phase.title}</h3>
                  <span className="text-xs font-semibold text-yellow-600 mb-2 block">Priority: {phase.priority}</span>
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {phase.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}


export default MVPTaskBoard
