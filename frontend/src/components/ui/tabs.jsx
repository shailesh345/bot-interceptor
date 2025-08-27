import React, { createContext, useContext, useState } from 'react'

const TabsContext = createContext()

const Tabs = ({ value, onValueChange, children, className = '', ...props }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`} {...props}>
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, children, className = '', ...props }) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isSelected = selectedValue === value

  return (
    <button
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isSelected
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      } ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className = '', ...props }) => {
  const { value: selectedValue } = useContext(TabsContext)
  
  if (selectedValue !== value) {
    return null
  }

  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
