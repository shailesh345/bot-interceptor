import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Business,
  Search,
  FilterList,
  MoreVert,
  Email,
  CreditCard,
  Timeline,
  AttachMoney,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Send,
  History,
  Edit,
  Visibility,
  Block,
  Check,
  SmartToy,
  CalendarToday,
  AccessTime,
  Download,
  Refresh,
  Add,
  ArrowUpward,
  ArrowDownward,
  Star
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import { creditAPI, outreachAPI } from '../services/llmBotAPI';
import { toast } from 'react-hot-toast';

// Company Status Component
const CompanyStatus = ({ status }) => {
  const statusConfig = {
    active: { color: 'success', label: 'Active' },
    pending: { color: 'warning', label: 'Pending' },
    suspended: { color: 'error', label: 'Suspended' },
    verified: { color: 'info', label: 'Verified' }
  };
  
  const config = statusConfig[status] || { color: 'default', label: status };
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
    />
  );
};

// Credit Balance Display
const CreditBalanceDisplay = ({ balance }) => {
  const percentage = balance.total_credits > 0 
    ? (balance.remaining_credits / balance.total_credits) * 100 
    : 0;
  
  const color = percentage > 50 ? 'success' : percentage > 20 ? 'warning' : 'error';
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2" color="text.secondary">
          Credits
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {balance.remaining_credits?.toLocaleString()} / {balance.total_credits?.toLocaleString()}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        color={color}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

// Company Details Dialog
const CompanyDetailsDialog = ({ open, onClose, company, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creditHistory, setCreditHistory] = useState([]);
  const [outreachHistory, setOutreachHistory] = useState([]);
  
  useEffect(() => {
    if (open && company) {
      loadCompanyDetails();
    }
  }, [open, company]);
  
  const loadCompanyDetails = async () => {
    setLoading(true);
    try {
      // Load credit history
      const creditResponse = await creditAPI.getUsage(company.id);
      setCreditHistory(creditResponse.recent_usage || []);
      
      // Load outreach history
      const outreachResponse = await outreachAPI.getOutreachStatus({
        company_id: company.id
      });
      setOutreachHistory(outreachResponse.history || []);
    } catch (error) {
      console.error('Failed to load company details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendEmail = async (type) => {
    try {
      await outreachAPI.sendOutreach({
        company_name: company.name,
        message_type: type,
        company_id: company.id
      });
      
      toast.success(`${type} email sent successfully`);
      loadCompanyDetails();
      onUpdate();
    } catch (error) {
      toast.error('Failed to send email');
    }
  };
  
  if (!company) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Business />
            </Avatar>
            <Box>
              <Typography variant="h6">{company.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {company.email}
              </Typography>
            </Box>
          </Box>
          <CompanyStatus status={company.status} />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Credit History" />
          <Tab label="Outreach History" />
          <Tab label="Detection Logs" />
        </Tabs>
        
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Business /></ListItemIcon>
                      <ListItemText 
                        primary="Company Type"
                        secondary={company.company_type || 'Unknown'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText 
                        primary="Contact Email"
                        secondary={company.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarToday /></ListItemIcon>
                      <ListItemText 
                        primary="First Detected"
                        secondary={format(new Date(company.created_at), 'PPP')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SmartToy /></ListItemIcon>
                      <ListItemText 
                        primary="Bot Detections"
                        secondary={`${company.detection_count || 0} total detections`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Credit Balance
                  </Typography>
                  <CreditBalanceDisplay balance={company.credit_balance || {}} />
                  
                  <Box mt={3}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Revenue Generated
                    </Typography>
                    <Typography variant="h4" color="primary">
                      ${company.total_revenue?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                  
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      startIcon={<CreditCard />}
                      fullWidth
                    >
                      View Purchase History
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      startIcon={<Email />}
                      onClick={() => handleSendEmail('follow_up')}
                      sx={{
                        backgroundColor: '#000',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#333' }
                      }}
                    >
                      Send Follow-up
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Send />}
                      onClick={() => handleSendEmail('special_offer')}
                    >
                      Send Special Offer
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Block />}
                      color="error"
                    >
                      Suspend Access
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell align="right">Credits</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {creditHistory.map((purchase, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {format(new Date(purchase.purchased_at), 'PP')}
                    </TableCell>
                    <TableCell>{purchase.package_name}</TableCell>
                    <TableCell align="right">
                      {purchase.credits.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ${purchase.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={purchase.status} 
                        size="small"
                        color={purchase.status === 'completed' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {activeTab === 2 && (
          <List>
            {outreachHistory.map((outreach, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  <Email color={outreach.status === 'sent' ? 'primary' : 'action'} />
                </ListItemIcon>
                <ListItemText
                  primary={outreach.message_type}
                  secondary={`Sent on ${format(new Date(outreach.sent_at), 'PPp')}`}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={outreach.response_type || 'No response'}
                    size="small"
                    color={outreach.response_type === 'positive' ? 'success' : 'default'}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
        
        {activeTab === 3 && (
          <Alert severity="info">
            Detection logs coming soon...
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Company Management Component
const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0,
    conversion_rate: 0
  });
  
  useEffect(() => {
    loadCompanies();
    loadStats();
  }, [page, rowsPerPage, filterStatus]);
  
  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/companies', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search: searchTerm,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Failed to load companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const response = await api.get('/api/companies/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadCompanies();
  };
  
  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
  };
  
  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedCompany(null);
    loadCompanies(); // Refresh data
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          AI Company Management
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            '&:hover': { backgroundColor: '#333' }
          }}
        >
          Add Company
        </Button>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Companies
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Business sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Customers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.active}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ${stats.revenue.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.conversion_rate}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#333' }
                  }}
                >
                  Search
                </Button>
                <IconButton onClick={loadCompanies}>
                  <Refresh />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Companies Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">
                      No companies found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {company.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {company.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.company_type || 'Other'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <CompanyStatus status={company.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {company.credit_balance?.remaining_credits?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        ${company.total_revenue?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {company.last_activity 
                          ? format(new Date(company.last_activity), 'PP')
                          : '-'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(company)}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Email />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={stats.total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
      
      {/* Company Details Dialog */}
      <CompanyDetailsDialog
        open={detailsOpen}
        onClose={handleDetailsClose}
        company={selectedCompany}
        onUpdate={loadCompanies}
      />
    </Container>
  );
};

export default CompanyManagement;
