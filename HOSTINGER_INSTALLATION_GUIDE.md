# 🚀 HOSTINGER WEBSITE - Boot Interceptor Installation Guide

## Step 1: Access Hostinger Control Panel

1. **Login to Hostinger** (hpanel.hostinger.com)
2. **Go to Websites** 
3. **Select** shaileshdwivedi.in
4. **Click "Manage"**

## Step 2: Add Tracking Script

### Option A: Website Builder (Recommended)
1. **Click "Edit Website"** (if using Website Builder)
2. **Go to Settings** → **SEO & Analytics** → **Analytics**
3. **Find "Custom Code" section**
4. **Add to "Head" section**
5. **Paste the complete script** from `tracking_script_shaileshdwivedi.html`

### Option B: File Manager (Advanced)
1. **Go to File Manager** in Hostinger panel
2. **Navigate to** `public_html/` 
3. **Find** `index.html` (or main template file)
4. **Edit file**
5. **Add script** inside `<head>...</head>` section
6. **Save changes**

### Option C: WordPress (If applicable)
1. **Go to WordPress Dashboard**
2. **Install "Insert Headers and Footers" plugin**
3. **Go to Settings** → **Insert Headers and Footers**
4. **Paste script** in "Scripts in Header" section
5. **Save**

## Step 3: Verify Installation

1. **Visit** shaileshdwivedi.in on your mobile
2. **Check Boot Interceptor dashboard**: 
   - Open: http://localhost:9889
   - Go to: Monitoring → Live Traffic
   - Click: ▶️ Play button
3. **You should see your mobile visit appear!**

## Script to Install:

```html
<!-- Boot Interceptor Tracking Script for shaileshdwivedi.in -->
<script>
(function() {
    // Boot Interceptor Configuration
    const BOOT_INTERCEPTOR_CONFIG = {
        domain: 'shaileshdwivedi.in',
        domainId: 7,
        apiEndpoint: 'http://localhost:8960/api/traffic/intercept',
        enabled: true
    };
    
    // [Full script content from tracking_script_shaileshdwivedi.html]
    
})();
</script>
<!-- End Boot Interceptor Tracking Script -->
```

## Important Notes:

⚠️ **Production Deployment**: 
- Change `apiEndpoint` from `localhost:8960` to your public server IP
- Ensure CORS is properly configured for shaileshdwivedi.in

✅ **After Installation**:
- Every visitor to your website will be tracked
- Real-time data will appear in Boot Interceptor dashboard
- Mobile visits (like yours) will show up instantly

## Troubleshooting:

- **No traffic after installation**: Check browser console for errors
- **CORS errors**: Update server CORS settings
- **404 errors**: Ensure Boot Interceptor server is accessible publicly
