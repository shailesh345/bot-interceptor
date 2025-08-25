import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button } from '@mui/material';
import { Refresh, Cloud } from '@mui/icons-material';

const EdgeComputing = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [edgeNodes, setEdgeNodes] = useState([]);
  const [cdnConfig, setCdnConfig] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nodesRes, cdnRes] = await Promise.all([
        fetch('/api/edge-computing/edge-nodes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/edge-computing/cdn/configuration', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (nodesRes.ok) {
        const data = await nodesRes.json();
        setEdgeNodes(data.edge_nodes);
      }
      
      if (cdnRes.ok) {
        const data = await cdnRes.json();
        setCdnConfig(data.cdn_config);
      }
    } catch (err) {
      setError('Failed to fetch data');
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
        <Typography variant="h4">Edge Computing & CDN</Typography>
        <Button variant="contained" startIcon={<Refresh />} onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>CDN Status</Typography>
              {cdnConfig && (
                <Box>
                  <Chip 
                    label={cdnConfig.enabled ? 'Enabled' : 'Disabled'} 
                    color={cdnConfig.enabled ? 'success' : 'default'} 
                  />
                  <Typography variant="body2" mt={1}>
                    Strategy: {cdnConfig.caching_strategy}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Edge Nodes</Typography>
              <Typography variant="body2">
                Active Nodes: {edgeNodes.filter(n => n.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EdgeComputing;
