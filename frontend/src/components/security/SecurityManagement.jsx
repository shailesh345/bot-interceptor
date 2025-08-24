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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Shield,
  Lock,
  Key,
  Visibility,
  VisibilityOff,
  QrCode,
  Security,
  History,
  Warning,
  CheckCircle,
  Error,
  Info,
  ExpandMore,
  Refresh,
  Download,
  FilterList,
  Add,
  Edit,
  Delete
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const SecurityManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [roles, setRoles] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openMfaDialog, setOpenMfaDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [mfaSetup, setMfaSetup] = useState(null);
  const [mfaToken, setMfaToken] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const availablePermissions = [
    'users:read', 'users:write', 'users:delete',
    'domains:read', 'domains:write', 'domains:delete',
    'analytics:read', 'analytics:write',
    'billing:read', 'billing:write',
    'security:read', 'security:write',
    'ml:read', 'ml:write',
    'content_protection:read', 'content_protection:write'
  ];

  const severityColors = {
    info: 'default',
    warning: 'warning',
    error: 'error',
    critical: 'error'
  };

  useEffect(() => {
    fetchSecurityStatus();
    fetchRoles();
    fetchSecurityLogs();
    fetchAuditLogs();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch('/api/security/security/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecurityStatus(data);
      }
    } catch (error) {
      console.error('Error fetching security status:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/security/roles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const response = await fetch('/api/security/security/logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSecurityLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching security logs:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/security/audit/logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleMfaSetup = async () => {
    try {
      const response = await fetch('/api/security/mfa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMfaSetup(data);
        setOpenMfaDialog(true);
      } else {
        toast.error('Failed to setup MFA');
      }
    } catch (error) {
      toast.error('Error setting up MFA');
    }
  };

  const handleMfaVerify = async () => {
    if (!mfaToken) {
      toast.error('Please enter MFA token');
      return;
    }
    
    try {
      const response = await fetch('/api/security/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token: mfaToken })
      });
      
      if (response.ok) {
        toast.success('MFA enabled successfully');
        setOpenMfaDialog(false);
        setMfaToken('');
        setMfaSetup(null);
        fetchSecurityStatus();
      } else {
        toast.error('Invalid MFA token');
      }
    } catch (error) {
      toast.error('Error verifying MFA');
    }
  };

  const handleMfaDisable = async () => {
    if (!window.confirm('Are you sure you want to disable MFA? This will reduce your account security.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/security/mfa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast.success('MFA disabled successfully');
        fetchSecurityStatus();
      } else {
        toast.error('Failed to disable MFA');
      }
    } catch (error) {
      toast.error('Error disabling MFA');
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingRole 
        ? `/api/security/roles/${editingRole.id}`
        : '/api/security/roles';
      
      const method = editingRole ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
        setOpenRoleDialog(false);
        setEditingRole(null);
        resetForm();
        fetchRoles();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save role');
      }
    } catch (error) {
      toast.error('Error saving role');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
  };

  const renderSecurityOverviewTab = () => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Security Overview
      </Typography>

      {securityStatus ? (
        <Grid container spacing={3}>
          {/* MFA Status */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Multi-Factor Authentication
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Chip 
                    label={securityStatus.mfa_enabled ? 'Enabled' : 'Disabled'} 
                    color={securityStatus.mfa_enabled ? 'success' : 'default'}
                    icon={securityStatus.mfa_enabled ? <CheckCircle /> : <Warning />}
                  />
                </Box>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  {securityStatus.mfa_enabled 
                    ? 'Your account is protected with MFA. This adds an extra layer of security.'
                    : 'Enable MFA to add an extra layer of security to your account.'
                  }
                </Typography>
                
                <Box display="flex" gap={1}>
                  {!securityStatus.mfa_enabled ? (
                    <Button
                      variant="contained"
                      startIcon={<Key />}
                      onClick={handleMfaSetup}
                    >
                      Enable MFA
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleMfaDisable}
                    >
                      Disable MFA
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Password Security */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Password Security
                </Typography>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  Last changed: {securityStatus.last_password_change 
                    ? new Date(securityStatus.last_password_change).toLocaleDateString()
                    : 'Never'
                  }
                </Typography>
                
                <Button variant="outlined">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Security Events */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Security Events
                </Typography>
                
                <List>
                  {securityStatus.recent_security_events?.slice(0, 5).map((event, index) => (
                    <ListItem key={index} divider={index < 4}>
                      <ListItemIcon>
                        {event.severity === 'critical' || event.severity === 'error' ? (
                          <Error color="error" />
                        ) : event.severity === 'warning' ? (
                          <Warning color="warning" />
                        ) : (
                          <Info color="info" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        secondary={`${new Date(event.timestamp).toLocaleString()} - ${event.details?.reason || 'No details'}`}
                      />
                      <Chip 
                        label={event.severity} 
                        color={severityColors[event.severity] || 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
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

  const renderRolesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Role Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenRoleDialog(true)}
        >
          Create Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Role Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {role.name}
                  </Typography>
                </TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {role.permissions?.slice(0, 3).map((permission, index) => (
                      <Chip 
                        key={index}
                        label={permission} 
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {role.permissions?.length > 3 && (
                      <Chip 
                        label={`+${role.permissions.length - 3} more`} 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={role.is_active ? 'Active' : 'Inactive'} 
                    color={role.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderSecurityLogsTab = () => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Security Logs
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>User</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {securityLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                </TableCell>
                <TableCell>{log.user_id || 'System'}</TableCell>
                <TableCell>{log.ip_address}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.severity} 
                    color={severityColors[log.severity] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {JSON.stringify(log.details)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAuditLogsTab = () => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Audit Logs
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>User</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={log.action} 
                    color={log.action === 'delete' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                  </Typography>
                </TableCell>
                <TableCell>{log.user_id}</TableCell>
                <TableCell>{log.ip_address}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {JSON.stringify(log.details)}
                  </Typography>
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
        <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
        Security & Compliance
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage your account security, multi-factor authentication, roles, and monitor security events.
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Security Overview" />
        <Tab label="Role Management" />
        <Tab label="Security Logs" />
        <Tab label="Audit Logs" />
      </Tabs>

      {activeTab === 0 && renderSecurityOverviewTab()}
      {activeTab === 1 && renderRolesTab()}
      {activeTab === 2 && renderSecurityLogsTab()}
      {activeTab === 3 && renderAuditLogsTab()}

      {/* MFA Setup Dialog */}
      <Dialog open={openMfaDialog} onClose={() => setOpenMfaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Setup Multi-Factor Authentication</DialogTitle>
        <DialogContent>
          {mfaSetup && (
            <Box>
              <Typography variant="body1" paragraph>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
              </Typography>
              
              <Box display="flex" justifyContent="center" mb={2}>
                <img 
                  src={mfaSetup.qr_code} 
                  alt="MFA QR Code" 
                  style={{ width: 200, height: 200 }}
                />
              </Box>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                Or manually enter this secret key: <code>{mfaSetup.secret}</code>
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                Enter the 6-digit code from your authenticator app to verify:
              </Typography>
              
              <TextField
                fullWidth
                label="MFA Token"
                value={mfaToken}
                onChange={(e) => setMfaToken(e.target.value)}
                placeholder="123456"
                inputProps={{ maxLength: 6 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMfaDialog(false)}>Cancel</Button>
          <Button onClick={handleMfaVerify} variant="contained">
            Verify & Enable
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleRoleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role Name"
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
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Permissions
                </Typography>
                
                <Grid container spacing={1}>
                  {availablePermissions.map((permission) => (
                    <Grid item xs={12} md={6} key={permission}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  permissions: [...formData.permissions, permission]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissions: formData.permissions.filter(p => p !== permission)
                                });
                              }
                            }}
                          />
                        }
                        label={permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleRoleSubmit} variant="contained">
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityManagement;
