import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  Code, 
  Globe, 
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

const TrackingIntegration = () => {
  const [searchParams] = useSearchParams()
  const domainName = searchParams.get('domain')
  
  const [trackingScript, setTrackingScript] = useState('')
  const [integrationStatus, setIntegrationStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  
  const { token } = useSelector(state => state.auth)
  const { domains } = useSelector(state => state.domains)

  useEffect(() => {
    if (domainName && domains.length > 0) {
      const domain = domains.find(d => d.domain_name === domainName)
      if (domain) {
        setSelectedDomain(domain)
        fetchTrackingScript(domain.id)
      }
    }
  }, [domainName, domains])

  const fetchTrackingScript = async (domainId) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8960/api/v1/domains/${domainId}/tracking-script`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setTrackingScript(data.tracking_script)
    } catch (error) {
      console.error('Error fetching tracking script:', error)
      toast.error('Failed to fetch tracking script')
    } finally {
      setLoading(false)
    }
  }

  const verifyIntegration = async () => {
    if (!selectedDomain) return
    
    setVerifying(true)
    try {
      const response = await fetch(`http://localhost:8960/api/v1/domains/${selectedDomain.id}/verify-integration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setIntegrationStatus(data.integration_status)
      
      if (data.integration_status.is_integrated) {
        toast.success('Tracking integration verified successfully!')
      } else {
        toast.warning('No recent traffic detected. Please check your integration.')
      }
    } catch (error) {
      console.error('Error verifying integration:', error)
      toast.error('Failed to verify integration')
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const getStatusBadge = () => {
    if (!integrationStatus) return null
    
    if (integrationStatus.is_integrated) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  if (!selectedDomain) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Domain Not Found</h2>
            <p className="text-gray-600">
              The specified domain was not found or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Traffic Tracking Integration</h1>
          {getStatusBadge()}
        </div>
        <p className="text-gray-600">
          Set up real-time traffic monitoring for <strong>{selectedDomain.domain_name}</strong>
        </p>
      </div>

      {/* Integration Status */}
      {integrationStatus && (
        <Alert className={`mb-6 ${integrationStatus.is_integrated ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Status:</strong> {integrationStatus.message}
            {integrationStatus.recent_traffic_count > 0 && (
              <span className="ml-2">
                ({integrationStatus.recent_traffic_count} requests in the last 30 minutes)
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Tracking Script */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Tracking Script
          </CardTitle>
          <CardDescription>
            Add this script to your website to enable real-time traffic monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading tracking script...
            </div>
          ) : (
            <>
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                  <code>{trackingScript}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(trackingScript)}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => copyToClipboard(trackingScript)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Script
                </Button>
                
                <Button
                  onClick={verifyIntegration}
                  variant="outline"
                  size="sm"
                  disabled={verifying}
                >
                  {verifying ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verify Integration
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Integration Instructions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Integration Instructions</CardTitle>
          <CardDescription>
            Choose your platform for specific integration steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">HTML Website</h3>
              <p className="text-sm text-gray-600 mb-2">
                Add the script to the &lt;head&gt; section of your HTML pages
              </p>
              <code className="text-xs bg-gray-100 p-1 rounded">
                &lt;head&gt;...script here...&lt;/head&gt;
              </code>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">WordPress</h3>
              <p className="text-sm text-gray-600 mb-2">
                Add to theme's header.php or use "Insert Headers and Footers" plugin
              </p>
              <Button variant="link" size="sm" className="p-0 h-auto">
                <ExternalLink className="h-3 w-3 mr-1" />
                Plugin Link
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Shopify</h3>
              <p className="text-sm text-gray-600 mb-2">
                Online Store → Themes → Actions → Edit Code → theme.liquid
              </p>
              <code className="text-xs bg-gray-100 p-1 rounded">
                Add before &lt;/head&gt;
              </code>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Squarespace</h3>
              <p className="text-sm text-gray-600 mb-2">
                Settings → Advanced → Code Injection → Header
              </p>
              <Button variant="link" size="sm" className="p-0 h-auto">
                <ExternalLink className="h-3 w-3 mr-1" />
                Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Gets Tracked */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Tracked</CardTitle>
          <CardDescription>
            Information collected by the tracking script
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Basic Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Page URL and title</li>
                <li>• User agent and browser</li>
                <li>• IP address and location</li>
                <li>• Timestamp</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Technical Details</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Screen resolution</li>
                <li>• Language and timezone</li>
                <li>• Platform information</li>
                <li>• Bot detection</li>
              </ul>
            </div>
          </div>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              All data is collected anonymously and used only for traffic analysis and bot detection.
              No personal information is stored.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export default TrackingIntegration
