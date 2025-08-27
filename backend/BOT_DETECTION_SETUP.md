# Bot Detection Rules Setup for shaileshdwivedi.in

This guide explains how to set up comprehensive bot detection rules for the `shaileshdwivedi.in` domain using the Traffic Interceptor system.

## 🎯 Overview

The bot detection system will automatically identify and block various types of bots including:
- **AI Training Bots**: GPTBot, ClaudeBot, ChatGPT, etc.
- **Web Scraping Bots**: Scrapers, crawlers, spiders, etc.
- **Tool-Based Bots**: curl, wget, Python, Java, etc.
- **Suspicious Traffic**: High-rate requests, headless browsers, etc.

## 🚀 Quick Setup

### 1. Prerequisites

Ensure you have:
- ✅ Backend server running
- ✅ Database initialized
- ✅ Admin user created
- ✅ Default tenant exists

### 2. Create Domain and Rules

Run the enhanced bot detection setup script:

```bash
cd backend
python create_enhanced_bot_rule.py
```

This script will:
- Create the `shaileshdwivedi.in` domain if it doesn't exist
- Create 4 comprehensive bot detection rules
- Set appropriate priorities and actions

### 3. Verify Setup

Test that the rules are working correctly:

```bash
python test_bot_detection.py
```

## 📋 Rule Details

### Rule 1: AI Training Bot Blocking (Priority 1)
- **Targets**: GPTBot, ClaudeBot, ChatGPT, Anthropic, OpenAI
- **Actions**: Block request, Log event, Challenge with captcha
- **Description**: Blocks AI training bots that scrape content for model training

### Rule 2: Web Scraping Bot Detection (Priority 2)
- **Targets**: Scrapers, crawlers, spiders, headless browsers
- **Actions**: Block request, Log event, Challenge with captcha
- **Description**: Detects and blocks automated web scraping tools

### Rule 3: Tool-Based Bot Detection (Priority 3)
- **Targets**: curl, wget, Python, Java, Perl, Ruby, PHP, Node.js, Go, Rust
- **Actions**: Block request, Log event, Challenge with captcha
- **Description**: Blocks bots using common development and automation tools

### Rule 4: Rate Limiting for Suspicious IPs (Priority 4)
- **Targets**: IPs making >100 requests per minute
- **Actions**: Rate limit to 50 requests per minute, Log event, Challenge
- **Description**: Prevents abuse from high-volume automated requests

## 🔧 Customization

### Adding New Bot Patterns

To add new bot detection patterns, edit the `create_enhanced_bot_rule.py` script:

```python
# Add new condition to existing rule
{
    'field': 'user_agent',
    'operator': 'contains',
    'value': 'new_bot_pattern',
    'connector': 'OR'
}
```

### Creating Custom Rules

You can create custom rules through the API or by modifying the script:

```python
custom_rule = {
    'name': 'Custom Bot Rule',
    'description': 'Custom bot detection logic',
    'conditions': [...],
    'actions': [...],
    'priority': 5
}
```

## 📊 Monitoring

### View Rule Statistics

Check rule performance through the API:

```bash
# Get rule statistics
curl -H "Authorization: Bearer <token>" \
     http://localhost:5002/api/rules/<rule_id>
```

### Traffic Logs

All blocked requests are logged in the `traffic_logs` table with:
- Bot detection details
- Rule that triggered the block
- Action taken
- Timestamp and IP information

## 🧪 Testing

### Test Bot Detection

Use the test script to verify rules:

```bash
python test_bot_detection.py
```

### Manual Testing

Test with different user agents:

```bash
# Test AI bot blocking
curl -H "User-Agent: GPTBot/1.0" http://localhost:5002/traffic/test

# Test scraping bot blocking
curl -H "User-Agent: Python-urllib/3.8" http://localhost:5002/traffic/test

# Test legitimate traffic
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
     http://localhost:5002/traffic/test
```

## 🔒 Security Features

### Multi-Layer Protection
1. **User Agent Analysis**: Pattern matching against known bot signatures
2. **Behavioral Analysis**: Rate limiting and request pattern detection
3. **Challenge Response**: CAPTCHA challenges for suspicious requests
4. **Logging**: Comprehensive logging for analysis and monitoring

### Whitelist Support
Legitimate bots (Google, Bing, etc.) can be whitelisted by modifying the rules or adding exceptions.

## 📈 Performance

### Rule Evaluation
- Rules are evaluated in priority order (1 = highest)
- First matching rule determines the action
- Efficient pattern matching using regex and string operations

### Scalability
- Rules are stored in database for easy management
- Support for thousands of rules per domain
- Efficient querying and caching

## 🚨 Troubleshooting

### Common Issues

1. **Rules not working**
   - Check if domain exists and is verified
   - Verify rules are active (`is_active = True`)
   - Check rule priorities and conditions

2. **Too many false positives**
   - Adjust rule conditions to be less strict
   - Add whitelist exceptions for legitimate bots
   - Review and refine user agent patterns

3. **Performance issues**
   - Reduce number of active rules
   - Optimize rule conditions
   - Use database indexing for rule queries

### Debug Mode

Enable debug logging in the backend to see rule evaluation details:

```python
# In app configuration
DEBUG = True
LOG_LEVEL = 'DEBUG'
```

## 📚 API Reference

### Rule Management Endpoints

- `POST /api/rules` - Create new rule
- `GET /api/rules` - List all rules
- `PUT /api/rules/<id>` - Update rule
- `DELETE /api/rules/<id>` - Delete rule
- `POST /api/rules/<id>/test` - Test rule

### Rule Schema

```json
{
  "name": "Rule Name",
  "description": "Rule description",
  "rule_type": "bot_detection",
  "conditions": [
    {
      "field": "user_agent",
      "operator": "contains",
      "value": "bot_pattern",
      "connector": "OR"
    }
  ],
  "actions": [
    {
      "type": "block_request",
      "value": true
    }
  ],
  "priority": 1,
  "is_active": true
}
```

## 🎉 Success Indicators

You'll know the setup is working when:

✅ Domain `shaileshdwivedi.in` exists and is verified  
✅ 4 bot detection rules are active  
✅ Test script shows rules matching test cases  
✅ Traffic logs show blocked bot requests  
✅ API endpoints return rule information  

## 🔄 Updates and Maintenance

### Regular Maintenance
- Review blocked traffic logs weekly
- Update bot patterns monthly
- Monitor false positive rates
- Adjust rule priorities as needed

### Rule Updates
- Rules can be updated through the API
- Changes take effect immediately
- Version control recommended for rule changes

---

For support or questions, check the main project documentation or create an issue in the repository.
