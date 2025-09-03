# Stripe Setup Guide

## Quick Setup

1. **Create a `.env` file in the frontend directory** with the following content:

```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here

# API Configuration  
VITE_API_URL=http://localhost:8960
```

2. **Get your Stripe test keys**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Replace `pk_test_your_stripe_public_key_here` with your actual key

3. **Restart the development server**:
   ```bash
   # Kill the existing server
   lsof -ti:9889 | xargs kill -9
   
   # Clear Vite cache
   rm -rf node_modules/.vite
   
   # Start the server
   npm run dev
   ```

## Important Notes

- Never commit your actual Stripe keys to version control
- The `.env` file should be in your `.gitignore`
- Use test keys (`pk_test_`) for development
- Use live keys (`pk_live_`) only in production with proper security

## Troubleshooting

If you still see "Outdated Optimize Dep" errors:

1. Stop the dev server
2. Delete the entire `node_modules` folder
3. Run `npm install`
4. Start the dev server again

## Backend Configuration

Make sure your backend also has the corresponding Stripe secret key configured in its environment variables.
