import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const { sidebarCollapsed } = useSelector((state) => state.ui)

  return (
    <div className="flex h-screen bg-white overflow-hidden font-yandex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="container mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2 font-yandex">
                Welcome to Boot Interceptor
              </h1>
              <p className="text-lg text-gray-600 font-yandex">
                Advanced traffic security and monitoring platform
              </p>
            </div>
            
            {/* Content Area */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
