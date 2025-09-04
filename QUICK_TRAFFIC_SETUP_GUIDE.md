# 🚀 Quick Traffic Setup Guide - Boot Interceptor

## Current Status
- ✅ Flask Backend: Running on port 8960
- ⏳ Proxy Service: Starting on port 8080
- ✅ WebSocket: Ready for real-time traffic

## Why "Waiting for traffic..."?

You need to complete **3 steps** to see traffic:

### Step 1: Select Domains ✅ (Auto-fixed)
- Go to **Monitoring** → **Select Domains** tab
- Verified domains are now auto-selected
- Or manually select domains you want to monitor

### Step 2: Install Traffic Collection (Choose ONE method)

#### Method A: JavaScript Tracking (Easiest)
1. Go to **Tracking Integration** page
2. Copy the tracking script
3. Add to your website's `<head>` section:

```html
<script>
(function() {
    const config = {
        domain: 'yourdomain.com',
        apiEndpoint: 'http://YOUR_BOOT_INTERCEPTOR_IP:8960/api/traffic/intercept'
    };
    // ... tracking script
})();
</script>
```

#### Method B: DNS/Proxy (Advanced)
1. Update your domain's DNS:
   ```
   yourdomain.com → YOUR_BOOT_INTERCEPTOR_IP
   origin.yourdomain.com → YOUR_ORIGINAL_SERVER_IP
   ```
2. Wait for DNS propagation (5-30 minutes)
3. All traffic will flow through Boot Interceptor

### Step 3: Generate Traffic
- Visit your website
- Or use: `curl -H "Host: yourdomain.com" http://YOUR_IP:8080/`
- Traffic will appear in the Live Traffic Stream

## Testing Traffic Flow

### Quick Test (Without Real Domain)
```bash
# Test with fake domain
curl -X POST http://localhost:8960/api/traffic/intercept \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://example.com/test",
    "method": "GET",
    "user_agent": "Test Browser",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

### Verify Setup
1. **Check Services**:
   ```bash
   netstat -an | grep -E ":8080|:8960" | grep LISTEN
   ```

2. **Check WebSocket**:
   - Open browser console
   - Look for: "Connected to traffic stream"

3. **Check Selected Domains**:
   - Console should show: "Auto-selected verified domains"

## Common Issues

### No Domains Showing
- Add and verify a domain first
- Go to **Domains** → **Add Domain**
- Complete verification process

### WebSocket Not Connecting
- Check if backend is running: `curl http://localhost:8960/health`
- Check browser console for errors
- Ensure no firewall blocking port 8960

### Traffic Not Appearing
- Ensure tracking script is installed
- Check browser network tab for `/api/traffic/intercept` calls
- Verify domain is selected in monitoring

## Next Steps

1. **For Testing**: Use Method A (JavaScript)
2. **For Production**: Use Method B (DNS/Proxy)
3. **Monitor**: Go to **Monitoring** → **Live Traffic**
4. **Configure**: Set up bot detection rules

---

**Need Help?** Check full documentation at `/docs`
