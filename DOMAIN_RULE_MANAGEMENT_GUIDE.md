# Domain & Rule Management System Guide

## 🎯 Overview

The Domain & Rule Management System provides a comprehensive interface for:
- **Managing domains** (adding, editing, verifying)
- **Creating bot detection rules** with customizable conditions and actions
- **Attaching rules to websites** for targeted protection
- **Real-time monitoring** of website traffic and bot activity
- **Comprehensive analytics** and reporting

## 🚀 Getting Started

### 1. Access the System

Navigate to the Domain & Rule Management section in your dashboard. You'll see:
- Overview statistics (total domains, active rules, requests, revenue)
- Domains table with current status
- Bot detection rules table
- Action buttons for adding new domains and rules

### 2. System Requirements

- ✅ Backend server running (port 8960)
- ✅ Database initialized with bot detection rules
- ✅ Admin user authenticated
- ✅ Domain `shaileshdwivedi.in` already configured

## 📋 Domain Management

### Adding a New Domain

1. **Click "Add Domain"** button
2. **Fill in domain details**:
   - Domain name (e.g., `example.com`)
   - SSL enabled (recommended)
   - CDN enabled (optional)
   - Traffic monitoring enabled (required for bot detection)
3. **Click "Create"** to add the domain

### Domain Verification

After adding a domain, you need to verify ownership:

1. **Choose verification method**:
   - **DNS TXT Record** (recommended)
   - **HTML File Upload**
   - **Meta Tag**
2. **Follow verification instructions**
3. **Click "Verify"** to complete the process

### Domain Status

Domains can have the following statuses:
- **Active**: Fully configured and protected
- **Pending**: Awaiting verification
- **Suspended**: Temporarily disabled
- **Verified**: Ownership confirmed

## 🔒 Bot Detection Rules

### Rule Types

The system supports multiple rule types:

1. **Bot Detection** - Identify and block automated traffic
2. **Rate Limiting** - Control request frequency
3. **Geographic Blocking** - Restrict access by location
4. **Content Protection** - Protect specific content or endpoints

### Creating a New Rule

1. **Click "Create Rule"** button
2. **Fill in rule details**:
   - **Name**: Descriptive rule name
   - **Description**: What the rule does
   - **Type**: Choose rule category
   - **Priority**: Higher numbers = higher priority
   - **Status**: Active, Inactive, or Draft
3. **Configure conditions**:
   - **Field**: What to check (user_agent, IP, path, etc.)
   - **Operator**: How to check (contains, equals, regex, etc.)
   - **Value**: What to look for
   - **Connector**: AND/OR logic between conditions
4. **Set actions**:
   - **Block Request**: Completely block matching traffic
   - **Challenge**: Show CAPTCHA or challenge
   - **Rate Limit**: Slow down requests
   - **Log Event**: Record for analysis
5. **Attach to domains**: Select which websites this rule protects
6. **Click "Create"** to activate the rule

### Rule Conditions

Common condition fields:

| Field | Description | Example Values |
|-------|-------------|----------------|
| `user_agent` | Browser/client identifier | `GPTBot`, `curl`, `python` |
| `ip` | Client IP address | `192.168.1.100` |
| `ip_range` | IP address range | `192.168.1.0/24` |
| `path` | Request URL path | `/api/`, `/admin/` |
| `method` | HTTP method | `GET`, `POST`, `PUT` |
| `country` | Geographic location | `US`, `CN`, `RU` |
| `requests_per_minute` | Rate limiting | `100`, `500` |
| `is_bot` | Bot detection result | `true`, `false` |

### Rule Actions

Available actions:

| Action | Description | Configuration |
|--------|-------------|---------------|
| `block_request` | Block the request completely | `true`/`false` |
| `allow_request` | Allow the request through | `true`/`false` |
| `rate_limit` | Limit request frequency | `{"limit": 100, "window": 60}` |
| `redirect` | Redirect to different URL | `"https://example.com"` |
| `challenge` | Show CAPTCHA/challenge | `"captcha"`, `"js_challenge"` |
| `log_only` | Log without taking action | `true`/`false` |

### Rule Priority

Rules are evaluated in priority order:
- **Priority 1**: Highest priority (evaluated first)
- **Priority 5**: Lower priority (evaluated later)
- **First matching rule** determines the action taken

## 🔗 Attaching Rules to Websites

### Method 1: During Rule Creation

1. **Create a new rule** as described above
2. **In the "Attach to Domains" section**, check the domains you want to protect
3. **Save the rule** - it will automatically be applied to selected domains

### Method 2: Attaching Existing Rules

1. **Go to the Rules table**
2. **Click the Shield icon** next to a domain
3. **Select rules** to attach from the available list
4. **Click "Attach"** to apply the rules

### Method 3: Bulk Operations

1. **Select multiple rules** using checkboxes
2. **Choose "Attach to Domain"** from bulk actions
3. **Select target domain** and confirm

## 📊 Monitoring & Analytics

### Real-Time Monitoring

Access real-time data for any domain:

1. **Click the Eye icon** next to a domain
2. **View live metrics**:
   - Current requests per second
   - Active users
   - Bot requests
   - Blocked requests
   - Response times
   - System uptime

