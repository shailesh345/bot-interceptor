import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Security, Refresh, Shield } from '@mui/icons-material';

const SecurityManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mfaStatus, setMfaStatus] = useState(null);
  const [roles, setRoles] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mfaRes, rolesRes, logsRes] = await Promise.all([
        fetch('/api/security/mfa/status', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/security/roles', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/security/logs', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (mfaRes.ok) {
        const data = await mfaRes.json();
        setMfaStatus(data.mfa_status);
      }
      
      if (rolesRes.ok) {
        const data = await rolesRes.json();
        setRoles(data.roles);
      }
      
      if (logsRes.ok) {
        const data = await logsRes.json();
        setSecurityLogs(data.security_logs);
      }
    } catch (err) {
      setError('Failed to fetch security data');
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
        <Typography variant="h4">Security Management</Typography>
        <Button variant="contained" startIcon={<Refresh />} onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>MFA Status</Typography>
              <Chip 
                label={mfaStatus?.enabled ? 'Enabled' : 'Disabled'} 
                color={mfaStatus?.enabled ? 'success' : 'default'} 
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Roles</Typography>
              <Typography variant="h3">{roles.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Security Events</Typography>
              <Typography variant="h3">{securityLogs.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Security Logs</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityLogs.slice(0, 10).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.event_type}</TableCell>
                        <TableCell>{log.user_email}</TableCell>
                        <TableCell>{log.ip_address}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
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

export default SecurityManagement;
