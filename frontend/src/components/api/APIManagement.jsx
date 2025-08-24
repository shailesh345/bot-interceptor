import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton
} from '@mui/material';
import {
  Api,
  Speed,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Settings,
  Delete,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const APIManagement = () => {
  const [apiStats, setApiStats] = useState(null);
  const [rateLimits, setRateLimits] = useState(null);
  const [apiLogs, setApiLogs] = useState(null);
  const [endpointStats, setEndpointStats] = useState(null);
  const [throttledEndpoints, setThrottledEndpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [throttleDialog, setThrottleDialog] = useState(false);
  const [throttleData, setThrottleData] = useState({ endpoint: '', duration: 300, reason: '' });

  useEffect(() => {
    fetchAPIStats();
    fetchRateLimits();
    fetchAPIHealth();
  }, []);

  const fetchAPIStats = async () => {
    try {
      const response = await fetch('/api/api-management/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiStats(data);
      }
    } catch (error) {
      console.error('Error fetching API stats:', error);
    }
  };

  const fetchRateLimits = async () => {
    try {
      const response = await fetch('/api/api-management/rate-limits', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRateLimits(data);
      }
    } catch (error) {
      console.error('Error fetching rate limits:', error);
    }
  };

  const fetchAPIHealth = async () => {
    try {
      const response = await fetch('/api/api-management/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update health status
      }
    } catch (error) {
      console.error('Error fetching API health:', error);
    }
  };

  const fetchEndpointStats = async () => {
    try {
      const response = await fetch('/api/api-management/endpoints', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEndpointStats(data);
      }
    } catch (error) {
      console.error('Error fetching endpoint stats:', error);
    }
  };

  const fetchThrottledEndpoints = async () => {
    try {
      const response = await fetch('/api/api-management/throttling', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThrottledEndpoints(data.throttled_endpoints || []);
      }
    } catch (error) {
      console.error('Error fetching throttled endpoints:', error);
    }
  };

  const throttleEndpoint = async () => {
    if (!throttleData.endpoint.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/api-management/throttling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(throttleData)
      });
      
      if (response.ok) {
        setThrottleDialog(false);
        setThrottleData({ endpoint: '', duration: 300, reason: '' });
        fetchThrottledEndpoints();
      }
    } catch (error) {
      console.error('Error throttling endpoint:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeThrottling = async (endpoint) => {
    try {
      const response = await fetch(`/api/api-management/throttling/${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchThrottledEndpoints();
      }
    } catch (error) {
      console.error('Error removing throttling:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle />;
      case 'degraded': return <Warning />;
      case 'unhealthy': return <Error />;
      default: return <Warning />;
    }
  };

  const renderAPIStats = () => {
    if (!apiStats) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                Requests/Minute
              </Typography>
              <Typography variant="h4" color="primary">
                {apiStats.requests_this_minute || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Success Rate
              </Typography>
              <Typography variant="h4" color="primary">
                {apiStats.success_rate ? `${apiStats.success_rate.toFixed(1)}%` : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Api sx={{ mr: 1, verticalAlign: 'middle' }} />
                Active Rate Limits
              </Typography>
              <Typography variant="h4" color="primary">
                {Object.keys(apiStats).filter(key => key.includes('active_limits')).reduce((sum, key) => sum + (apiStats[key] || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                Avg Response Time
              </Typography>
              <Typography variant="h4" color="primary">
                {apiStats.avg_response_time ? `${apiStats.avg_response_time}ms` : '0ms'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderRateLimits = () => {
    if (!rateLimits) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
            Rate Limit Configuration
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Limit Type</TableCell>
                  <TableCell>Requests</TableCell>
                  <TableCell>Window (seconds)</TableCell>
                  <TableCell>Requests/Hour</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(rateLimits.rate_limits || {}).map(([type, config]) => (
                  <TableRow key={type}>
                    <TableCell>
                      <Chip 
                        label={type.replace(/_/g, ' ').toUpperCase()} 
                        color="primary" 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{config.requests}</TableCell>
                    <TableCell>{config.window}</TableCell>
                    <TableCell>
                      {Math.round((config.requests / config.window) * 3600)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderEndpointStats = () => {
    if (!endpointStats) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Api sx={{ mr: 1, verticalAlign: 'middle' }} />
            Endpoint Performance
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Total Requests</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Avg Response Time</TableCell>
                  <TableCell>Min/Max Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(endpointStats.endpoint_stats || {}).map(([endpoint, stats]) => (
                  <TableRow key={endpoint}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {endpoint}
                      </Typography>
                    </TableCell>
                    <TableCell>{stats.total_requests}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${stats.success_rate}%`}
                        color={stats.success_rate > 90 ? 'success' : stats.success_rate > 70 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{stats.avg_execution_time}ms</TableCell>
                    <TableCell>
                      {stats.min_execution_time}ms / {stats.max_execution_time}ms
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderThrottledEndpoints = () => {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              <Stop sx={{ mr: 1, verticalAlign: 'middle' }} />
              Throttled Endpoints
            </Typography>
            <Button
              variant="contained"
              onClick={() => setThrottleDialog(true)}
            >
              Throttle Endpoint
            </Button>
          </Box>
          
          {throttledEndpoints.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Throttled At</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {throttledEndpoints.map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {endpoint.endpoint}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(endpoint.throttled_at * 1000).toLocaleString()}
                      </TableCell>
                      <TableCell>{endpoint.duration}s</TableCell>
                      <TableCell>{endpoint.reason}</TableCell>
                      <TableCell>
                        <Tooltip title="Remove Throttling">
                          <IconButton
                            color="error"
                            onClick={() => removeThrottling(endpoint.endpoint)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No endpoints are currently throttled.
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        <Api sx={{ mr: 1, verticalAlign: 'middle' }} />
        API Management & Gateway
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Monitor API usage, manage rate limits, and control endpoint access.
      </Typography>

      {/* API Statistics */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        API Statistics
      </Typography>
      {renderAPIStats()}

      {/* Rate Limits */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Rate Limits
      </Typography>
      {renderRateLimits()}

      {/* Endpoint Stats */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Endpoint Performance
      </Typography>
      <Button
        variant="outlined"
        onClick={fetchEndpointStats}
        startIcon={<Refresh />}
        sx={{ mb: 2 }}
      >
        Refresh Stats
      </Button>
      {renderEndpointStats()}

      {/* Throttled Endpoints */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Throttling Management
      </Typography>
      <Button
        variant="outlined"
        onClick={fetchThrottledEndpoints}
        startIcon={<Refresh />}
        sx={{ mb: 2 }}
      >
        Refresh Throttled Endpoints
      </Button>
      {renderThrottledEndpoints()}

      {/* Throttle Endpoint Dialog */}
      <Dialog open={throttleDialog} onClose={() => setThrottleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Throttle Endpoint</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Endpoint Name"
            fullWidth
            variant="outlined"
            value={throttleData.endpoint}
            onChange={(e) => setThrottleData({ ...throttleData, endpoint: e.target.value })}
            placeholder="e.g., /api/analytics/dashboard"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Duration (seconds)"
            type="number"
            fullWidth
            variant="outlined"
            value={throttleData.duration}
            onChange={(e) => setThrottleData({ ...throttleData, duration: parseInt(e.target.value) || 300 })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Reason"
            fullWidth
            variant="outlined"
            value={throttleData.reason}
            onChange={(e) => setThrottleData({ ...throttleData, reason: e.target.value })}
            placeholder="Reason for throttling"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThrottleDialog(false)}>Cancel</Button>
          <Button 
            onClick={throttleEndpoint} 
            variant="contained"
            disabled={loading || !throttleData.endpoint.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Throttle Endpoint'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default APIManagement;
