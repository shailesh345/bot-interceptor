import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h2>
            <p className="mt-2 text-base text-gray-600">
              Sorry, we couldn't find the page you're looking for.
            </p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <Link
                to="/"
                className="btn btn-primary flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="btn btn-outline flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
