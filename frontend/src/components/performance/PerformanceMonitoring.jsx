import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { Speed, Memory, Storage, Storage as Database } from '@mui/icons-material';

const PerformanceMonitoring = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/performance/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (!systemHealth) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
        Performance Monitoring
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Monitor system health and performance metrics.
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  Overall System Status
                </Typography>
                <Chip 
                  label={systemHealth.overall_status.toUpperCase()} 
                  color={getStatusColor(systemHealth.overall_status)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Metrics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                CPU Usage
              </Typography>
              <Typography variant="h4" color="primary">
                {systemHealth.system.cpu_percent}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Memory sx={{ mr: 1, verticalAlign: 'middle' }} />
                Memory Usage
              </Typography>
              <Typography variant="h4" color="primary">
                {systemHealth.system.memory_percent}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
                Disk Usage
              </Typography>
              <Typography variant="h4" color="primary">
                {systemHealth.system.disk_percent}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Database Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Database sx={{ mr: 1, verticalAlign: 'middle' }} />
                Database Health
              </Typography>
              <Chip 
                label={systemHealth.database.status} 
                color={getStatusColor(systemHealth.database.status)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2">
                Query Time: {systemHealth.database.query_time_ms}ms
              </Typography>
              <Typography variant="body2">
                Size: {systemHealth.database.size_mb}MB
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Cache Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cache Health
              </Typography>
              <Chip 
                label={systemHealth.cache.connected ? 'Connected' : 'Disconnected'} 
                color={systemHealth.cache.connected ? 'success' : 'error'}
                sx={{ mb: 2 }}
              />
              {systemHealth.cache.connected && (
                <>
                  <Typography variant="body2">
                    Total Keys: {systemHealth.cache.total_keys}
                  </Typography>
                  <Typography variant="body2">
                    Memory: {systemHealth.cache.memory_usage}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceMonitoring;
