import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Menu, User, LogOut } from 'lucide-react'
import { logoutUser } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import NotificationCenter from '../common/NotificationCenter'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="ml-4 md:ml-0">
            <h1 className="text-2xl font-bold text-gray-900 font-yandex">Dashboard</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <NotificationCenter />
          
          <div className="relative">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 font-yandex">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 font-yandex">{user?.email}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
