import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  CreditCard,
  Lock,
  Speed,
  Api,
  Support,
  Analytics,
  Security,
  CloudDownload,
  Email,
  ArrowForward,
  Star,
  Verified,
  RocketLaunch,
  AutoAwesome
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_key');

// Credit Package Card Component
const CreditPackageCard = ({ packageData, onSelect, isRecommended, isPremium }) => {
  const features = packageData.features || [];
  
  return (
    <Card 
      elevation={isRecommended ? 8 : 2}
      sx={{
        height: '100%',
        position: 'relative',
        border: isRecommended ? '2px solid #000' : '1px solid #e0e0e0',
        backgroundColor: isRecommended ? '#fafafa' : '#fff',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      {isRecommended && (
        <Chip
          label="RECOMMENDED"
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            top: -10,
            right: 20,
            backgroundColor: '#000',
            color: '#fff'
          }}
        />
      )}
      
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {packageData.name}
        </Typography>
        
        <Box display="flex" alignItems="baseline" mb={2}>
          <Typography variant="h3" fontWeight="bold">
            ${packageData.price}
          </Typography>
          <Typography variant="body1" color="text.secondary" ml={1}>
            /{packageData.billing_cycle || 'one-time'}
          </Typography>
        </Box>
        
        <Typography variant="h6" color="primary" mb={1}>
          {packageData.credits.toLocaleString()} Credits
        </Typography>
        
        <Typography variant="body2" color="text.secondary" mb={3}>
          {packageData.description}
        </Typography>
        
        <List dense>
          {features.map((feature, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={feature}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
        
        {isPremium && (
          <Chip
            icon={<Star />}
            label="Premium Pricing"
            size="small"
            color="warning"
            sx={{ mt: 2 }}
          />
        )}
        
        {packageData.bonus_credits && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              +{packageData.bonus_credits.toLocaleString()} Bonus Credits!
            </Typography>
          </Alert>
        )}
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={isRecommended ? "contained" : "outlined"}
          color="primary"
          size="large"
          onClick={() => onSelect(packageData)}
          sx={{
            backgroundColor: isRecommended ? '#000' : 'transparent',
            color: isRecommended ? '#fff' : '#000',
            borderColor: '#000',
            '&:hover': {
              backgroundColor: isRecommended ? '#333' : '#f5f5f5'
            }
          }}
        >
          Select This Package
        </Button>
      </CardActions>
    </Card>
  );
};

// Payment Form Component
const PaymentForm = ({ packageData, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    message: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: formData.company_name,
          email: formData.email
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Submit to backend
      const response = await api.post('/api/credits/purchase', {
        package_id: packageData.id,
        company_name: formData.company_name,
        email: formData.email,
        payment_method_id: paymentMethod.id,
        message: formData.message
      });
      
      if (response.data.success) {
        onSuccess(response.data);
      } else {
        throw new Error(response.data.error || 'Payment failed');
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Company Name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            variant="outlined"
          />
        </Grid>
        
        {packageData.id === 'custom' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Message (Optional)"
              multiline
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              variant="outlined"
              placeholder="Tell us about your specific needs..."
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Card Details
            </Typography>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={!stripe || loading}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <Lock sx={{ mr: 1 }} />
                {packageData.id === 'custom' 
                  ? 'Submit Custom Request' 
                  : `Pay $${packageData.price}`
                }
              </>
            )}
          </Button>
        </Grid>
        
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Lock fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Secure payment powered by Stripe
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

// Main Credit Purchase Page Component
const CreditPurchase = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [error, setError] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null);
  
  // Get bot detection info from URL params
  const isBotRedirect = searchParams.get('bot_redirect') === 'true';
  const detectedCompany = searchParams.get('company');
  
  useEffect(() => {
    fetchPackages();
  }, []);
  
  const fetchPackages = async () => {
    try {
      const response = await api.get('/api/credits/packages', {
        params: {
          bot_redirect: isBotRedirect,
          company: detectedCompany
        }
      });
      setPackages(response.data.packages);
    } catch (error) {
      setError('Failed to load credit packages');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData);
    setPaymentDialog(true);
  };
  
  const handlePaymentSuccess = (result) => {
    setPurchaseResult(result);
    setPaymentDialog(false);
    setSuccessDialog(true);
  };
  
  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setPaymentDialog(false);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        {isBotRedirect && (
          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 4, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}
          >
            <AlertTitle>
              <strong>{detectedCompany || 'AI Bot'} Detected!</strong>
            </AlertTitle>
            Your bot has been intercepted. Purchase credits to continue crawling our content.
          </Alert>
        )}
        
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Purchase Crawling Credits
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          Get instant API access for your AI training data needs
        </Typography>
        
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Chip icon={<Speed />} label="Instant Access" />
          <Chip icon={<Api />} label="RESTful API" />
          <Chip icon={<Security />} label="Secure & Legal" />
          <Chip icon={<Support />} label="24/7 Support" />
        </Box>
      </Box>
      
      {/* Benefits Section */}
      <Paper elevation={0} sx={{ p: 4, mb: 6, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <RocketLaunch sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">
                10x Faster
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Than web scraping
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Verified sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">
                100% Legal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Authorized access
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <AutoAwesome sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">
                Premium Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High-quality content
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Analytics sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">
                Real-time Stats
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usage analytics
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Packages Grid */}
      <Grid container spacing={4} mb={6}>
        {packages.map((pkg, index) => (
          <Grid item xs={12} md={6} lg={3} key={pkg.id}>
            <CreditPackageCard
              packageData={pkg}
              onSelect={handlePackageSelect}
              isRecommended={pkg.id === 'professional'}
              isPremium={pkg.premium}
            />
          </Grid>
        ))}
      </Grid>
      
      {/* How It Works Section */}
      <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4}>
          How It Works
        </Typography>
        
        <Stepper orientation="vertical" activeStep={-1}>
          <Step expanded>
            <StepLabel>
              <Typography variant="h6">Select a Package</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Choose the credit package that best fits your AI training needs
              </Typography>
            </StepContent>
          </Step>
          
          <Step expanded>
            <StepLabel>
              <Typography variant="h6">Complete Payment</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Secure payment processing through Stripe
              </Typography>
            </StepContent>
          </Step>
          
          <Step expanded>
            <StepLabel>
              <Typography variant="h6">Get API Access</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Receive your API key and start crawling immediately
              </Typography>
            </StepContent>
          </Step>
          
          <Step expanded>
            <StepLabel>
              <Typography variant="h6">Monitor Usage</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Track your credit usage and performance in real-time
              </Typography>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
      
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mt: 4 }}
        >
          {error}
        </Alert>
      )}
      
      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialog} 
        onClose={() => setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Complete Your Purchase
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedPackage && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Package:</strong> {selectedPackage.name}<br />
                  <strong>Credits:</strong> {selectedPackage.credits.toLocaleString()}<br />
                  <strong>Price:</strong> ${selectedPackage.price}
                </Typography>
              </Alert>
              
              <Elements stripe={stripePromise}>
                <PaymentForm
                  packageData={selectedPackage}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog 
        open={successDialog} 
        onClose={() => setSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Purchase Successful!
          </Typography>
          
          {purchaseResult && (
            <>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your API access is now active
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, my: 3, textAlign: 'left' }}>
                <Typography variant="body2" paragraph>
                  <strong>Credits:</strong> {purchaseResult.credits?.toLocaleString()}<br />
                  <strong>API Endpoint:</strong> {purchaseResult.api_endpoint}<br />
                  <strong>Access Token:</strong> {purchaseResult.access_token?.substring(0, 20)}...
                </Typography>
              </Paper>
              
              <Alert severity="success" sx={{ mb: 3 }}>
                Check your email for detailed API documentation and quick start guide!
              </Alert>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreditPurchase;
