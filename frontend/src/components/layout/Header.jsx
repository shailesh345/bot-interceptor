import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Bell, 
  User, 
  LogOut,
  HelpCircle
} from 'lucide-react'
import { logoutUser } from '../../store/slices/authSlice'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = useCallback(() => {
    dispatch(logoutUser())
    navigate('/login')
  }, [dispatch, navigate])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-0 shadow-sm font-yandex flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left Section - Logo/Title */}
        <div className="flex items-center">
          {/* <h1 className="text-xl font-bold text-black">Boot Interceptorc</h1>*/}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-1 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full"></span>
          </button>

          {/* Help */}
          <button className="p-1 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle size={18} />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="font-medium text-sm">{user?.name || 'User'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Settings
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
