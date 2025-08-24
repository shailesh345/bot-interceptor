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
  Tab
} from '@mui/material';
import {
  Shield,
  Add,
  Edit,
  Delete,
  Visibility,
  Block,
  CheckCircle,
  Warning,
  Error,
  Refresh
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-toastify';

const ContentProtection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [rules, setRules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rule_type: 'rate_limit',
    priority: 'medium',
    is_active: true,
    conditions: [],
    actions: []
  });

  const ruleTypes = [
    { value: 'rate_limit', label: 'Rate Limiting' },
    { value: 'content_fingerprint', label: 'Content Fingerprinting' },
    { value: 'anti_scraping', label: 'Anti-Scraping' },
    { value: 'geo_block', label: 'Geographic Blocking' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' },
    { value: 'critical', label: 'Critical', color: 'error' }
  ];

  useEffect(() => {
    fetchRules();
    fetchAnalytics();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content-protection/rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
      } else {
        toast.error('Failed to fetch protection rules');
      }
    } catch (error) {
      toast.error('Error fetching protection rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/content-protection/analytics?days=7', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingRule 
        ? `/api/content-protection/rules/${editingRule.id}`
        : '/api/content-protection/rules';
      
      const method = editingRule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success(editingRule ? 'Rule updated successfully' : 'Rule created successfully');
        setOpenDialog(false);
        setEditingRule(null);
        resetForm();
        fetchRules();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save rule');
      }
    } catch (error) {
      toast.error('Error saving rule');
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      const response = await fetch(`/api/content-protection/rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast.success('Rule deleted successfully');
        fetchRules();
      } else {
        toast.error('Failed to delete rule');
      }
    } catch (error) {
      toast.error('Error deleting rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      rule_type: rule.rule_type,
      priority: rule.priority,
      is_active: rule.is_active,
      conditions: rule.conditions,
      actions: rule.actions
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rule_type: 'rate_limit',
      priority: 'medium',
      is_active: true,
      conditions: [],
      actions: []
    });
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'default';
  };

  const getRuleTypeLabel = (type) => {
    const typeObj = ruleTypes.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const renderRulesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Protection Rules
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Rule
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{rule.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {rule.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getRuleTypeLabel(rule.rule_type)} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={rule.priority} 
                      color={getPriorityColor(rule.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={rule.is_active ? 'Active' : 'Inactive'} 
                      color={rule.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(rule.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(rule)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(rule.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Protection Analytics
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={fetchAnalytics}
        >
          Refresh
        </Button>
      </Box>

      {analytics ? (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h4">
                  {analytics.summary.total_requests.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Allowed Requests
                </Typography>
                <Typography variant="h4" color="success.main">
                  {analytics.summary.allowed_requests.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Blocked Requests
                </Typography>
                <Typography variant="h4" color="error.main">
                  {analytics.summary.blocked_requests.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Block Rate
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {analytics.summary.block_rate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Blocked IPs
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.top_blocked_ips}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ip" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f44336" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Blocked User Agents
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.top_blocked_user_agents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="user_agent" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ff9800" />
                  </BarChart>
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

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
        Content Protection
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage content protection rules and monitor protection analytics to safeguard your content from scraping and abuse.
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Protection Rules" />
        <Tab label="Analytics" />
      </Tabs>

      {activeTab === 0 && renderRulesTab()}
      {activeTab === 1 && renderAnalyticsTab()}

      {/* Add/Edit Rule Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Protection Rule' : 'Add Protection Rule'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rule Name"
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
                <FormControl fullWidth>
                  <InputLabel>Rule Type</InputLabel>
                  <Select
                    value={formData.rule_type}
                    onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                    label="Rule Type"
                  >
                    {ruleTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    label="Priority"
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
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
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentProtection;
