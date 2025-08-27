import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Check, 
  X, 
  AlertCircle, 
  Shield,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

// Validation utilities
const validators = {
  required: (value, message = 'This field is required') => 
    !value || value.toString().trim() === '' ? message : null,
  
  email: (value) => 
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Please enter a valid email address' : null,
  
  creditCard: (value) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) {
      return 'Please enter a valid credit card number';
    }
    // Luhn algorithm validation
    let sum = 0;
    let alternate = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let n = parseInt(cleaned.charAt(i), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n = (n % 10) + 1;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 !== 0 ? 'Please enter a valid credit card number' : null;
  },
  
  expiryDate: (value) => {
    if (!/^\d{2}\/\d{2}$/.test(value)) {
      return 'Please enter expiry date in MM/YY format';
    }
    const [month, year] = value.split('/').map(Number);
    if (month < 1 || month > 12) {
      return 'Please enter a valid month (01-12)';
    }
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired';
    }
    return null;
  },
  
  cvv: (value) => 
    !/^\d{3,4}$/.test(value) ? 'Please enter a valid CVV (3-4 digits)' : null,
  
  minLength: (min) => (value) => 
    value && value.length < min ? `Must be at least ${min} characters` : null,
  
  maxLength: (max) => (value) => 
    value && value.length > max ? `Must be no more than ${max} characters` : null,
  
  pattern: (regex, message) => (value) => 
    value && !regex.test(value) ? message : null
};

// Professional Input Component
const ProfessionalInput = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  validationRules = [],
  placeholder,
  icon: Icon,
  secure = false,
  mask,
  className = '',
  disabled = false,
  autoComplete,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleBlur = useCallback((e) => {
    setFocused(false);
    setTouched(true);
    onBlur && onBlur(e);
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const applyMask = useCallback((value) => {
    if (!mask) return value;
    
    switch (mask) {
      case 'creditCard':
        return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      case 'expiryDate':
        return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substring(0, 5);
      case 'cvv':
        return value.replace(/\D/g, '').substring(0, 4);
      case 'phone':
        return value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      default:
        return value;
    }
  }, [mask]);

  const handleChange = useCallback((e) => {
    const maskedValue = applyMask(e.target.value);
    onChange && onChange({ ...e, target: { ...e.target, value: maskedValue } });
  }, [onChange, applyMask]);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {validationRules.some(rule => rule === validators.required) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        <div className={`
          relative flex items-center border rounded-lg transition-all duration-200
          ${hasError 
            ? 'border-red-300 bg-red-50' 
            : isValid 
            ? 'border-green-300 bg-green-50'
            : focused 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-300 bg-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
        `}>
          {Icon && (
            <div className={`
              absolute left-3 z-10 transition-colors duration-200
              ${hasError 
                ? 'text-red-400' 
                : isValid 
                ? 'text-green-400'
                : focused 
                ? 'text-blue-400' 
                : 'text-gray-400'
              }
            `}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          
          <input
            type={inputType}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`
              w-full py-3 px-4 bg-transparent border-0 focus:outline-none focus:ring-0
              ${Icon ? 'pl-12' : 'pl-4'}
              ${(type === 'password' || secure) ? 'pr-12' : 'pr-4'}
              ${disabled ? 'cursor-not-allowed' : ''}
              placeholder-gray-400
            `}
            {...props}
          />
          
          {/* Password visibility toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          
          {/* Security indicator */}
          {secure && (
            <div className="absolute right-3 text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
          )}
          
          {/* Validation icons */}
          {!type.includes('password') && !secure && (
            <div className="absolute right-3">
              {hasError && <X className="w-5 h-5 text-red-400" />}
              {isValid && <Check className="w-5 h-5 text-green-400" />}
            </div>
          )}
        </div>
        
        {/* Progress bar for password strength */}
        {type === 'password' && value && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2"
          >
            <PasswordStrength password={value} />
          </motion.div>
        )}
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center space-x-1 text-red-600 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Success message */}
      <AnimatePresence>
        {isValid && !hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center space-x-1 text-green-600 text-sm"
          >
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Valid</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Password Strength Component
const PasswordStrength = ({ password }) => {
  const getStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="space-y-2">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Strength: <span className={`font-medium ${strength > 2 ? 'text-green-600' : 'text-red-600'}`}>
          {strengthLabels[strength - 1] || 'Very Weak'}
        </span>
      </p>
    </div>
  );
};

// Form validation hook
export const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((fieldName, value) => {
    const rules = validationSchema[fieldName] || [];
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }, [validationSchema]);

  const validateField = useCallback((fieldName) => {
    const error = validate(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  }, [validate, values]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      newErrors[fieldName] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationSchema).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  }, [validate, values, validationSchema]);

  const setValue = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    if (touched[fieldName]) {
      validateField(fieldName);
    }
  }, [touched, validateField]);

  const setFieldTouched = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  }, [validateField]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    const isValid = validateAll();
    
    if (isValid) {
      try {
        await onSubmit(values);
        // Success toast is handled by the calling component
      } catch (error) {
        // Error handling is done by the calling component
        console.error('Form submission error:', error);
      }
    } else {
      // Validation errors are displayed inline - no need for toast
      console.warn('Form validation errors:', errors);
    }
    
    setIsSubmitting(false);
  }, [validateAll, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validateField,
    validateAll,
    handleSubmit,
    reset
  };
};

export { ProfessionalInput, validators };
export default ProfessionalInput;
