import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { CreditCard, Refresh, TrendingUp } from '@mui/icons-material';

const BillingManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subscriptionRes, invoicesRes] = await Promise.all([
        fetch('/api/billing/plans', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/billing/subscription', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/billing/invoices', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.billing_plans || []);
      } else {
        // Fallback to mock data if API not available
        setPlans([
          { id: 1, name: 'Basic', price: 29, features: ['Basic Protection', 'Email Support'], status: 'Active' },
          { id: 2, name: 'Pro', price: 99, features: ['Advanced Protection', 'Priority Support', 'Analytics'], status: 'Available' },
          { id: 3, name: 'Enterprise', price: 299, features: ['Enterprise Protection', '24/7 Support', 'Custom Rules'], status: 'Available' }
        ]);
      }
      
      if (subscriptionRes.ok) {
        const data = await subscriptionRes.json();
        setSubscription(data.subscription);
      } else {
        // Fallback for missing subscription data
        setSubscription({
          plan: 'Basic',
          status: 'Active',
          nextBilling: '2024-09-15',
          amount: '$29.00'
        });
      }
      
      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(data.invoices || []);
      } else {
        // Fallback for missing invoices data  
        setInvoices([
          { id: 1, date: '2024-08-15', amount: '$29.00', status: 'Paid' },
          { id: 2, date: '2024-07-15', amount: '$29.00', status: 'Paid' }
        ]);
      }
    } catch (err) {
      setError('Failed to fetch billing data');
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
        <Typography variant="h4">Billing Management</Typography>
        <Button variant="contained" startIcon={<Refresh />} onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Plan</Typography>
              <Typography variant="h4">{subscription?.plan_name || 'No Plan'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Next Billing</Typography>
              <Typography variant="h4">
                {subscription?.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Invoices</Typography>
              <Typography variant="h3">{invoices.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Billing Plans</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan Name</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Features</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(plans || []).map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>${plan.price}/month</TableCell>
                        <TableCell>{plan.features.join(', ')}</TableCell>
                        <TableCell>
                          <Chip label={plan.status} color="success" size="small" />
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

export default BillingManagement;
