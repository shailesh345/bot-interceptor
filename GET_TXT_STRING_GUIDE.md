# How to Get TXT String for Hosting Provider

## 🎯 Quick Answer

To get the TXT string for your hosting provider, you need to:

1. **Add your domain** in the Bot Interceptor dashboard
2. **Get verification details** from the domain settings
3. **Copy the TXT record values** to your hosting provider's DNS settings

## 📋 Step-by-Step Guide

### Method 1: Using the Dashboard (Recommended)

1. **Go to Domains Page**
   - Navigate to **Domains** in the Bot Interceptor dashboard
   - Click **"Add Domain"** or select an existing domain

2. **View Verification Details**
   - Click on your domain or **"Verify Domain"** button
   - Select **"DNS TXT Record"** method
   - Copy the TXT record information provided

3. **Add to Your Hosting Provider**
   - Go to your hosting provider's DNS management (cPanel, Cloudflare, etc.)
   - Add a new TXT record with the provided values

### Method 2: Using the API

```bash
# Get verification info for domain ID 1
curl -X GET "http://localhost:5002/api/v1/domains/1/verification" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 TXT Record Format

When you add a domain, the system generates a TXT record like this:

```
Record Type: TXT
Name/Host: _botinterceptor.yourdomain.com
Value: botinterceptor-verification=abc123def456789
TTL: 300
```

## 🏗️ Common Hosting Providers

### **cPanel/WHM**
1. Go to **Zone Editor** in cPanel
2. Click **"+ Add Record"**
3. Select **TXT Record**
4. Enter the Name and Value from Bot Interceptor
5. Click **"Add Record"**

### **Cloudflare**
1. Go to **DNS** tab in Cloudflare dashboard
2. Click **"+ Add record"**
3. Type: **TXT**
4. Name: `_botinterceptor.yourdomain.com`
5. Content: `botinterceptor-verification=YOUR_TOKEN`
6. Click **"Save"**

### **GoDaddy**
1. Go to **DNS Management**
2. Click **"Add"** new record
3. Type: **TXT**
4. Host: `_botinterceptor.yourdomain.com`
5. Value: `botinterceptor-verification=YOUR_TOKEN`
6. Save changes

### **Namecheap**
1. Go to **Advanced DNS**
2. Click **"Add New Record"**
3. Type: **TXT Record**
4. Host: `_botinterceptor.yourdomain.com`
5. Value: `botinterceptor-verification=YOUR_TOKEN`
6. Save changes

## 📱 Frontend Integration

I've also created a user-friendly interface in the frontend:

```javascript
// Get verification info
const response = await fetch('/api/v1/domains/1/verification', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
const txtRecord = data.verification_methods.dns.copy_values;

console.log('TXT Record Details:');
console.log('Name:', txtRecord.record_name);
console.log('Value:', txtRecord.record_value);
```

## 🎨 User Interface Features

The Bot Interceptor dashboard provides:

- **Copy to Clipboard** buttons for easy copying
- **Step-by-step instructions** for popular hosting providers
- **Real-time verification** status
- **Multiple verification methods** (DNS, HTML file, Meta tag)
- **Visual indicators** for verification progress

## 🔄 Alternative Verification Methods

### **1. HTML File Upload**
- Upload a verification file to your website
- File: `botinterceptor-{token}.txt`
- Content: `botinterceptor-domain-verification={token}`
- Location: `/.well-known/` or root directory

### **2. HTML Meta Tag**
- Add meta tag to your homepage
- Tag: `<meta name="botinterceptor-domain-verification" content="{token}" />`
- Place in `<head>` section

### **3. DNS TXT Record** (Most Common)
- Add TXT record to DNS settings
- Name: `_botinterceptor.yourdomain.com`
- Value: `botinterceptor-verification={token}`

## ⚡ Quick Test

You can test the API endpoint right now:

```bash
# Start the backend server
cd backend && python app.py

# Test the verification endpoint
curl "http://localhost:5002/api/v1/domains/1/verification"
```

## 🎯 Example Output

```json
{
  "verification_methods": {
    "dns": {
      "copy_values": {
        "record_name": "_botinterceptor.example.com",
        "record_value": "botinterceptor-verification=abc123def456",
        "record_type": "TXT",
        "ttl": "300"
      }
    }
  }
}
```

## 🔐 Security Notes

- **Unique tokens** are generated for each domain
- **Tokens expire** and can be regenerated if needed
- **Verification is required** before traffic interception starts
- **Multiple verification methods** provide flexibility

## 📞 Need Help?

If you need the TXT string for your specific domain:

1. **Add your domain** in the Bot Interceptor dashboard
2. **Click "Get Verification Details"** 
3. **Copy the TXT record values**
4. **Add to your hosting provider's DNS settings**
5. **Wait 5-30 minutes** for DNS propagation
6. **Click "Verify Domain"** to complete setup

The system will provide you with the exact TXT record values you need to add to your hosting provider!
