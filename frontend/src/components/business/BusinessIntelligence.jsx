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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Business,
  Assessment,
  Analytics,
  ShowChart
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const BusinessIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);
  const [forecastDialog, setForecastDialog] = useState(false);
  const [forecastType, setForecastType] = useState('traffic');
  const [forecastHorizon, setForecastHorizon] = useState('30d');
  const [forecasts, setForecasts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/business-intelligence/dashboard');
      if (response.ok) {
        const data = await response.json();
        setBusinessData(data);
      } else {
        setError('Failed to fetch business data');
      }
    } catch (err) {
      setError('Failed to fetch business data');
      console.error('Error fetching business data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecasts = async () => {
    try {
      const response = await fetch('/api/business-intelligence/forecasting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: forecastType,
          horizon: forecastHorizon
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setForecasts(data.forecasts);
      }
    } catch (err) {
      console.error('Error fetching forecasts:', err);
    }
  };

  const handleForecastSubmit = () => {
    fetchForecasts();
    setForecastDialog(false);
  };

  const getGrowthColor = (rate) => {
    return rate >= 0 ? 'success' : 'error';
  };

  const getGrowthIcon = (rate) => {
    return rate >= 0 ? <TrendingUp /> : <TrendingDown />;
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

  if (!businessData) {
    return (
      <Box p={3}>
        <Alert severity="info">No business data available</Alert>
      </Box>
    );
  }

  const { business_metrics, revenue_analytics, customer_insights, operational_metrics } = businessData;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Business Intelligence Dashboard
      </Typography>

      {/* Revenue Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Revenue Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  ${business_metrics.revenue.current_month.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Current Month
                </Typography>
                <Chip
                  icon={getGrowthIcon(business_metrics.revenue.growth_rate)}
                  label={`${business_metrics.revenue.growth_rate}%`}
                  color={getGrowthColor(business_metrics.revenue.growth_rate)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="secondary">
                  ${business_metrics.revenue.annual_recurring_revenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Annual Recurring Revenue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success">
                  {business_metrics.customers.total_customers}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Customers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info">
                  ${business_metrics.customers.customer_lifetime_value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Customer LTV
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Revenue Growth
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue_analytics.monthly_growth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1976d2" 
                strokeWidth={2}
                dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Insights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Insights
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Customer Satisfaction
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h3" color="success">
                  {customer_insights.customer_satisfaction.overall_score}
                </Typography>
                <Box>
                  <Typography variant="body2">
                    Support: {customer_insights.customer_satisfaction.support_rating}/5
                  </Typography>
                  <Typography variant="body2">
                    Product: {customer_insights.customer_satisfaction.product_rating}/5
                  </Typography>
                  <Typography variant="body2">
                    NPS: {customer_insights.customer_satisfaction.recommendation_score}/10
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Customer Segments
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(customer_insights.customer_segments).map(([key, value]) => ({
                      name: key.charAt(0).toUpperCase() + key.slice(1),
                      value: value.revenue_share
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(customer_insights.customer_segments).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Revenue Share']} />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Operational Metrics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Operational Excellence
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success">
                  {operational_metrics.efficiency.automation_rate}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Automation Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info">
                  {operational_metrics.scalability.scalability_score}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Scalability Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning">
                  {operational_metrics.quality.code_quality_score}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Code Quality
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {operational_metrics.quality.test_coverage}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Test Coverage
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Forecast Button */}
      <Box textAlign="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<ShowChart />}
          onClick={() => setForecastDialog(true)}
          size="large"
        >
          Generate Business Forecasts
        </Button>
      </Box>

      {/* Forecast Dialog */}
      <Dialog open={forecastDialog} onClose={() => setForecastDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Business Forecasts</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              select
              fullWidth
              label="Forecast Type"
              value={forecastType}
              onChange={(e) => setForecastType(e.target.value)}
              margin="normal"
            >
              <MenuItem value="traffic">Traffic Forecast</MenuItem>
              <MenuItem value="revenue">Revenue Forecast</MenuItem>
              <MenuItem value="customers">Customer Forecast</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Time Horizon"
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(e.target.value)}
              margin="normal"
            >
              <MenuItem value="7d">Next Week</MenuItem>
              <MenuItem value="30d">Next Month</MenuItem>
              <MenuItem value="90d">Next Quarter</MenuItem>
              <MenuItem value="365d">Next Year</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForecastDialog(false)}>Cancel</Button>
          <Button onClick={handleForecastSubmit} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Forecast Results */}
      {forecasts && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Forecast Results
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(forecasts).map(([key, value]) => (
                <Grid item xs={12} md={6} key={key}>
                  <Typography variant="subtitle1" gutterBottom>
                    {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}
                  </Typography>
                  {typeof value === 'object' ? (
                    <Box>
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <Typography key={subKey} variant="body2">
                          {subKey.replace('_', ' ')}: {subValue}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2">{value}</Typography>
                  )}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BusinessIntelligence;
