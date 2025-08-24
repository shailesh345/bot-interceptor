import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Security,
  Warning,
  CheckCircle,
  Error,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';

const AdvancedSecurity = () => {
  const [loading, setLoading] = useState(true);
  const [threatSummary, setThreatSummary] = useState(null);
  const [securityPolicies, setSecurityPolicies] = useState(null);
  const [securityIncidents, setSecurityIncidents] = useState([]);
  const [securityMetrics, setSecurityMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch all security data
      const [threatRes, policiesRes, incidentsRes, metricsRes] = await Promise.all([
        fetch('/api/advanced-security/threat-summary'),
        fetch('/api/advanced-security/security-policies'),
        fetch('/api/advanced-security/security-incidents'),
        fetch('/api/advanced-security/security-metrics')
      ]);

      if (threatRes.ok) {
        const threatData = await threatRes.json();
        setThreatSummary(threatData.threat_summary);
      }

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setSecurityPolicies(policiesData.policies);
      }

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        setSecurityIncidents(incidentsData.incidents);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setSecurityMetrics(metricsData.security_metrics);
      }

    } catch (err) {
      setError('Failed to fetch security data');
      console.error('Error fetching security data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getThreatLevelIcon = (level) => {
    switch (level) {
      case 'critical': return <Error color="error" />;
      case 'high': return <Warning color="warning" />;
      case 'medium': return <Warning color="info" />;
      case 'low': return <CheckCircle color="success" />;
      default: return <Security />;
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Advanced Security Dashboard
      </Typography>

      {/* Threat Summary */}
      {threatSummary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Threat Intelligence Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {threatSummary.threat_level.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Current Threat Level
                  </Typography>
                  {getThreatLevelIcon(threatSummary.threat_level)}
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="error">
                    {threatSummary.total_threats_detected}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Threats Detected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning">
                    {threatSummary.blocked_ips}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Blocked IPs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success">
                    {threatSummary.mitigated_attacks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Mitigated Attacks
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Security Policies */}
      {securityPolicies && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Policies
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1">Rate Limiting</Typography>
                  <Chip 
                    label={securityPolicies.rate_limiting.enabled ? 'Enabled' : 'Disabled'}
                    color={securityPolicies.rate_limiting.enabled ? 'success' : 'error'}
                    size="small"
                  />
                  {securityPolicies.rate_limiting.enabled && (
                    <Typography variant="body2" color="textSecondary">
                      {securityPolicies.rate_limiting.requests_per_minute} req/min
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1">IP Blocking</Typography>
                  <Chip 
                    label={securityPolicies.ip_blocking.enabled ? 'Enabled' : 'Disabled'}
                    color={securityPolicies.ip_blocking.enabled ? 'success' : 'error'}
                    size="small"
                  />
                  {securityPolicies.ip_blocking.enabled && (
                    <Typography variant="body2" color="textSecondary">
                      Threshold: {securityPolicies.ip_blocking.auto_block_threshold}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle1">Anomaly Detection</Typography>
                  <Chip 
                    label={securityPolicies.anomaly_detection.enabled ? 'Enabled' : 'Disabled'}
                    color={securityPolicies.anomaly_detection.enabled ? 'success' : 'error'}
                    size="small"
                  />
                  {securityPolicies.anomaly_detection.enabled && (
                    <Typography variant="body2" color="textSecondary">
                      Sensitivity: {securityPolicies.anomaly_detection.sensitivity}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Security Incidents */}
      {securityIncidents.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Incidents
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Chip 
                          label={incident.type.replace('_', ' ')}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={incident.severity}
                          size="small"
                          color={incident.severity === 'critical' ? 'error' : 
                                 incident.severity === 'high' ? 'warning' : 'info'}
                        />
                      </TableCell>
                      <TableCell>{incident.description}</TableCell>
                      <TableCell>
                        <Chip 
                          label={incident.status}
                          size="small"
                          color={incident.status === 'active' ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(incident.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Security Metrics */}
      {securityMetrics && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Threat Detection
                </Typography>
                <Box>
                  <Typography variant="body2">
                    Total Threats: {securityMetrics.threat_detection.total_threats}
                  </Typography>
                  <Typography variant="body2">
                    Blocked IPs: {securityMetrics.threat_detection.blocked_ips}
                  </Typography>
                  <Typography variant="body2">
                    Mitigated Attacks: {securityMetrics.threat_detection.mitigated_attacks}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Response Times
                </Typography>
                <Box>
                  <Typography variant="body2">
                    Avg Detection: {securityMetrics.response_times.average_detection_time}s
                  </Typography>
                  <Typography variant="body2">
                    Avg Response: {securityMetrics.response_times.average_response_time}s
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Coverage
                </Typography>
                <Box>
                  <Typography variant="body2">
                    Traffic Analyzed: {securityMetrics.coverage.traffic_analyzed}%
                  </Typography>
                  <Typography variant="body2">
                    Endpoints Protected: {securityMetrics.coverage.endpoints_protected}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdvancedSecurity;
