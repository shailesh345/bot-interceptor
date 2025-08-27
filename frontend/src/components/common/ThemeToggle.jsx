import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sun, Moon } from 'lucide-react'
import { setTheme } from '../../store/slices/uiSlice'
import { motion } from 'framer-motion'

const ThemeToggle = () => {
  const dispatch = useDispatch()
  const currentTheme = useSelector((state) => state.ui.theme)

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', currentTheme)
    localStorage.setItem('theme', currentTheme)
  }, [currentTheme])

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    dispatch(setTheme(newTheme))
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="
        relative p-2 rounded-lg transition-all duration-300 ease-out
        bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black
        border border-gray-300 hover:border-gray-400
        focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
        hover:scale-105 active:scale-95
        shadow-sm hover:shadow-md
        group overflow-hidden
      "
      title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full"
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <motion.div
        key={currentTheme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-10"
      >
        {currentTheme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.div>
    </motion.button>
  )
}

export default ThemeToggle

