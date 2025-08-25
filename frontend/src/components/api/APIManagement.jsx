import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Api, Refresh, TrendingUp } from '@mui/icons-material';

const APIManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [rateLimits, setRateLimits] = useState([]);
  const [endpoints, setEndpoints] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, limitsRes, endpointsRes] = await Promise.all([
        fetch('/api/api-management/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/api-management/rate-limits', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/api-management/endpoints', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setApiStats(data.api_stats);
      }
      
      if (limitsRes.ok) {
        const data = await limitsRes.json();
        setRateLimits(data.rate_limits);
      }
      
      if (endpointsRes.ok) {
        const data = await endpointsRes.json();
        setEndpoints(data.endpoints);
      }
    } catch (err) {
      setError('Failed to fetch API data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchData}>Retry</Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">API Management</Typography>
        <Button variant="contained" startIcon={<Refresh />} onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Requests</Typography>
              <Typography variant="h3">{apiStats?.total_requests || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Success Rate</Typography>
              <Typography variant="h3">{apiStats?.success_rate || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Endpoints</Typography>
              <Typography variant="h3">{endpoints.filter(e => e.status === 'active').length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>API Endpoints</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Rate Limit</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {endpoints.map((endpoint) => (
                      <TableRow key={endpoint.id}>
                        <TableCell>{endpoint.path}</TableCell>
                        <TableCell>{endpoint.method}</TableCell>
                        <TableCell>{endpoint.rate_limit}/min</TableCell>
                        <TableCell>
                          <Chip label={endpoint.status} color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default APIManagement;
