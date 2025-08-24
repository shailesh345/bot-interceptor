import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  CreditCard,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  TrendingUp,
  Storage,
  Speed
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly',
    features: {
      domains: 1,
      requests_per_month: 10000,
      storage_gb: 1,
      support_level: 'basic'
    },
    is_active: true
  });

  const billingCycles = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' }
  ];

  const supportLevels = [
    { value: 'basic', label: 'Basic' },
    { value: 'priority', label: 'Priority' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
    fetchUsage();
    fetchInvoices();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        toast.error('Failed to fetch billing plans');
      }
    } catch (error) {
      toast.error('Error fetching billing plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/billing/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/billing/invoices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingPlan 
        ? `/api/billing/plans/${editingPlan.id}`
        : '/api/billing/plans';
      
      const method = editingPlan ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
        setOpenPlanDialog(false);
        setEditingPlan(null);
        resetForm();
        fetchPlans();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save plan');
      }
    } catch (error) {
      toast.error('Error saving plan');
    }
  };

  const handleSubscription = async (planId) => {
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan_id: planId })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Subscription created successfully');
        setOpenSubscriptionDialog(false);
        fetchSubscription();
        fetchUsage();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create subscription');
      }
    } catch (error) {
      toast.error('Error creating subscription');
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      const response = await fetch('/api/billing/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast.success('Subscription canceled successfully');
        fetchSubscription();
      } else {
        toast.error('Failed to cancel subscription');
      }
    } catch (error) {
      toast.error('Error canceling subscription');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      billing_cycle: 'monthly',
      features: {
        domains: 1,
        requests_per_month: 10000,
        storage_gb: 1,
        support_level: 'basic'
      },
      is_active: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'past_due': return 'warning';
      case 'canceled': return 'error';
      case 'incomplete': return 'info';
      default: return 'default';
    }
  };

  const renderPlansTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Billing Plans
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenPlanDialog(true)}
        >
          Add Plan
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    ${plan.price}
                    <Typography variant="body2" component="span">
                      /{plan.billing_cycle}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {plan.description}
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Features:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          • {plan.features.domains} Domains
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          • {plan.features.requests_per_month.toLocaleString()} Requests/Month
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          • {plan.features.storage_gb}GB Storage
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          • {plan.features.support_level} Support
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSubscription(plan.id)}
                      disabled={subscription?.has_subscription}
                    >
                      Subscribe
                    </Button>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderSubscriptionTab = () => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Current Subscription
      </Typography>

      {subscription?.has_subscription ? (
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Plan Details
                </Typography>
                <Typography variant="body1">
                  <strong>Plan:</strong> {subscription.plan?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Price:</strong> ${subscription.plan?.price}/{subscription.plan?.billing_cycle}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> 
                  <Chip 
                    label={subscription.subscription.status} 
                    color={getStatusColor(subscription.subscription.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body1">
                  <strong>Next Billing:</strong> {new Date(subscription.subscription.current_period_end).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCancelSubscription}
                  sx={{ mr: 1 }}
                >
                  Cancel Subscription
                </Button>
                <Button variant="outlined">
                  Change Plan
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info">
          You don't have an active subscription. Please choose a plan to get started.
        </Alert>
      )}
    </Box>
  );

  const renderUsageTab = () => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Usage & Limits
      </Typography>

      {usage ? (
        <Grid container spacing={3}>
          {/* Usage Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Period Usage
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {usage.current_usage.domains || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Domains Used
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, ((usage.current_usage.domains || 0) / (usage.plan_limits.domains || 1)) * 100)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {(usage.current_usage.requests || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Requests This Month
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, ((usage.current_usage.requests || 0) / (usage.plan_limits.requests_per_month || 1)) * 100)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {usage.current_usage.storage_gb || 0}GB
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Storage Used
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, ((usage.current_usage.storage_gb || 0) / (usage.plan_limits.storage_gb || 1)) * 100)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {usage.current_usage.bandwidth_gb || 0}GB
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Bandwidth Used
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, ((usage.current_usage.bandwidth_gb || 0) / (usage.plan_limits.bandwidth_gb || 1)) * 100)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Usage Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usage Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="#8884d8" />
                    <Line type="monotone" dataKey="bandwidth" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );

  const renderInvoicesTab = () => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Billing History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.stripe_invoice_id}</TableCell>
                <TableCell>
                  ${invoice.amount} {invoice.currency}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.status} 
                    color={invoice.status === 'paid' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(invoice.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
        Billing & Subscription
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage your billing plans, subscriptions, and monitor usage to optimize your costs.
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Billing Plans" />
        <Tab label="Subscription" />
        <Tab label="Usage & Limits" />
        <Tab label="Invoices" />
      </Tabs>

      {activeTab === 0 && renderPlansTab()}
      {activeTab === 1 && renderSubscriptionTab()}
      {activeTab === 2 && renderUsageTab()}
      {activeTab === 3 && renderInvoicesTab()}

      {/* Add/Edit Plan Dialog */}
      <Dialog open={openPlanDialog} onClose={() => setOpenPlanDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlan ? 'Edit Billing Plan' : 'Add Billing Plan'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePlanSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Plan Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price (USD)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Billing Cycle</InputLabel>
                  <Select
                    value={formData.billing_cycle}
                    onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                    label="Billing Cycle"
                  >
                    {billingCycles.map((cycle) => (
                      <MenuItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Plan Features
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Domains"
                  type="number"
                  value={formData.features.domains}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, domains: parseInt(e.target.value) }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Requests/Month"
                  type="number"
                  value={formData.features.requests_per_month}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, requests_per_month: parseInt(e.target.value) }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Storage (GB)"
                  type="number"
                  value={formData.features.storage_gb}
                  onChange={(e) => setFormData({
                    ...formData,
                    features: { ...formData.features, storage_gb: parseInt(e.target.value) }
                  })}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Support Level</InputLabel>
                  <Select
                    value={formData.features.support_level}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, support_level: e.target.value }
                    })}
                    label="Support Level"
                  >
                    {supportLevels.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        {level.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPlanDialog(false)}>Cancel</Button>
          <Button onClick={handlePlanSubmit} variant="contained">
            {editingPlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingManagement;
