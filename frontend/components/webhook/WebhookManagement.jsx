import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Refresh, Add, Webhook, Key } from '@mui/icons-material';

const WebhookManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [webhooksRes, integrationsRes, apiKeysRes] = await Promise.all([
        fetch('/api/webhook-management/webhooks', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/webhook-management/integrations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/webhook-management/api-keys', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (webhooksRes.ok) {
        const data = await webhooksRes.json();
        setWebhooks(data.webhooks);
      }
      
      if (integrationsRes.ok) {
        const data = await integrationsRes.json();
        setIntegrations(data.integrations);
      }
      
      if (apiKeysRes.ok) {
        const data = await apiKeysRes.json();
        setApiKeys(data.api_keys);
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
        <Typography variant="h4">Webhook Management</Typography>
        <Button variant="contained" startIcon={<Refresh />} onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Webhooks</Typography>
              <Typography variant="h3">{webhooks.length}</Typography>
              <Typography variant="body2" color="textSecondary">Active webhooks</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Integrations</Typography>
              <Typography variant="h3">{integrations.length}</Typography>
              <Typography variant="body2" color="textSecondary">Connected services</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>API Keys</Typography>
              <Typography variant="h3">{apiKeys.length}</Typography>
              <Typography variant="body2" color="textSecondary">Active keys</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Webhooks</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>URL</TableCell>
                      <TableCell>Events</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Triggered</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {webhooks.slice(0, 5).map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell>{webhook.url}</TableCell>
                        <TableCell>{webhook.events.join(', ')}</TableCell>
                        <TableCell>
                          <Chip label={webhook.status} color="success" size="small" />
                        </TableCell>
                        <TableCell>{new Date(webhook.last_triggered).toLocaleDateString()}</TableCell>
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

export default WebhookManagement;
