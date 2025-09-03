import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  SmartToy,
  AttachMoney,
  Warning,
  CheckCircle,
  Block,
  Email,
  Timeline,
  Analytics as AnalyticsIcon,
  PieChart,
  BarChart,
  ShowChart,
  CloudDownload,
  Refresh,
  FilterList,
  Info,
  Send,
  CreditCard,
  Business,
  Visibility
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import { format } from 'date-fns';
import api from '../../services/api';

// Color palette
const COLORS = {
  openai: '#74AA9C',
  google: '#4285F4',
  perplexity: '#8B5CF6',
  anthropic: '#FF6B6B',
  other: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  primary: '#000000'
};

// Bot company colors
const BOT_COLORS = {
  'OpenAI/ChatGPT': COLORS.openai,
  'Google AI/Bard': COLORS.google,
  'Perplexity AI': COLORS.perplexity,
  'Claude/Anthropic': COLORS.anthropic,
  'Other AI Bots': COLORS.other
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => {
  const isPositive = change >= 0;
  
  return (
    <Card elevation={1} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color ? `${color}20` : '#f5f5f5',
              borderRadius: 2,
              p: 1.5
            }}
          >
            <Icon sx={{ fontSize: 32, color: color || 'primary.main' }} />
          </Box>
        </Box>
        
        {change !== undefined && (
          <Box display="flex" alignItems="center" mt={2}>
            {isPositive ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={isPositive ? 'success.main' : 'error.main'}
              ml={0.5}
            >
              {isPositive ? '+' : ''}{change}%
            </Typography>
            <Typography variant="body2" color="text.secondary" ml={1}>
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Bot Detection Timeline Component
const BotDetectionTimeline = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12 }}
          tickFormatter={(time) => format(new Date(time), 'HH:mm')}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 8
          }}
        />
        <Legend />
        {Object.keys(BOT_COLORS).map((company) => (
          <Line
            key={company}
            type="monotone"
            dataKey={company}
            stroke={BOT_COLORS[company]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Revenue by Company Chart
const RevenueByCompany = ({ data }) => {
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={BOT_COLORS[entry.name] || COLORS.other} />
          ))}
        </Pie>
        <RechartsTooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 8
          }}
          formatter={(value) => `$${value.toLocaleString()}`}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

// Detection Methods Radar Chart
const DetectionMethodsRadar = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e0e0e0" />
        <PolarAngleAxis dataKey="method" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="Effectiveness"
          dataKey="effectiveness"
          stroke={COLORS.primary}
          fill={COLORS.primary}
          fillOpacity={0.6}
        />
        <Radar
          name="Usage"
          dataKey="usage"
          stroke={COLORS.success}
          fill={COLORS.success}
          fillOpacity={0.6}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