### Traffic Analysis

Monitor website traffic patterns:

1. **Select time range**: 1H, 24H, 7D, 30D
2. **View traffic charts** showing:
   - Request volume over time
   - Bot vs. legitimate traffic
   - Geographic distribution
   - Peak usage periods

### Rule Performance

Track how your rules are performing:

1. **View rule statistics**:
   - Number of times triggered
   - Traffic blocked/allowed
   - Revenue generated
   - Last activation time
2. **Analyze effectiveness**:
   - False positive rates
   - Coverage percentage
   - Performance impact

## 🧪 Testing Your Rules

### Test Bot Detection

1. **Use the test endpoint**:
   ```bash
   curl -H "User-Agent: GPTBot/1.0" http://yourdomain.com/test
   ```
2. **Check if request is blocked**
3. **Review logs** for rule activation

### Test Rate Limiting

1. **Send multiple requests** quickly
2. **Monitor rate limiting** responses
3. **Check logs** for rate limit events

### Test Geographic Blocking

1. **Use VPN** to test from different locations
2. **Verify blocking** works as expected
3. **Check logs** for geographic events

## 📈 Performance Optimization

### Rule Efficiency

- **Keep rules simple** - avoid complex regex patterns
- **Use appropriate priorities** - most important rules first
- **Monitor performance** - check response time impact
- **Regular cleanup** - remove unused or ineffective rules

### Traffic Analysis

- **Review blocked traffic** weekly
- **Identify patterns** in bot behavior
- **Adjust rules** based on real-world data
- **Monitor false positives** and adjust accordingly

## 🚨 Troubleshooting

### Common Issues

1. **Rules not working**:
   - Check domain verification status
   - Verify rule is active
   - Check rule priority and conditions
   - Review traffic logs

2. **Too many false positives**:
   - Refine rule conditions
   - Add whitelist exceptions
   - Adjust rule priorities
   - Use more specific patterns

3. **Performance issues**:
   - Reduce number of active rules
   - Optimize rule conditions
   - Use database indexing
   - Monitor system resources

### Debug Mode

Enable debug logging to see rule evaluation:

1. **Set environment variable**: `DEBUG=true`
2. **Check backend logs** for rule evaluation details
3. **Use API endpoints** to test individual rules
4. **Review traffic logs** for detailed information

## 🔄 Maintenance

### Regular Tasks

- **Weekly**: Review blocked traffic and rule performance
- **Monthly**: Update bot detection patterns
- **Quarterly**: Review and optimize rule priorities
- **Annually**: Comprehensive rule audit and cleanup

### Updates and Upgrades

- **Rule updates** take effect immediately
- **Domain changes** may require re-verification
- **System updates** preserve existing configurations
- **Backup rules** before major changes

## 📚 API Reference

### Domain Endpoints

```bash
# Get all domains
GET /api/domains

# Get specific domain
GET /api/domains/{id}

# Create domain
POST /api/domains

# Update domain
PUT /api/domains/{id}

# Delete domain
DELETE /api/domains/{id}

# Verify domain
POST /api/domains/{id}/verify
```

### Rule Endpoints

```bash
# Get all rules
GET /api/rules

# Get specific rule
GET /api/rules/{id}

# Create rule
POST /api/rules

# Update rule
PUT /api/rules/{id}

# Delete rule
DELETE /api/rules/{id}

# Test rule
POST /api/rules/{id}/test

# Attach rule to domain
POST /api/rules/{id}/domains

# Detach rule from domain
DELETE /api/rules/{id}/domains/{domain_id}
```

### Traffic Monitoring Endpoints

```bash
# Real-time traffic
GET /api/traffic/{domain_id}/realtime

# Traffic history
GET /api/traffic/{domain_id}/history

# Bot events
GET /api/traffic/{domain_id}/bot-events

# Blocked requests
GET /api/traffic/{domain_id}/blocked

# Export data
GET /api/traffic/{domain_id}/export?format=csv
```

## 🎉 Success Indicators

You'll know the system is working when:

✅ **Domains are verified** and showing as active  
✅ **Rules are attached** to appropriate domains  
✅ **Bot traffic is being blocked** (visible in logs)  
✅ **Real-time monitoring** shows live data  
✅ **Performance metrics** are within acceptable ranges  
✅ **False positive rates** are low (<5%)  
✅ **Revenue generation** is tracking correctly  

## 🔮 Next Steps

### Advanced Features

1. **Machine Learning**: AI-powered bot detection
2. **Behavioral Analysis**: Pattern-based threat detection
3. **Custom Actions**: Plugin system for custom responses
4. **Integration APIs**: Connect with external security tools

### Scaling

1. **Multiple domains**: Protect hundreds of websites
2. **Global deployment**: Multi-region protection
3. **Enterprise features**: Advanced reporting and compliance
4. **API access**: Programmatic rule management

---

## 📞 Support

For technical support or questions:
- Check the main project documentation
- Review the API documentation
- Create an issue in the repository
- Contact the development team

---

**Last Updated**: August 28, 2025  
**Version**: 1.0.0  
**Status**: ✅ **FULLY OPERATIONAL**
