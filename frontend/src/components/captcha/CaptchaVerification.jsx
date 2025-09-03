import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Lock,
  Refresh,
  Check,
  Close,
  Warning,
  SmartToy,
  TouchApp,
  Mouse,
  Keyboard
} from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import api from '../../services/api';

// Behavioral tracking class
class BehaviorTracker {
  constructor() {
    this.mouseMovements = [];
    this.keyStrokes = [];
    this.touchEvents = [];
    this.scrollPatterns = [];
    this.startTime = Date.now();
    this.isTracking = false;
  }

  start() {
    if (this.isTracking) return;
    this.isTracking = true;
    
    // Mouse tracking
    this.mouseHandler = (e) => {
      this.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });
      
      // Limit array size
      if (this.mouseMovements.length > 100) {
        this.mouseMovements.shift();
      }
    };
    
    // Keyboard tracking
    this.keyHandler = (e) => {
      this.keyStrokes.push({
        key: e.key.length === 1 ? 'char' : e.key,
        timestamp: Date.now()
      });
      
      if (this.keyStrokes.length > 50) {
        this.keyStrokes.shift();
      }
    };
    
    // Touch tracking
    this.touchHandler = (e) => {
      this.touchEvents.push({
        type: e.type,
        timestamp: Date.now()
      });
    };
    
    // Scroll tracking
    this.scrollHandler = (e) => {
      this.scrollPatterns.push({
        delta: e.deltaY,
        timestamp: Date.now()
      });
      
      if (this.scrollPatterns.length > 20) {
        this.scrollPatterns.shift();
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', this.mouseHandler);
    document.addEventListener('keypress', this.keyHandler);
    document.addEventListener('touchstart', this.touchHandler);
    document.addEventListener('wheel', this.scrollHandler);
  }
  
  stop() {
    if (!this.isTracking) return;
    this.isTracking = false;
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.mouseHandler);
    document.removeEventListener('keypress', this.keyHandler);
    document.removeEventListener('touchstart', this.touchHandler);
    document.removeEventListener('wheel', this.scrollHandler);
  }
  
  getData() {
    return {
      mouse_movements: this.mouseMovements.slice(-50),
      key_strokes: this.keyStrokes.slice(-30),
      touch_events: this.touchEvents.slice(-20),
      scroll_patterns: this.scrollPatterns,
      time_on_page: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }
}

