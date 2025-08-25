import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  Star, 
  Heart, 
  Zap, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Info,
  XCircle,
  Plus,
  Search,
  Download,
  Settings
} from 'lucide-react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Skeleton from '../components/common/Skeleton'
import ThemeToggle from '../components/common/ThemeToggle'
import { DebouncedInput } from '../components/common/PerformanceOptimizer'

const ComponentDemo = () => {
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (value) => {
    console.log('Search:', value)
  }

  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

  return (
    <>
      <Helmet>
        <title>Component Demo - Traffic Interceptor</title>
      </Helmet>
      
      <main className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Component Library Demo
          </h1>
          <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
            Explore the enhanced design system and components
          </p>
          <div className="flex justify-center mt-6">
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Cards Section */}
        <Card header="Card Components" animation="fade-in-up" delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card header="Basic Card" className="text-center">
              <p style={{ color: 'var(--text-secondary)' }}>
                This is a basic card with header and content.
              </p>
            </Card>
            
            <Card header="Card with Footer" footer="Footer content" className="text-center">
              <p style={{ color: 'var(--text-secondary)' }}>
                Card with header, body, and footer sections.
              </p>
            </Card>
            
            <Card header="Interactive Card" hover={true} className="text-center cursor-pointer">
              <p style={{ color: 'var(--text-secondary)' }}>
                Hover over this card to see the effect.
              </p>
            </Card>
          </div>
        </Card>

        {/* Buttons Section */}
        <Card header="Button Components" animation="fade-in-up" delay={0.2}>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Button Variants
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Button Sizes
              </h4>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Button States
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Loading...' : 'Click to Load'}
                </Button>
                <Button disabled>Disabled</Button>
                <Button icon={Plus}>With Icon</Button>
                <Button icon={Download} iconPosition="right">Icon Right</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Badges Section */}
        <Card header="Badge Components" animation="fade-in-up" delay={0.3}>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Badge Variants
              </h4>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="secondary">Secondary</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Badge Sizes
              </h4>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Badges with Icons
              </h4>
              <div className="flex flex-wrap gap-3">
                <Badge variant="success" icon={CheckCircle}>Active</Badge>
                <Badge variant="warning" icon={AlertTriangle}>Warning</Badge>
                <Badge variant="danger" icon={XCircle}>Error</Badge>
                <Badge variant="info" icon={Info}>Info</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading States Section */}
        <Card header="Loading States" animation="fade-in-up" delay={0.4}>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Loading Spinners
              </h4>
              <div className="flex flex-wrap gap-6 items-center">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
                <LoadingSpinner size="xl" />
                <LoadingSpinner size="lg" text="Loading..." />
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Skeleton Components
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Skeleton type="title" />
                  <Skeleton type="text" lines={3} />
                </div>
                <div className="space-y-3">
                  <Skeleton type="avatar" />
                  <Skeleton type="button" />
                  <Skeleton type="badge" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Elements Section */}
        <Card header="Form Elements" animation="fade-in-up" delay={0.5}>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Debounced Input
              </h4>
              <div className="max-w-md">
                <DebouncedInput
                  value={searchValue}
                  onChange={handleSearch}
                  placeholder="Type to search..."
                  className="w-full"
                />
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  Input is debounced by 300ms. Check console for search values.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Regular Inputs
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Regular input"
                  className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'var(--border-primary)',
                    backgroundColor: 'var(--primary-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
                <select
                  className="px-4 py-2 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'var(--border-primary)',
                    backgroundColor: 'var(--primary-bg)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Animations Section */}
        <Card header="Animation Examples" animation="fade-in-up" delay={0.6}>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Interactive Animations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 rounded-lg text-center cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-bg)' }}
                >
                  <Star className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-primary)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Hover & Tap</p>
                </motion.div>
                
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="p-6 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--accent-bg)' }}
                >
                  <Heart className="h-8 w-8 mx-auto mb-2" style={{ color: '#ef4444' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Continuous</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -10 }}
                  className="p-6 rounded-lg text-center cursor-pointer"
                  style={{ backgroundColor: 'var(--accent-bg)' }}
                >
                  <Zap className="h-8 w-8 mx-auto mb-2" style={{ color: '#f59e0b' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Float Up</p>
                </motion.div>
              </div>
            </div>
          </div>
        </Card>

        {/* Theme Information */}
        <Card header="Theme Information" animation="fade-in-up" delay={0.7}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Current Theme
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Background:</span>
                  <code className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    {document.documentElement.getAttribute('data-theme') || 'light'}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Primary Text:</span>
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: 'var(--text-primary)' }}></div>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Border Color:</span>
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Theme Features
              </h4>
              <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#10b981' }} />
                  Light/Dark mode support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#10b981' }} />
                  Smooth transitions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#10b981' }} />
                  Persistent storage
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#10b981' }} />
                  CSS custom properties
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </>
  )
}

export default ComponentDemo

