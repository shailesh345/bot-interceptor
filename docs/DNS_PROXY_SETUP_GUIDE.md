# 🌐 DNS/Proxy Traffic Interception Setup Guide

## Overview

The DNS/Proxy method intercepts website traffic by redirecting domain DNS records to point to your Boot Interceptor server. This allows you to monitor and analyze all traffic before forwarding it to the original website.

## 🏗️ Architecture

```
User Request → DNS Resolution → Boot Interceptor Server → Original Website
     ↑              ↓                      ↓                    ↓
  example.com → 123.45.67.89:8080 → Process/Analyze → origin.example.com
```

## 📋 Setup Steps

### Step 1: Domain Verification (Current Working Method)

1. **Add Domain** in Boot Interceptor dashboard
2. **Get TXT Record** for verification:
   ```
   Name: _botinterceptor.example.com
   Type: TXT
   Value: botinterceptor-verification=abc123...
   TTL: 300
   ```
3. **Add TXT record** to your DNS provider
4. **Verify domain** in dashboard

### Step 2: DNS Traffic Routing (NEW - Required for Proxy Method)

#### Current DNS Setup (Before Boot Interceptor):
```bash
# Original configuration
example.com     A    192.168.1.100  # Your original server
www.example.com A    192.168.1.100
```

#### New DNS Setup (With Boot Interceptor):
```bash
# Step 2a: Backup original server location
origin.example.com  A    192.168.1.100  # Original server backup

# Step 2b: Redirect main traffic to Boot Interceptor
example.com         A    YOUR_BOOT_INTERCEPTOR_IP
www.example.com     A    YOUR_BOOT_INTERCEPTOR_IP

# Step 2c: Keep verification record
_botinterceptor.example.com TXT "botinterceptor-verification=TOKEN"
```

### Step 3: Start Proxy Services

#### Option A: Start Proxy Service Only
```bash
cd backend
python start_proxy_interceptor.py
```

#### Option B: Start Both Flask + Proxy (Recommended)
```bash
cd backend
python start_with_proxy.py
```

### Step 4: Test Setup

```bash
# Test 1: Check if proxy is running
curl -H "Host: example.com" http://localhost:8080/

# Test 2: Check DNS resolution
nslookup example.com

# Test 3: Test live traffic
curl -H "Host: example.com" http://YOUR_BOOT_INTERCEPTOR_IP/
```

## 🔧 DNS Provider Examples

### Cloudflare
1. Go to **DNS** tab
2. **Delete existing A records** for your domain
3. **Add new A records**:
   - Name: `@` (root domain), Value: `YOUR_BOOT_INTERCEPTOR_IP`
   - Name: `www`, Value: `YOUR_BOOT_INTERCEPTOR_IP`
   - Name: `origin`, Value: `YOUR_ORIGINAL_SERVER_IP`
4. Set TTL to **5 minutes** for testing

### Route53 (AWS)
```json
{
    "Name": "example.com",
    "Type": "A",
    "TTL": 300,
    "ResourceRecords": [{"Value": "YOUR_BOOT_INTERCEPTOR_IP"}]
}
```

### cPanel/WHM
1. Go to **Zone Editor**
2. Find your domain
3. **Edit A records**:
   - Change `example.com` → `YOUR_BOOT_INTERCEPTOR_IP`
   - Change `www.example.com` → `YOUR_BOOT_INTERCEPTOR_IP`
   - Add `origin.example.com` → `YOUR_ORIGINAL_SERVER_IP`

## ⚠️ Important Notes

### Traffic Flow
```
Before: User → example.com (192.168.1.100)
After:  User → example.com (YOUR_IP:8080) → origin.example.com (192.168.1.100)
```

### SSL Considerations
- If your site uses HTTPS, configure SSL certificates on Boot Interceptor
- Or use Cloudflare's flexible SSL mode

### Testing Phase
1. Start with a **subdomain** first: `test.example.com`
2. Test thoroughly before switching main domain
3. Keep DNS TTL low (300 seconds) for quick rollbacks

## 🚨 Troubleshooting

### Issue: "Domain not found" (404)
```bash
# Check if proxy service is running
netstat -an | grep :8080

# Check domain configuration
curl -v -H "Host: example.com" http://localhost:8080/
```

### Issue: "Connection refused"
```bash
# Check if Redis is running
redis-cli ping

# Start proxy service
python start_proxy_interceptor.py
```

### Issue: "Infinite redirect"
- Check target URL configuration in domain settings
- Ensure `origin.example.com` points to original server
- Verify proxy isn't forwarding to itself

### Issue: SSL Certificate Errors
```bash
# For testing, disable SSL verification
curl -k -H "Host: example.com" https://YOUR_IP:8080/

# Configure proper SSL certificate for production
```

## 📊 Monitoring

### Check Traffic Logs
- Go to **Domains** → **Live Traffic** in dashboard
- Real-time traffic stream should show intercepted requests
- Bot detection and rules should be active

### Performance Metrics
- Response time should increase by 10-50ms (proxy overhead)
- All original functionality should work unchanged
- Monitor error rates during initial deployment

## 🔄 Rollback Plan

If issues occur, quickly revert DNS:

```bash
# Emergency rollback - point directly to original server
example.com     A    192.168.1.100  # Original IP
www.example.com A    192.168.1.100  # Original IP
```

DNS propagation: **5-30 minutes** with low TTL

## 🎯 Success Indicators

✅ Proxy service running on port 8080
✅ Domain resolves to Boot Interceptor IP
✅ Website loads normally for users  
✅ Traffic appears in Boot Interceptor dashboard
✅ Bot detection working
✅ Custom rules being applied

## 💡 Pro Tips

1. **Start with staging**: Use `staging.example.com` first
2. **Monitor closely**: Watch error rates and response times
3. **SSL ready**: Have certificates prepared before switching
4. **Health checks**: Set up monitoring for both services
5. **Backup everything**: DNS records, server configs, certificates

---

## Support

For issues or questions:
- Check logs: `tail -f backend/*.log`
- Test locally: `curl -H "Host: yourdomain.com" http://localhost:8080/`  
- Review proxy interceptor status in dashboard