// Custom CAPTCHA Component
const CustomCaptcha = ({ challenge, onSubmit, onRefresh }) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  if (challenge.subtype === 'text') {
    return (
      <Box>
        <Box mb={2} textAlign="center" position="relative">
          <img 
            src={challenge.image} 
            alt="CAPTCHA" 
            style={{ 
              maxWidth: '100%', 
              border: '1px solid #e0e0e0',
              borderRadius: 4 
            }}
          />
          <IconButton
            size="small"
            onClick={onRefresh}
            sx={{ 
              position: 'absolute', 
              top: 0, 
              right: 0,
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
        
        <TextField
          fullWidth
          label="Enter the text shown above"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          autoFocus
        />
      </Box>
    );
  }
  
  if (challenge.subtype === 'math') {
    return (
      <Box>
        <Typography variant="h5" textAlign="center" mb={2}>
          {challenge.question}
        </Typography>
        
        <TextField
          fullWidth
          label="Your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          type="number"
          autoFocus
        />
      </Box>
    );
  }
  
  if (challenge.subtype === 'puzzle') {
    return (
      <Box>
        <Typography variant="body1" mb={2}>
          {challenge.question}
        </Typography>
        
        <TextField
          fullWidth
          label="Your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          autoFocus
        />
      </Box>
    );
  }
  
  return null;
};

// Main CAPTCHA Verification Component
const CaptchaVerification = ({ 
  open, 
  onClose, 
  onVerified, 
  type = 'auto',
  difficulty = 'medium' 
}) => {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [behaviorScore, setBehaviorScore] = useState(null);
  
  const recaptchaRef = useRef(null);
  const hcaptchaRef = useRef(null);
  const behaviorTracker = useRef(new BehaviorTracker());
  
  useEffect(() => {
    if (open) {
      loadChallenge();
      behaviorTracker.current.start();
      analyzeBehavior();
    }
    
    return () => {
      behaviorTracker.current.stop();
    };
  }, [open]);
  
  const loadChallenge = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/captcha/challenge', {
        type: type === 'auto' ? undefined : type,
        difficulty
      });
      
      setChallenge(response.data.challenge);
      setAttempts(0);
    } catch (error) {
      setError('Failed to load CAPTCHA challenge');
      console.error('CAPTCHA load error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const analyzeBehavior = async () => {
    // Wait for some behavior data
    setTimeout(async () => {
      try {
        const behaviorData = behaviorTracker.current.getData();
        const response = await api.post('/api/captcha/behavioral-analysis', behaviorData);
        setBehaviorScore(response.data.confidence_score);
        
        // If high confidence human, auto-verify
        if (response.data.is_likely_human && response.data.confidence_score > 0.8) {
          // Still show CAPTCHA but make it easier
          if (challenge && challenge.type === 'custom') {
            loadChallenge(); // Reload with easy difficulty
          }
        }
      } catch (error) {
        console.error('Behavior analysis error:', error);
      }
    }, 2000);
  };
  
  const handleVerify = async (response) => {
    setVerifying(true);
    setError(null);
    
    try {
      const result = await api.post('/api/captcha/verify', {
        challenge_id: challenge.challenge_id,
        response
      });
      
      if (result.data.success) {
        onVerified(result.data.verification_token);
        onClose();
      } else {
        setError('Verification failed. Please try again.');
        setAttempts(attempts + 1);
        
        if (result.data.attempts_remaining === 0) {
          setError('Maximum attempts exceeded. Please refresh.');
        }
      }
    } catch (error) {
      setError('Verification error. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setVerifying(false);
    }
  };
  
  const handleRecaptchaChange = (value) => {
    if (value) {
      handleVerify(value);
    }
  };
  
  const handleHcaptchaVerify = (token) => {
    handleVerify(token);
  };
  
  const renderChallenge = () => {
    if (!challenge) return null;
    
    switch (challenge.type) {
      case 'recaptcha':
        return (
          <Box display="flex" justifyContent="center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={challenge.site_key}
              onChange={handleRecaptchaChange}
              theme="light"
            />
          </Box>
        );
        
      case 'hcaptcha':
        return (
          <Box display="flex" justifyContent="center">
            <HCaptcha
              ref={hcaptchaRef}
              sitekey={challenge.site_key}
              onVerify={handleHcaptchaVerify}
              theme="light"
            />
          </Box>
        );
        
      case 'custom':
        return (
          <CustomCaptcha
            challenge={challenge}
            onSubmit={handleVerify}
            onRefresh={loadChallenge}
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Lock sx={{ mr: 1 }} />
            <Typography variant="h6">Human Verification Required</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading verification challenge...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Bot Detection Warning */}
            {challenge?.bot_suspected && (
              <Alert severity="warning" icon={<SmartToy />} sx={{ mb: 2 }}>
                Automated behavior detected. Please complete verification.
              </Alert>
            )}
            
            {/* Behavior Score Indicator */}
            {behaviorScore !== null && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Human Behavior Score
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={behaviorScore * 100} 
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    color={behaviorScore > 0.7 ? 'success' : behaviorScore > 0.4 ? 'warning' : 'error'}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(behaviorScore * 100)}%
                  </Typography>
                </Box>
                
                <Box display="flex" gap={1} mt={1}>
                  <Chip
                    size="small"
                    icon={<Mouse />}
                    label="Mouse"
                    color={behaviorTracker.current.mouseMovements.length > 10 ? 'success' : 'default'}
                  />
                  <Chip
                    size="small"
                    icon={<Keyboard />}
                    label="Keyboard"
                    color={behaviorTracker.current.keyStrokes.length > 5 ? 'success' : 'default'}
                  />
                  <Chip
                    size="small"
                    icon={<TouchApp />}
                    label="Touch"
                    color={behaviorTracker.current.touchEvents.length > 0 ? 'success' : 'default'}
                  />
                </Box>
              </Paper>
            )}
            
            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {/* Challenge */}
            <Box py={2}>
              {renderChallenge()}
            </Box>
            
            {/* Attempts Indicator */}
            {attempts > 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Attempt {attempts + 1} of 3
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        {challenge?.type === 'custom' && !loading && (
          <>
            <Button onClick={loadChallenge} startIcon={<Refresh />}>
              New Challenge
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const input = document.querySelector('input');
                if (input) {
                  handleVerify(input.value);
                }
              }}
              disabled={verifying}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': { backgroundColor: '#333' }
              }}
            >
              {verifying ? <CircularProgress size={24} /> : 'Verify'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Export both the component and the behavior tracker
export { CaptchaVerification, BehaviorTracker };
export default CaptchaVerification;
