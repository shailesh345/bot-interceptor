import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import TabButton from '../../components/common/TabButton';
import { 
  Mail, MessageSquare, Bell, Send, Search, Filter,
  Users, Calendar, Clock, CheckCircle, AlertCircle,
  Eye, Edit, Trash2, Plus, Settings
} from 'lucide-react';

const CommunicationHub = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([
    {
      id: 'MSG-001',
      from: 'System Admin',
      to: 'Enterprise Corp',
      type: 'email',
      subject: 'Welcome to Traffic Interceptor Premium',
      content: 'Thank you for upgrading to our Premium plan. Your enhanced features are now active.',
      status: 'delivered',
      timestamp: '2024-12-19 14:30:15',
      priority: 'normal'
    },
    {
      id: 'MSG-002',
      from: 'Support Team',
      to: 'TechStart Inc',
      type: 'in-app',
      subject: 'Security Alert Response',
      content: 'We have successfully mitigated the security threat on your account. All systems are secure.',
      status: 'read',
      timestamp: '2024-12-19 13:45:22',
      priority: 'high'
    },
    {
      id: 'MSG-003',
      from: 'Billing System',
      to: 'Global Solutions',
      type: 'email',
      subject: 'Payment Reminder',
      content: 'Your monthly subscription payment is due in 3 days. Please update your billing information.',
      status: 'sent',
      timestamp: '2024-12-19 12:15:08',
      priority: 'normal'
    },
    {
      id: 'MSG-004',
      from: 'Marketing Team',
      to: 'All Active Users',
      type: 'notification',
      subject: 'New Feature Announcement',
      content: 'Check out our new advanced analytics dashboard with real-time threat monitoring.',
      status: 'scheduled',
      timestamp: '2024-12-20 09:00:00',
      priority: 'low'
    }
  ]);

  const [newMessage, setNewMessage] = useState({
    to: '',
    type: 'email',
    subject: '',
    content: '',
    priority: 'normal',
    scheduled: false,
    scheduleDate: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'read': return <Eye className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const message = {
      id: `MSG-${Date.now()}`,
      from: 'Admin',
      ...newMessage,
      status: newMessage.scheduled ? 'scheduled' : 'sent',
      timestamp: newMessage.scheduled ? newMessage.scheduleDate : new Date().toISOString()
    };
    setMessages([message, ...messages]);
    setNewMessage({
      to: '',
      type: 'email',
      subject: '',
      content: '',
      priority: 'normal',
      scheduled: false,
      scheduleDate: ''
    });
  };

  const communicationStats = {
    totalMessages: messages.length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    pending: messages.filter(m => m.status === 'scheduled').length,
    failed: messages.filter(m => m.status === 'failed').length
  };

  const tabs = [
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'compose', name: 'Compose', icon: Plus }
  ];

  return (
    <>
      <Helmet>
        <title>Communication Hub - Traffic Interceptor</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage client communications and automated campaigns
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </button>
        </div>

        {/* Communication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{communicationStats.totalMessages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{communicationStats.delivered}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{communicationStats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{communicationStats.failed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm mb-1 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
                  <div className="flex space-x-3">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{message.subject}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{message.content}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{message.to}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {message.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                            {getStatusIcon(message.status)}
                            <span className="ml-1">{message.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            message.priority === 'high' ? 'text-red-600' :
                            message.priority === 'normal' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {message.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {message.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <div className="bg-white rounded-lg shadow border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Compose New Message</h3>
              </div>
              
              <form onSubmit={handleSendMessage} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                    <input
                      type="text"
                      value={newMessage.to}
                      onChange={(e) => setNewMessage({...newMessage, to: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter recipient email or select from list"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                    <select
                      value={newMessage.type}
                      onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="in-app">In-App Notification</option>
                      <option value="sms">SMS</option>
                      <option value="notification">System Notification</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter message subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your message here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newMessage.priority}
                      onChange={(e) => setNewMessage({...newMessage, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMessage.scheduled}
                        onChange={(e) => setNewMessage({...newMessage, scheduled: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Schedule for later</span>
                    </label>
                    
                    {newMessage.scheduled && (
                      <input
                        type="datetime-local"
                        value={newMessage.scheduleDate}
                        onChange={(e) => setNewMessage({...newMessage, scheduleDate: e.target.value})}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {newMessage.scheduled ? 'Schedule Message' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Save as Draft
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default CommunicationHub;
