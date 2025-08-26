import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  Settings,
  Lightbulb,
  HelpCircle,
  Zap,
  Brain
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const AIChatbot = () => {
  // Check if AI features are enabled (can be controlled via environment variable)
  const isAIEnabled = import.meta.env.VITE_AI_ENABLED === 'true' || false
  
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  const quickSuggestions = [
    "How can I optimize my traffic?",
    "Show me security insights",
    "What are the latest anomalies?",
    "Generate a performance report"
  ]

  const mockResponses = {
    "how can i optimize my traffic": {
      response: "Based on your current traffic patterns, I recommend:\n\n1. **Enable CDN** - Reduce latency by 40%\n2. **Implement rate limiting** - Protect against abuse\n3. **Optimize images** - Reduce page load time\n4. **Enable caching** - Improve response times\n\nWould you like me to implement any of these optimizations?",
      type: "recommendation"
    },
    "show me security insights": {
      response: "Here are your current security insights:\n\n🔴 **High Priority:**\n- 3 suspicious login attempts detected\n- 1 potential DDoS attack blocked\n\n🟡 **Medium Priority:**\n- SSL certificate expires in 7 days\n- 2 new IP addresses flagged\n\n🟢 **Low Priority:**\n- All systems running normally\n\nWould you like me to investigate any of these issues?",
      type: "security"
    },
    "what are the latest anomalies": {
      response: "I've detected the following anomalies:\n\n🚨 **Critical:**\n- Traffic spike: 300% increase from US-East region\n- Response time: 200% increase in API calls\n\n⚠️ **Warning:**\n- Unusual user agent patterns\n- Multiple failed authentication attempts\n\n📊 **Info:**\n- All anomalies are being monitored\n- Automated responses are active",
      type: "anomaly"
    },
    "generate a performance report": {
      response: "Here's your performance report:\n\n📈 **Metrics:**\n- Page load time: 1.2s (Good)\n- Response time: 150ms (Excellent)\n- Uptime: 99.9% (Excellent)\n- Error rate: 0.1% (Good)\n\n🎯 **Recommendations:**\n- Consider implementing lazy loading\n- Optimize database queries\n- Enable compression\n\n📊 **Trends:**\n- Performance improving 15% month-over-month\n- User satisfaction up 20%",
      type: "report"
    }
  }

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0 && isAIEnabled) {
      addMessage({
        id: Date.now(),
        text: "Hello! I'm your AI assistant. I can help you with traffic optimization, security insights, performance analysis, and more. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      })
    } else if (messages.length === 0 && !isAIEnabled) {
      addMessage({
        id: Date.now(),
        text: "AI Assistant is currently disabled. This feature will be available once an AI backend service is configured.",
        sender: 'bot',
        timestamp: new Date()
      })
    }
  }, [isAIEnabled])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message) => {
    setMessages(prev => [...prev, message])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isAIEnabled) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI processing (this would be replaced with real API call when AI is enabled)
    setTimeout(() => {
      const response = generateAIResponse(inputMessage.toLowerCase())
      addMessage({
        id: Date.now() + 1,
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        type: response.type
      })
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (message) => {
    // Check for exact matches first
    for (const [key, value] of Object.entries(mockResponses)) {
      if (message.includes(key)) {
        return value
      }
    }

    // Check for partial matches
    if (message.includes('traffic') || message.includes('optimize')) {
      return mockResponses["how can i optimize my traffic"]
    }
    if (message.includes('security') || message.includes('insight')) {
      return mockResponses["show me security insights"]
    }
    if (message.includes('anomaly') || message.includes('issue')) {
      return mockResponses["what are the latest anomalies"]
    }
    if (message.includes('report') || message.includes('performance')) {
      return mockResponses["generate a performance report"]
    }

    // Default response
    return {
      response: "I understand you're asking about '" + message + "'. Let me help you with that. Could you please be more specific? I can assist with:\n\n• Traffic optimization\n• Security insights\n• Performance analysis\n• Anomaly detection\n• Report generation\n\nWhat would you like to know more about?",
      type: "general"
    }
  }

  const handleQuickSuggestion = (suggestion) => {
    setInputMessage(suggestion)
  }

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageIcon = (sender) => {
    return sender === 'bot' ? 
      <Bot className="w-6 h-6 text-blue-600" /> : 
      <User className="w-6 h-6 text-gray-600" />
  }

  const getMessageStyle = (sender) => {
    return sender === 'bot' ? 
      'bg-blue-50 border-blue-200' : 
      'bg-gray-50 border-gray-200'
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl border border-gray-200 ${isMinimized ? 'w-80 h-12' : 'w-96 h-96'} transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span className="font-medium">AI Assistant</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs">Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-gray-200"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ height: '280px' }}>
              {messages.map((message) => (
                <div key={message.id} className={`flex space-x-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'bot' && (
                    <div className="flex-shrink-0">
                      {getMessageIcon(message.sender)}
                    </div>
                  )}
                  <div className={`max-w-xs p-3 rounded-lg border ${getMessageStyle(message.sender)}`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0">
                      {getMessageIcon(message.sender)}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex space-x-3 justify-start">
                  <div className="flex-shrink-0">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && isAIEnabled && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isAIEnabled ? "Ask me anything..." : "AI Assistant is disabled"}
                  disabled={!isAIEnabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping || !isAIEnabled}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AIChatbot
