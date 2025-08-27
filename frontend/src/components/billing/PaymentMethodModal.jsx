import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  Lock, 
  Check, 
  AlertCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProfessionalInput, { useFormValidation, validators } from './ProfessionalFormValidation';

const PaymentMethodModal = ({ onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation schema
  const validationSchema = {
    cardNumber: [validators.required, validators.creditCard],
    expiryDate: [validators.required, validators.expiryDate],
    cvv: [validators.required, validators.cvv],
    name: [validators.required, validators.minLength(2)],
  };

  const {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    handleSubmit,
    reset
  } = useFormValidation({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    isDefault: false
  }, validationSchema);

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Parse expiry date
      const [month, year] = formData.expiryDate.split('/');
      
      const paymentData = {
        cardNumber: formData.cardNumber,
        expMonth: month,
        expYear: `20${year}`,
        cvv: formData.cvv,
        name: formData.name,
        last4: formData.cardNumber.replace(/\s/g, '').slice(-4),
        brand: detectCardBrand(formData.cardNumber),
        isDefault: formData.isDefault
      };

      await onSave(paymentData);
      reset();
      onClose();
    } catch (error) {
      console.error('Payment method submission failed:', error);
      // Don't show toast here to avoid render-time state updates
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectCardBrand = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    if (cleaned.startsWith('6')) return 'discover';
    return 'unknown';
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    if (value.replace(/\s/g, '').length <= 16) {
      setValue('cardNumber', value);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setValue('expiryDate', value);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setValue('cvv', value);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.15 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 rounded-lg p-2">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add Payment Method</h3>
                  <p className="text-sm text-gray-600">Securely add your payment information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <Shield className="w-4 h-4" />
              <span>Your payment information is encrypted and secure</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
            {/* Card Number */}
            <ProfessionalInput
              label="Card Number"
              value={values.cardNumber}
              onChange={handleCardNumberChange}
              onBlur={() => setFieldTouched('cardNumber')}
              error={touched.cardNumber ? errors.cardNumber : null}
              placeholder="1234 5678 9012 3456"
              icon={CreditCard}
              mask="creditCard"
              autoComplete="cc-number"
              secure={true}
            />

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <ProfessionalInput
                label="Expiry Date"
                value={values.expiryDate}
                onChange={handleExpiryChange}
                onBlur={() => setFieldTouched('expiryDate')}
                error={touched.expiryDate ? errors.expiryDate : null}
                placeholder="MM/YY"
                mask="expiryDate"
                autoComplete="cc-exp"
                maxLength="5"
              />
              
              <ProfessionalInput
                label="CVV"
                value={values.cvv}
                onChange={handleCvvChange}
                onBlur={() => setFieldTouched('cvv')}
                error={touched.cvv ? errors.cvv : null}
                placeholder="123"
                mask="cvv"
                autoComplete="cc-csc"
                secure={true}
              />
            </div>

            {/* Cardholder Name */}
            <ProfessionalInput
              label="Cardholder Name"
              value={values.name}
              onChange={(e) => setValue('name', e.target.value)}
              onBlur={() => setFieldTouched('name')}
              error={touched.name ? errors.name : null}
              placeholder="John Doe"
              autoComplete="cc-name"
            />

            {/* Default Payment Method */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isDefault"
                checked={values.isDefault}
                onChange={(e) => setValue('isDefault', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                Set as default payment method
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).some(key => errors[key])}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Add Payment Method</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Security Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Secured by 256-bit SSL encryption</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentMethodModal;
