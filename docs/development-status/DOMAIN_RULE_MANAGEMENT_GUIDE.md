# Domain and Rule Management Guide

This guide provides step-by-step instructions for managing domains and traffic interception rules.

## Domain Management

### Adding a New Domain

1. **Navigate to Domains Page**
   - Click on "Domains" in the sidebar menu
   - Click the "+ Add Domain" button in the top-right corner

2. **Enter Domain Details**
   - Domain Name: Enter your domain (e.g., example.com)
   - Enable SSL: Toggle on if your site uses HTTPS
   - Enable CDN: Toggle on if you use a CDN
   - Click "Next"

3. **Verify Domain Ownership**
   - Choose a verification method:
     - DNS TXT Record: Add the provided TXT record to your domain's DNS settings
     - HTML File: Upload the provided HTML file to your domain's root directory
     - Meta Tag: Add the provided meta tag to your homepage's <head> section
   - Click "Verify" after completing the verification step

4. **Configure Monitoring Settings**
   - Enable Monitoring: Toggle on to activate traffic monitoring
   - Monitoring Interval: Set how frequently to check your domain (in minutes)
   - Click "Save Settings"

### Managing Existing Domains

1. **View Domain List**
   - Navigate to the Domains page
   - Use the search bar to find specific domains
   - Use filters to show domains by status (Verified, Pending, Failed)

2. **Domain Card Actions**
   - View Details: Click on the domain card or the "View" button
   - Edit Domain: Click the "Edit" button (pencil icon)
   - Delete Domain: Click the "Delete" button (trash icon)
   - Get TXT Record: For pending domains, click "Get TXT" to see verification details
   - Verify Domain: For pending domains, click "Verify" to check verification status
   - Regenerate Token: Click the refresh icon next to "Get TXT" to generate a new verification token

## Rule Management

### Creating Traffic Interception Rules

1. **Navigate to Rules Page**
   - Click on "Rules" in the sidebar menu
   - Click the "+ Create Rule" button

2. **Basic Rule Information**
   - Rule Name: Enter a descriptive name
   - Rule Type: Choose from:
     - Bot Detection: Identify and manage bot traffic
     - Rate Limiting: Prevent excessive requests
     - Content Protection: Protect specific content
   - Priority: Set rule priority (higher numbers execute first)
   - Status: Active or Inactive

3. **Define Rule Conditions**
   - Click "Add Condition"
   - Select Field: User Agent, IP Address, Request Path, etc.
   - Select Operator: Equals, Contains, Starts With, etc.
   - Enter Value: The value to match against

4. **Define Rule Actions**
   - Select Action Type:
     - Block Request: Prevent the request from reaching your server
     - Allow Request: Explicitly allow the request
     - Rate Limit: Apply rate limiting
     - Challenge: Present a CAPTCHA or other challenge
     - Log Only: Just log the request without taking action

5. **Assign to Domains**
   - Select which domains this rule should apply to
   - You can select multiple domains or apply to all domains

6. **Save the Rule**
   - Click "Save Rule" to activate it

## Traffic Monitoring

### Viewing Real-Time Traffic

1. **Navigate to Dashboard**
   - Click on "Dashboard" in the sidebar menu
   - View the real-time traffic widget

2. **Domain-Specific Traffic**
   - Go to Domains page
   - Click on a specific domain
   - View the "Traffic" tab

3. **Traffic Filtering**
   - Use the filter controls to focus on specific traffic:
     - Time Range: Last hour, day, week, etc.
     - Traffic Type: All, Bot, Human
     - Status Codes: All, 2xx, 3xx, 4xx, 5xx

## Best Practices

- Verify all domains promptly after adding them
- Enable monitoring for all production domains
- Start with conservative rules and adjust as needed
- Test rules thoroughly before applying to production domains
- Check the dashboard daily for unusual patterns
- Allow legitimate bots that benefit your site (search engines)
- Block known malicious bots

## Troubleshooting

### Domain Verification Issues

- **DNS TXT Record Not Verifying**
  - Ensure you've added the record exactly as shown
  - Wait up to 48 hours for DNS propagation
  - Check your DNS settings with your domain registrar

### Rule Issues

- **Rule Not Triggering**
  - Check rule status (must be Active)
  - Verify rule conditions match expected traffic
  - Check rule priority (may be overridden by higher priority rules)
  - Ensure rule is assigned to the correct domain

### Monitoring Issues

- **No Traffic Data Showing**
  - Verify WebSocket connection is active
  - Check that monitoring is enabled for the domain
  - Ensure the domain is receiving traffic