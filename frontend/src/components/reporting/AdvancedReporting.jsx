import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, BarChart as BarChartIcon, PieChart as PieChartIcon, Download } from '@mui/icons-material';

const AdvancedReporting = () => {
  const [customDashboard, setCustomDashboard] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [segmentationData, setSegmentationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardDialog, setDashboardDialog] = useState(false);
  const [dashboardName, setDashboardName] = useState('');

  useEffect(() => {
    fetchTrendAnalytics();
    fetchSegmentationAnalytics();
  }, []);

  const fetchTrendAnalytics = async () => {
    try {
      const response = await fetch('/api/reporting/analytics/trends?days=30', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrendData(data);
      }
    } catch (error) {
      console.error('Error fetching trend analytics:', error);
    }
  };

  const fetchSegmentationAnalytics = async () => {
    try {
      const response = await fetch('/api/reporting/analytics/segmentation', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSegmentationData(data);
      }
    } catch (error) {
      console.error('Error fetching segmentation analytics:', error);
    }
  };

  const createCustomDashboard = async () => {
    if (!dashboardName.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/reporting/dashboard/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: dashboardName })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomDashboard(data.dashboard);
        setDashboardDialog(false);
        setDashboardName('');
      }
    } catch (error) {
      console.error('Error creating dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderTrendCharts = () => {
    if (!trendData) return null;

    const chartData = trendData.traffic_trends.dates.map((date, index) => ({
      date,
      total: trendData.traffic_trends.total_traffic[index],
      bots: trendData.traffic_trends.bot_traffic[index]
    }));

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Traffic Trends (30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Traffic" />
                  <Line type="monotone" dataKey="bots" stroke="#82ca9d" name="Bot Traffic" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Traffic Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Total Traffic" />
                  <Bar dataKey="bots" fill="#82ca9d" name="Bot Traffic" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderSegmentationCharts = () => {
    if (!segmentationData) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                User Segments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={segmentationData.user_segments.segments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {segmentationData.user_segments.segments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Traffic Segments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={segmentationData.traffic_segments.segments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {segmentationData.traffic_segments.segments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary Statistics
              </Typography>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Total Users: {segmentationData.user_segments.total_users.toLocaleString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Total Traffic: {segmentationData.traffic_segments.total_traffic.toLocaleString()}
                </Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    User Segments:
                  </Typography>
                  {segmentationData.user_segments.segments.map((segment, index) => (
                    <Chip
                      key={segment.name}
                      label={`${segment.name}: ${segment.count}`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      color={index === 0 ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
                        <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Advanced Reporting & Analytics
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Create custom dashboards, analyze trends, and segment your data for deeper insights.
      </Typography>

      {/* Custom Dashboard Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Custom Dashboard
            </Typography>
            <Button
              variant="contained"
              onClick={() => setDashboardDialog(true)}
            >
              Create Dashboard
            </Button>
          </Box>
          
          {customDashboard ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Dashboard: {customDashboard.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Created: {new Date(customDashboard.created_at).toLocaleDateString()}
              </Typography>
              <Chip label="Active" color="success" size="small" sx={{ mt: 1 }} />
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No custom dashboard created yet. Create one to get started.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Trend Analytics */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Trend Analytics
      </Typography>
      {renderTrendCharts()}

      {/* Segmentation Analytics */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Segmentation Analysis
      </Typography>
      {renderSegmentationCharts()}

      {/* Create Dashboard Dialog */}
      <Dialog open={dashboardDialog} onClose={() => setDashboardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Custom Dashboard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Dashboard Name"
            fullWidth
            variant="outlined"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            placeholder="Enter dashboard name..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDashboardDialog(false)}>Cancel</Button>
          <Button 
            onClick={createCustomDashboard} 
            variant="contained"
            disabled={loading || !dashboardName.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Dashboard'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedReporting;
