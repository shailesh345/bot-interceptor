import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const MLModelManagement = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [featureImportance, setFeatureImportance] = useState({});
  const [trainingConfig, setTrainingConfig] = useState({
    days: 30,
    test_size: 0.2
  });

  useEffect(() => {
    fetchModelInfo();
    fetchModelStatus();
    fetchPerformanceData();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ml/model/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModelInfo(data.model_info);
      }
    } catch (error) {
      console.error('Error fetching model info:', error);
    }
  };

  const fetchModelStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ml/model/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModelStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching model status:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ml/model/performance?days=30', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.performance_data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const fetchFeatureImportance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ml/model/features', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeatureImportance(data.feature_importance);
      }
    } catch (error) {
      console.error('Error fetching feature importance:', error);
    }
  };

  const trainModel = async () => {
    try {
      setIsTraining(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ml/model/train', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainingConfig)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Model training completed! Accuracy: ${(data.results.accuracy * 100).toFixed(2)}%`);
        fetchModelInfo();
        fetchModelStatus();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Training failed');
      }
    } catch (error) {
      console.error('Error training model:', error);
      toast.error('Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const evaluateModel = async () => {
    try {
      setIsEvaluating(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ml/model/evaluate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days: 7 })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Model evaluation completed! Accuracy: ${(data.results.accuracy * 100).toFixed(2)}%`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error('Error evaluating model:', error);
      toast.error('Evaluation failed');
    } finally {
      setIsEvaluating(false);
    }
  };

  const retrainModel = async () => {
    try {
      setIsTraining(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ml/model/retrain', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trainingConfig)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Model retraining completed! Accuracy: ${(data.results.accuracy * 100).toFixed(2)}%`);
        fetchModelInfo();
        fetchModelStatus();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Retraining failed');
      }
    } catch (error) {
      console.error('Error retraining model:', error);
      toast.error('Retraining failed');
    } finally {
      setIsTraining(false);
    }
  };

  const ModelStatusCard = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Model Status</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          modelInfo?.is_trained 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {modelInfo?.is_trained ? (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              <span>Trained</span>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Not Trained</span>
            </>
          )}
        </div>
      </div>
      
      {modelStatus && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">
              {modelStatus.model?.accuracy ? `${(modelStatus.model.accuracy * 100).toFixed(1)}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Training Samples</p>
            <p className="text-2xl font-bold text-gray-900">
              {modelStatus.model?.training_samples?.toLocaleString() || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Training</p>
            <p className="text-sm font-medium text-gray-900">
              {modelStatus.model?.last_training 
                ? new Date(modelStatus.model.last_training).toLocaleDateString()
                : 'Never'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Model Type</p>
            <p className="text-sm font-medium text-gray-900">
              {modelStatus.system?.model_type || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const TrainingControls = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Model Training</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training Data (Days)
          </label>
          <input
            type="number"
            value={trainingConfig.days}
            onChange={(e) => setTrainingConfig(prev => ({ ...prev, days: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="365"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Size
          </label>
          <input
            type="number"
            step="0.1"
            value={trainingConfig.test_size}
            onChange={(e) => setTrainingConfig(prev => ({ ...prev, test_size: parseFloat(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            min="0.1"
            max="0.5"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={trainModel}
            disabled={isTraining || !modelInfo?.is_trained}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isTraining ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Training...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Train Model
              </>
            )}
          </button>
          
          <button
            onClick={retrainModel}
            disabled={isTraining || !modelInfo?.is_trained}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isTraining ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Retraining...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Retrain
              </>
            )}
          </button>
          
          <button
            onClick={evaluateModel}
            disabled={isEvaluating || !modelInfo?.is_trained}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Evaluate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const PerformanceChart = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Model Performance</h3>
      
      {performanceData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="metrics.total_requests" stroke="#3B82F6" name="Total Requests" />
            <Line type="monotone" dataKey="metrics.bot_requests" stroke="#EF4444" name="Bot Requests" />
            <Line type="monotone" dataKey="metrics.blocked_requests" stroke="#F59E0B" name="Blocked Requests" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <ChartBarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p>No performance data available</p>
        </div>
      )}
    </div>
  );

  const FeatureImportanceChart = () => {
    const features = Object.entries(featureImportance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Feature Importance</h3>
          <button
            onClick={fetchFeatureImportance}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
        
        {features.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={features.map(([name, value]) => ({ name, value }))} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <DocumentChartBarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>No feature importance data available</p>
            <button
              onClick={fetchFeatureImportance}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Load Feature Importance
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ML Model Management</h1>
          <p className="text-gray-600">Train, evaluate, and monitor the bot detection machine learning model</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <CpuChipIcon className="h-6 w-6 text-blue-600" />
          <span className="text-sm text-gray-600">Machine Learning</span>
        </div>
      </div>

      {/* Model Status and Training Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModelStatusCard />
        <TrainingControls />
      </div>

      {/* Performance and Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <FeatureImportanceChart />
      </div>

      {/* Recent Activity */}
      {modelStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {modelStatus.recent_activity?.total_requests?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {modelStatus.recent_activity?.bot_requests?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Bot Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {modelStatus.recent_activity?.blocked_requests?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Blocked Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {modelStatus.recent_activity?.bot_detection_rate?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-gray-600">Detection Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLModelManagement;
