import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const { sidebarCollapsed } = useSelector((state) => state.ui)

  return (
    <div className="h-screen bg-white overflow-hidden font-yandex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={`flex flex-col h-full transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-12' : 'md:ml-48'
      } ml-0`}>
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-white">
          <div className="container mx-auto px-4 py-6 max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
