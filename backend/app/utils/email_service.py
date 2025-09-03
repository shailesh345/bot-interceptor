"""
Email Service for automated company outreach and notifications
Handles sending emails to AI companies when their bots are detected
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from typing import Dict, List, Optional
import json
from jinja2 import Template
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending automated emails to AI companies"""
    
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@yourplatform.com')
        self.from_name = os.getenv('FROM_NAME', 'YourPlatform Bot Access Team')
        
        # Email templates
        self.templates = self._load_email_templates()
    
    def _load_email_templates(self) -> Dict[str, Template]:
        """Load email templates for different scenarios"""
        templates = {
            'ai_company_outreach': Template("""
Subject: Your AI Bot Detected - Purchase Credits for Continued Access

Dear {{ company_name }} Team,

We've detected your AI crawling bot attempting to access content on our platform. Our advanced detection system identified the following:

**Detection Details:**
- Bot Type: {{ bot_type }}
- Detection Confidence: {{ detection_confidence }}%
- First Detected: {{ detection_time }}
- Access Attempts: {{ access_attempts }}

**Why This Matters:**
Our platform protects valuable content from unauthorized AI training data collection. To ensure fair compensation for content creators and maintain sustainable operations, we require AI companies to purchase credits before crawling.

**Next Steps:**
1. **Purchase Credits**: Visit {{ credit_purchase_url }} to select a package
2. **API Access**: Get instant API access upon purchase
3. **Documentation**: Review our AI access guidelines at {{ documentation_url }}

**Available Packages:**
- **Starter**: 10,000 credits ($99) - Perfect for small projects
- **Professional**: 50,000 credits ($399) - For growing AI companies
- **Enterprise**: 200,000 credits ($1,499) - For large-scale training
- **Custom**: Contact us for tailored solutions

**Benefits of Official Access:**
✓ Higher rate limits for faster crawling
✓ Structured data access via API
✓ Priority support
✓ Legal compliance
✓ No IP blocking or restrictions

**Special Offer for {{ company_name }}:**
As a recognized AI company, you're eligible for our partner program with additional benefits and volume discounts.

**Contact Us:**
If you have questions or need a custom solution, please contact our AI partnerships team at partnerships@yourplatform.com or visit {{ contact_url }}.

We look forward to supporting your AI development while ensuring fair compensation for content creators.

Best regards,
{{ from_name }}
{{ platform_name }}

P.S. Your bot will continue to be redirected to our credit purchase page until valid credits are obtained.
            """),
            
            'credit_purchase_confirmation': Template("""
Subject: Credit Purchase Confirmed - API Access Activated

Dear {{ company_name }},

Thank you for purchasing credits! Your API access is now active.

**Purchase Details:**
- Package: {{ package_name }}
- Credits: {{ credits }} crawl credits
- Amount: ${{ price }} USD
- Valid Until: {{ expiry_date }}
- Purchase ID: {{ purchase_id }}

**API Access Information:**
- API Endpoint: {{ api_endpoint }}
- Access Token: {{ access_token }}
- Documentation: {{ api_docs_url }}

**Quick Start Guide:**
1. Include your access token in the Authorization header:
   Authorization: Bearer {{ access_token }}

2. Make requests to our API endpoint:
   GET {{ api_endpoint }}/crawl?url=https://example.com

3. Monitor your credit usage:
   GET {{ api_endpoint }}/credits/balance

**Rate Limits:**
Based on your package, you have the following rate limits:
- Requests per second: {{ rate_limit }}
- Concurrent connections: {{ concurrent_limit }}

**Support:**
- Technical documentation: {{ api_docs_url }}
- Support email: support@yourplatform.com
- Status page: https://status.yourplatform.com

**Next Steps:**
1. Review our API documentation
2. Set up your crawling infrastructure
3. Monitor your credit usage
4. Contact us for any assistance

Thank you for choosing {{ platform_name }} for your AI training data needs!

Best regards,
{{ from_name }}
{{ platform_name }}
            """),
            
            'low_credit_warning': Template("""
Subject: Low Credit Balance - Top Up Soon

Dear {{ company_name }},

This is a friendly reminder that your crawl credit balance is running low.

**Current Status:**
- Remaining Credits: {{ remaining_credits }}
- Estimated Days Left: {{ days_left }}
- Current Usage Rate: {{ daily_usage }} credits/day

**Recommended Action:**
To avoid interruption in your AI data collection, we recommend purchasing additional credits soon.

**Quick Purchase Link:** {{ purchase_url }}

**Your Usage Statistics:**
- Total Credits Used: {{ total_used }}
- Average Daily Usage: {{ avg_daily_usage }}
- Most Accessed Content: {{ top_content_type }}

**Special Offer:**
Purchase within the next 48 hours and receive a 10% bonus on credits!

Best regards,
{{ from_name }}
{{ platform_name }}
            """),
            
            'custom_package_request': Template("""
Subject: Custom Package Request Received - {{ company_name }}

Internal Notification - Sales Team

A new custom package request has been received:

**Company Details:**
- Company Name: {{ company_name }}
- Contact Email: {{ email }}
- Requested Credits: {{ requested_credits }}
- Message: {{ message }}
- Timestamp: {{ timestamp }}

**Recommended Actions:**
1. Research the company's AI products and size
2. Prepare a custom quote based on their needs
3. Schedule a discovery call within 24 hours
4. Offer enterprise features and dedicated support

**Company Research Links:**
- Search: https://www.google.com/search?q={{ company_name }}
- LinkedIn: https://www.linkedin.com/company/{{ company_name }}

Please follow up within 24 hours.
            """),
            
            'follow_up_outreach': Template("""
Subject: Re: Your AI Bot Detected - Special Offer Inside

Dear {{ company_name }} Team,

Following up on our previous message about your AI bot detection.

We understand you're busy building amazing AI products. To make it easier for you, we're offering:

**Limited Time Offer:**
- 20% discount on all packages
- Free API integration support
- Priority migration assistance
- Extended validity period

**Why Partner With Us:**
1. **Legal Compliance**: Ensure your AI training respects content rights
2. **Quality Data**: Access high-quality, structured content
3. **Efficiency**: Our API is 10x faster than web crawling
4. **Support**: Dedicated technical team for your integration

**Success Stories:**
Several leading AI companies already use our platform for training data:
- Reduced data collection time by 75%
- Improved model quality with structured data
- Eliminated legal concerns around web scraping

**Take Action Now:**
This special offer expires in 72 hours. Visit {{ special_offer_url }} to claim your discount.

Questions? Reply to this email or schedule a call: {{ calendar_link }}

Best regards,
{{ from_name }}
{{ platform_name }}

P.S. Your bot ({{ bot_type }}) has been detected {{ detection_count }} times in the last week.
            """)
        }
        
        return templates
    
    def send_email(self, to_email: str, subject: str, body: str, 
                   cc_emails: List[str] = None, attachments: List[Dict] = None) -> bool:
        """Send an email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if cc_emails:
                msg['Cc'] = ', '.join(cc_emails)
            
            # Add body
            msg.attach(MIMEText(body, 'plain'))
            
            # Add attachments if any
            if attachments:
                for attachment in attachments:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment['content'])
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f"attachment; filename= {attachment['filename']}"
                    )
                    msg.attach(part)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                
                recipients = [to_email]
                if cc_emails:
                    recipients.extend(cc_emails)
                
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_ai_company_outreach(self, data: Dict) -> bool:
        """Send outreach email to detected AI company"""
        try:
            template = self.templates['ai_company_outreach']
            
            # Prepare template data
            template_data = {
                'company_name': data['company_name'],
                'bot_type': data['bot_type'],
                'detection_confidence': data.get('detection_confidence', 95),
                'detection_time': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
                'access_attempts': data.get('detection_count', 1),
                'credit_purchase_url': data['credit_purchase_url'],
                'documentation_url': data['documentation_url'],
                'contact_url': data['contact_url'],
                'from_name': self.from_name,
                'platform_name': 'YourPlatform'
            }
            
            # Render template
            body = template.render(**template_data)
            
            # Extract subject from body (first line)
            lines = body.strip().split('\n')
            subject = lines[0].replace('Subject: ', '')
            body = '\n'.join(lines[2:])  # Skip subject and empty line
            
            # Send email
            return self.send_email(
                to_email=data['contact_email'],
                subject=subject,
                body=body,
                cc_emails=['partnerships@yourplatform.com']  # CC to internal team
            )
            
        except Exception as e:
            logger.error(f"Failed to send AI company outreach: {str(e)}")
            return False
    
    def send_credit_purchase_confirmation(self, data: Dict) -> bool:
        """Send confirmation email after credit purchase"""
        try:
            template = self.templates['credit_purchase_confirmation']
            
            # Calculate rate limits based on package
            rate_limits = {
                'starter': {'rate_limit': 10, 'concurrent_limit': 5},
                'professional': {'rate_limit': 50, 'concurrent_limit': 20},
                'enterprise': {'rate_limit': 100, 'concurrent_limit': 50},
                'custom': {'rate_limit': 'Unlimited', 'concurrent_limit': 'Unlimited'}
            }
            
            package_limits = rate_limits.get(
                data.get('package_id', 'starter'),
                rate_limits['starter']
            )
            
            # Prepare template data
            template_data = {
                'company_name': data['company_name'],
                'package_name': data['package_name'],
                'credits': f"{data['credits']:,}",
                'price': f"{data['price']:.2f}",
                'expiry_date': data.get('expires_at', 'N/A'),
                'purchase_id': data.get('purchase_id', 'N/A'),
                'api_endpoint': data.get('api_endpoint', 'https://api.yourplatform.com/v1'),
                'access_token': data['access_token'],
                'api_docs_url': data['api_docs_url'],
                'rate_limit': package_limits['rate_limit'],
                'concurrent_limit': package_limits['concurrent_limit'],
                'from_name': self.from_name,
                'platform_name': 'YourPlatform'
            }
            
            # Render template
            body = template.render(**template_data)
            
            # Extract subject
            lines = body.strip().split('\n')
            subject = lines[0].replace('Subject: ', '')
            body = '\n'.join(lines[2:])
            
            # Create API quick start guide as attachment
            api_guide = self._create_api_guide(data)
            attachments = [{
                'filename': 'API_Quick_Start_Guide.txt',
                'content': api_guide.encode('utf-8')
            }]
            
            # Send email
            return self.send_email(
                to_email=data['email'],
                subject=subject,
                body=body,
                attachments=attachments
            )
            
        except Exception as e:
            logger.error(f"Failed to send purchase confirmation: {str(e)}")
            return False
    
    def send_low_credit_warning(self, data: Dict) -> bool:
        """Send warning email when credits are running low"""
        try:
            template = self.templates['low_credit_warning']
            
            # Calculate days left
            if data['daily_usage'] > 0:
                days_left = data['remaining_credits'] / data['daily_usage']
            else:
                days_left = 'N/A'
            
            # Prepare template data
            template_data = {
                'company_name': data['company_name'],
                'remaining_credits': f"{data['remaining_credits']:,}",
                'days_left': f"{days_left:.1f}" if isinstance(days_left, (int, float)) else days_left,
                'daily_usage': f"{data['daily_usage']:,}",
                'total_used': f"{data.get('total_used', 0):,}",
                'avg_daily_usage': f"{data.get('avg_daily_usage', 0):,}",
                'top_content_type': data.get('top_content_type', 'General content'),
                'purchase_url': data['purchase_url'],
                'from_name': self.from_name,
                'platform_name': 'YourPlatform'
            }
            
            # Render template
            body = template.render(**template_data)
            
            # Extract subject
            lines = body.strip().split('\n')
            subject = lines[0].replace('Subject: ', '')
            body = '\n'.join(lines[2:])
            
            # Send email
            return self.send_email(
                to_email=data['email'],
                subject=subject,
                body=body
            )
            
        except Exception as e:
            logger.error(f"Failed to send low credit warning: {str(e)}")
            return False
    
    def send_custom_package_request(self, data: Dict) -> bool:
        """Send internal notification for custom package request"""
        try:
            template = self.templates['custom_package_request']
            
            # Prepare template data
            template_data = {
                'company_name': data['company_name'],
                'email': data['email'],
                'requested_credits': f"{data.get('requested_credits', 0):,}",
                'message': data.get('message', 'No message provided'),
                'timestamp': data['timestamp'].strftime('%Y-%m-%d %H:%M UTC')
            }
            
            # Render template
            body = template.render(**template_data)
            
            # Extract subject
            lines = body.strip().split('\n')
            subject = lines[0].replace('Subject: ', '')
            body = '\n'.join(lines[2:])
            
            # Send to sales team
            sales_emails = os.getenv('SALES_TEAM_EMAILS', 'sales@yourplatform.com').split(',')
            
            for sales_email in sales_emails:
                self.send_email(
                    to_email=sales_email.strip(),
                    subject=subject,
                    body=body
                )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send custom package request: {str(e)}")
            return False
    
    def send_follow_up_outreach(self, data: Dict) -> bool:
        """Send follow-up email to AI companies that haven't responded"""
        try:
            template = self.templates['follow_up_outreach']
            
            # Prepare template data
            template_data = {
                'company_name': data['company_name'],
                'bot_type': data['bot_type'],
                'detection_count': data.get('detection_count', 'multiple'),
                'special_offer_url': f"{data['credit_purchase_url']}&offer=followup20",
                'calendar_link': 'https://calendly.com/yourplatform/ai-partnership',
                'from_name': self.from_name,
                'platform_name': 'YourPlatform'
            }
            
            # Render template
            body = template.render(**template_data)
            
            # Extract subject
            lines = body.strip().split('\n')
            subject = lines[0].replace('Subject: ', '')
            body = '\n'.join(lines[2:])
            
            # Send email
            return self.send_email(
                to_email=data['contact_email'],
                subject=subject,
                body=body,
                cc_emails=['partnerships@yourplatform.com']
            )
            
        except Exception as e:
            logger.error(f"Failed to send follow-up outreach: {str(e)}")
            return False
    
    def _create_api_guide(self, data: Dict) -> str:
        """Create API quick start guide content"""
        guide = f"""
YourPlatform API Quick Start Guide
==================================

Welcome {data['company_name']}!

Your API access is now active. Here's everything you need to get started:

1. AUTHENTICATION
-----------------
Include your access token in all API requests:

curl -H "Authorization: Bearer {data['access_token']}" \\
     {data.get('api_endpoint', 'https://api.yourplatform.com/v1')}/crawl

2. BASIC USAGE
--------------
Crawl a webpage:
GET /crawl?url=https://example.com

Check credit balance:
GET /credits/balance

View usage history:
GET /credits/usage

3. RATE LIMITS
--------------
Your package includes:
- Requests per second: {data.get('rate_limit', 10)}
- Concurrent connections: {data.get('concurrent_limit', 5)}

4. RESPONSE FORMAT
------------------
All responses are in JSON format:
{{
    "success": true,
    "data": {{
        "content": "...",
        "metadata": {{...}},
        "credits_used": 1
    }},
    "remaining_credits": 9999
}}

5. ERROR HANDLING
-----------------
Handle these common errors:
- 401: Invalid or expired token
- 403: Insufficient credits
- 429: Rate limit exceeded
- 500: Server error (retry with backoff)

6. BEST PRACTICES
-----------------
- Cache responses when possible
- Implement exponential backoff for retries
- Monitor your credit usage
- Use webhook notifications for large jobs

7. SUPPORT
----------
- Documentation: {data['api_docs_url']}
- Email: support@yourplatform.com
- Status: https://status.yourplatform.com

Happy crawling!
The YourPlatform Team
"""
        return guide


# Create global instance
email_service = EmailService()