// Company Outreach Status Component
const CompanyOutreachStatus = ({ outreachData, onSendFollowUp }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Contact</TableCell>
            <TableCell>Response</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {outreachData.map((company) => (
            <TableRow key={company.id}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Business sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight="medium">
                    {company.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={company.status}
                  size="small"
                  color={
                    company.status === 'converted' ? 'success' :
                    company.status === 'responded' ? 'info' :
                    company.status === 'sent' ? 'warning' :
                    'default'
                  }
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {format(new Date(company.lastContact), 'MMM d, yyyy')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {company.response || '-'}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Send Follow-up">
                  <IconButton
                    size="small"
                    onClick={() => onSendFollowUp(company)}
                    disabled={company.status === 'converted'}
                  >
                    <Send fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Details">
                  <IconButton size="small">
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Main LLM Bot Analytics Component
const LLMBotAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [followUpDialog, setFollowUpDialog] = useState(false);
  const [selectedOutreach, setSelectedOutreach] = useState(null);
  
  useEffect(() => {
    fetchAnalyticsData();
    // Set up real-time updates
    const interval = setInterval(fetchAnalyticsData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange, selectedCompany]);
  
  const fetchAnalyticsData = async () => {
    try {
      const response = await api.get('/api/analytics/llm-bots', {
        params: {
          timeRange,
          company: selectedCompany !== 'all' ? selectedCompany : undefined
        }
      });
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to fetch LLM bot analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendFollowUp = (company) => {
    setSelectedOutreach(company);
    setFollowUpDialog(true);
  };
  
  const sendFollowUpEmail = async () => {
    try {
      await api.post('/api/credits/company-outreach', {
        company_name: selectedOutreach.name,
        message_type: 'follow_up',
        previous_outreach_id: selectedOutreach.id
      });
      
      setFollowUpDialog(false);
      fetchAnalyticsData(); // Refresh data
    } catch (error) {
      console.error('Failed to send follow-up:', error);
    }
  };
  
  if (loading || !analyticsData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  const {
    summary,
    timeline,
    revenueByCompany,
    detectionMethods,
    outreachStatus,
    topDetections,
    conversionFunnel
  } = analyticsData;
  
  return (
    <Box>
      {/* Header with Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          LLM Bot Detection Analytics
        </Typography>
        
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Company</InputLabel>
            <Select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              label="Company"
            >
              <MenuItem value="all">All Companies</MenuItem>
              {Object.keys(BOT_COLORS).map((company) => (
                <MenuItem key={company} value={company}>
                  {company}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            startIcon={<Refresh />}
            onClick={fetchAnalyticsData}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Detections"
            value={summary.totalDetections.toLocaleString()}
            change={summary.detectionChange}
            icon={SmartToy}
            color={COLORS.primary}
            subtitle={`${summary.uniqueCompanies} unique companies`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Credits Sold"
            value={summary.creditsSold.toLocaleString()}
            change={summary.creditChange}
            icon={CreditCard}
            color={COLORS.success}
            subtitle={`$${summary.revenue.toLocaleString()} revenue`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversion Rate"
            value={`${summary.conversionRate}%`}
            change={summary.conversionChange}
            icon={TrendingUp}
            color={COLORS.warning}
            subtitle="Bot to customer"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Response Time"
            value={`${summary.avgResponseTime}ms`}
            change={summary.responseTimeChange}
            icon={Timeline}
            color={COLORS.perplexity}
            subtitle="Detection latency"
          />
        </Grid>
      </Grid>
      
      {/* Detection Timeline and Revenue Charts */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Detection Timeline
            </Typography>
            <BotDetectionTimeline data={timeline} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue by Company
            </Typography>
            <RevenueByCompany data={revenueByCompany} />
          </Paper>
        </Grid>
      </Grid>
      
      {/* Detection Methods and Top Detections */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Detection Method Effectiveness
            </Typography>
            <DetectionMethodsRadar data={detectionMethods} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Bot Detections (Last 24h)
            </Typography>
            <List>
              {topDetections.map((detection, index) => (
                <ListItem key={index} divider={index < topDetections.length - 1}>
                  <ListItemIcon>
                    <SmartToy sx={{ color: BOT_COLORS[detection.company] }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={detection.company}
                    secondary={`${detection.count} detections - ${detection.confidence}% avg confidence`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={detection.status}
                      size="small"
                      color={detection.status === 'credited' ? 'success' : 'warning'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Conversion Funnel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Conversion Funnel
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {conversionFunnel.map((stage, index) => (
            <React.Fragment key={stage.name}>
              <Grid item xs={12} sm={2}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold">
                    {stage.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stage.name}
                  </Typography>
                  {stage.rate && (
                    <Chip
                      label={`${stage.rate}%`}
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              </Grid>
              {index < conversionFunnel.length - 1 && (
                <Grid item xs={12} sm={1}>
                  <Box display="flex" justifyContent="center">
                    <ArrowForward color="action" />
                  </Box>
                </Grid>
              )}
            </React.Fragment>
          ))}
        </Grid>
      </Paper>
      
      {/* Company Outreach Status */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Company Outreach Status
          </Typography>
          <Button
            startIcon={<Email />}
            variant="outlined"
            size="small"
            onClick={() => {/* Implement bulk email */}}
          >
            Bulk Outreach
          </Button>
        </Box>
        
        <CompanyOutreachStatus
          outreachData={outreachStatus}
          onSendFollowUp={handleSendFollowUp}
        />
      </Paper>
      
      {/* Follow-up Dialog */}
      <Dialog
        open={followUpDialog}
        onClose={() => setFollowUpDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Follow-up Email</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Sending follow-up to: <strong>{selectedOutreach?.name}</strong>
          </Alert>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Additional message (optional)..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFollowUpDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={sendFollowUpEmail}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            Send Follow-up
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LLMBotAnalytics;
