import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { Add, Refresh, Webhook, Settings } from '@mui/icons-material';

const WebhookManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [], secret: '' });

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

  const createWebhook = async () => {
    try {
      const response = await fetch('/api/webhook-management/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newWebhook)
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks([...webhooks, data.webhook]);
        setCreateDialog(false);
        setNewWebhook({ name: '', url: '', events: [], secret: '' });
      }
    } catch (err) {
      console.error('Error creating webhook:', err);
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
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setCreateDialog(true)}
                sx={{ mt: 2 }}
              >
                Create Webhook
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Integrations</Typography>
              <Typography variant="h3">{integrations.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Connected Services
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>API Keys</Typography>
              <Typography variant="h3">{apiKeys.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Active Keys
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Webhook List</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>URL</TableCell>
                      <TableCell>Events</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {webhooks.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell>{webhook.name}</TableCell>
                        <TableCell>{webhook.url}</TableCell>
                        <TableCell>{webhook.events.join(', ')}</TableCell>
                        <TableCell>
                          <Chip label={webhook.status} color="success" size="small" />
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

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Webhook</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newWebhook.name}
            onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="URL"
            value={newWebhook.url}
            onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Secret"
            value={newWebhook.secret}
            onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={createWebhook} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebhookManagement;
