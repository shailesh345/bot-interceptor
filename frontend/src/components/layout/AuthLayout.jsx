import React from 'react'
import { Shield, Zap, Bot } from 'lucide-react'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex font-yandex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-center items-center p-12 relative overflow-hidden" style={{ color: 'white' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div 
                key={i}
                className="border border-white/10"
                style={{
                  animation: `pulse ${2 + (i % 3)}s infinite ${(i % 5) * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-white text-black rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 tracking-tight" style={{ color: 'white' }}>
            Traffic Interceptor
          </h1>
          
          <p className="text-xl mb-8 text-white/90 font-light" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Advanced Bot Traffic Management Platform
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5" style={{ color: 'white' }} />
              </div>
              <div className="text-left">
                <div className="font-medium" style={{ color: 'white' }}>AI-Powered Detection</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Advanced bot identification</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" style={{ color: 'white' }} />
              </div>
              <div className="text-left">
                <div className="font-medium" style={{ color: 'white' }}>Real-Time Protection</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Instant traffic analysis</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" style={{ color: 'white' }} />
              </div>
              <div className="text-left">
                <div className="font-medium" style={{ color: 'white' }}>Enterprise Security</div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Banking-grade protection</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Stats */}
        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex justify-between text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: 'white' }}>99.9%</div>
              <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'white' }}>10M+</div>
              <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Requests/Day</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'white' }}>&lt;1ms</div>
              <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Response Time</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">
              Traffic Interceptor
            </h1>
            <p className="text-neutral-600 text-sm">
              Bot Traffic Management Platform
            </p>
          </div>
          
          {/* Auth Form */}
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-xs text-neutral-500">
          <p>&copy; 2024 Traffic Interceptor. All rights reserved.</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
