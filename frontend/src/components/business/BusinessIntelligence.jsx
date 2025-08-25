import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { TrendingUp, Refresh, Analytics } from '@mui/icons-material';

const BusinessIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [forecasts, setForecasts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revenueRes, customersRes, forecastsRes] = await Promise.all([
        fetch('/api/business-intelligence/revenue', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/business-intelligence/customers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/business-intelligence/forecasting', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (revenueRes.ok) {
        const data = await revenueRes.json();
        setRevenue(data.revenue);
      }
      
      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomers(data.customers);
      }
      
      if (forecastsRes.ok) {
        const data = await forecastsRes.json();
        setForecasts(data.forecasts);
      }
    } catch (err) {
      setError('Failed to fetch business intelligence data');
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
        <Typography variant="h4">Business Intelligence</Typography>
        <Button variant="contained" startIcon={<Refresh />} onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Revenue</Typography>
              <Typography variant="h3">${revenue?.monthly_revenue || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Customers</Typography>
              <Typography variant="h3">{customers?.total_customers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Growth Rate</Typography>
              <Typography variant="h3">{revenue?.growth_rate || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Revenue Forecasts</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Predicted Revenue</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Trend</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {forecasts.map((forecast) => (
                      <TableRow key={forecast.id}>
                        <TableCell>{forecast.period}</TableCell>
                        <TableCell>${forecast.predicted_revenue}</TableCell>
                        <TableCell>{forecast.confidence}%</TableCell>
                        <TableCell>
                          <Chip label={forecast.trend} color="success" size="small" />
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

export default BusinessIntelligence;
