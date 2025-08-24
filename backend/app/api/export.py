"""
Export API for Analytics Data
Provides data export functionality in various formats
"""

import csv
import json
import io
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc, and_
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from ..models import User, Domain, TrafficLog, BotProfile
from .. import db

export = Blueprint('export', __name__)

@export.route('/analytics/csv', methods=['POST'])
@jwt_required()
def export_analytics_csv():
    """Export analytics data to CSV format"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        export_type = data.get('type', 'traffic')  # traffic, bots, performance
        days = data.get('days', 30)
        domain_id = data.get('domain_id')
        
        # Get data based on export type
        if export_type == 'traffic':
            csv_data = export_traffic_data(user, days, domain_id)
        elif export_type == 'bots':
            csv_data = export_bot_data(user, days, domain_id)
        elif export_type == 'performance':
            csv_data = export_performance_data(user, days, domain_id)
        else:
            return jsonify({'error': 'Invalid export type'}), 400
        
        # Create CSV file
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        if csv_data and len(csv_data) > 0:
            writer.writerow(csv_data[0].keys())
            
            # Write data rows
            for row in csv_data:
                writer.writerow(row.values())
        
        output.seek(0)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{export_type}_analytics_{timestamp}.csv"
        
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        current_app.logger.error(f"CSV export error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@export.route('/analytics/json', methods=['POST'])
@jwt_required()
def export_analytics_json():
    """Export analytics data to JSON format"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        export_type = data.get('type', 'traffic')
        days = data.get('days', 30)
        domain_id = data.get('domain_id')
        
        # Get data based on export type
        if export_type == 'traffic':
            json_data = export_traffic_data(user, days, domain_id)
        elif export_type == 'bots':
            json_data = export_bot_data(user, days, domain_id)
        elif export_type == 'performance':
            json_data = export_performance_data(user, days, domain_id)
        else:
            return jsonify({'error': 'Invalid export type'}), 400
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{export_type}_analytics_{timestamp}.json"
        
        # Create JSON response
        response = jsonify({
            'success': True,
            'data': json_data,
            'export_info': {
                'type': export_type,
                'days': days,
                'domain_id': domain_id,
                'exported_at': datetime.now().isoformat(),
                'total_records': len(json_data)
            }
        })
        
        # Set headers for file download
        response.headers['Content-Disposition'] = f'attachment; filename={filename}'
        response.headers['Content-Type'] = 'application/json'
        
        return response
        
    except Exception as e:
        current_app.logger.error(f"JSON export error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@export.route('/analytics/pdf', methods=['POST'])
@jwt_required()
def export_analytics_pdf():
    """Export analytics data to PDF format"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        export_type = data.get('type', 'traffic')
        days = data.get('days', 30)
        domain_id = data.get('domain_id')
        
        # Get data based on export type
        if export_type == 'traffic':
            pdf_data = export_traffic_data(user, days, domain_id)
        elif export_type == 'bots':
            pdf_data = export_bot_data(user, days, domain_id)
        elif export_type == 'performance':
            pdf_data = export_performance_data(user, days, domain_id)
        else:
            return jsonify({'error': 'Invalid export type'}), 400
        
        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        
        # Add title
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        title = Paragraph(f"{export_type.title()} Analytics Report", title_style)
        elements.append(title)
        
        # Add export info
        info_style = styles['Normal']
        info_text = f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>"
        info_text += f"Time period: Last {days} days<br/>"
        info_text += f"Total records: {len(pdf_data)}"
        
        info_para = Paragraph(info_text, info_style)
        elements.append(info_para)
        elements.append(Spacer(1, 20))
        
        # Create summary table
        if pdf_data:
            summary_data = create_summary_table(pdf_data, export_type)
            summary_table = Table(summary_data)
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(summary_table)
            elements.append(Spacer(1, 20))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{export_type}_analytics_{timestamp}.pdf"
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        current_app.logger.error(f"PDF export error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def export_traffic_data(user, days, domain_id=None):
    """Export traffic data for CSV/JSON/PDF export"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Build query
    query = TrafficLog.query.join(Domain).filter(
        Domain.tenant_id == user.tenant_id,
        TrafficLog.timestamp >= start_date,
        TrafficLog.timestamp <= end_date
    )
    
    if domain_id:
        query = query.filter(Domain.id == domain_id)
    
    logs = query.order_by(TrafficLog.timestamp.desc()).all()
    
    # Convert to exportable format
    export_data = []
    for log in logs:
        export_data.append({
            'timestamp': log.timestamp.isoformat() if log.timestamp else '',
            'client_ip': log.client_ip,
            'user_agent': log.user_agent or '',
            'request_method': log.request_method or '',
            'request_path': log.request_path or '',
            'response_status': log.response_status or '',
            'response_time': log.response_time or 0,
            'is_bot': log.is_bot,
            'bot_type': log.bot_type or '',
            'geo_country': log.geo_country or '',
            'geo_city': log.geo_city or '',
            'action_taken': log.action_taken or '',
            'rule_matched': log.rule_matched or '',
            'domain': log.domain.domain_name if log.domain else ''
        })
    
    return export_data

def export_bot_data(user, days, domain_id=None):
    """Export bot detection data for export"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Build query for bot requests only
    query = TrafficLog.query.join(Domain).filter(
        Domain.tenant_id == user.tenant_id,
        TrafficLog.timestamp >= start_date,
        TrafficLog.timestamp <= end_date,
        TrafficLog.is_bot == True
    )
    
    if domain_id:
        query = query.filter(Domain.id == domain_id)
    
    logs = query.order_by(TrafficLog.timestamp.desc()).all()
    
    # Convert to exportable format
    export_data = []
    for log in logs:
        export_data.append({
            'timestamp': log.timestamp.isoformat() if log.timestamp else '',
            'client_ip': log.client_ip,
            'user_agent': log.user_agent or '',
            'bot_type': log.bot_type or '',
            'request_path': log.request_path or '',
            'action_taken': log.action_taken or '',
            'geo_country': log.geo_country or '',
            'geo_city': log.geo_city or '',
            'domain': log.domain.domain_name if log.domain else '',
            'response_status': log.response_status or ''
        })
    
    return export_data

def export_performance_data(user, days, domain_id=None):
    """Export performance metrics data for export"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Build query
    query = TrafficLog.query.join(Domain).filter(
        Domain.tenant_id == user.tenant_id,
        TrafficLog.timestamp >= start_date,
        TrafficLog.timestamp <= end_date,
        TrafficLog.response_time.isnot(None)
    )
    
    if domain_id:
        query = query.filter(Domain.id == domain_id)
    
    logs = query.order_by(TrafficLog.timestamp.desc()).all()
    
    # Convert to exportable format
    export_data = []
    for log in logs:
        export_data.append({
            'timestamp': log.timestamp.isoformat() if log.timestamp else '',
            'client_ip': log.client_ip,
            'request_method': log.request_method or '',
            'request_path': log.request_path or '',
            'response_status': log.response_status or '',
            'response_time': log.response_time or 0,
            'response_size': log.response_size or 0,
            'processing_time': log.processing_time or 0,
            'domain': log.domain.domain_name if log.domain else '',
            'is_bot': log.is_bot,
            'action_taken': log.action_taken or ''
        })
    
    return export_data

def create_summary_table(data, export_type):
    """Create summary table for PDF export"""
    if not data:
        return [['No data available']]
    
    if export_type == 'traffic':
        # Traffic summary
        total_requests = len(data)
        bot_requests = sum(1 for row in data if row.get('is_bot', False))
        blocked_requests = sum(1 for row in data if row.get('action_taken') == 'block')
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Requests', total_requests],
            ['Bot Requests', bot_requests],
            ['Blocked Requests', blocked_requests],
            ['Bot Percentage', f"{(bot_requests/total_requests*100):.1f}%" if total_requests > 0 else "0%"],
            ['Block Percentage', f"{(blocked_requests/total_requests*100):.1f}%" if total_requests > 0 else "0%"]
        ]
        
    elif export_type == 'bots':
        # Bot summary
        total_bots = len(data)
        bot_types = {}
        for row in data:
            bot_type = row.get('bot_type', 'unknown')
            bot_types[bot_type] = bot_types.get(bot_type, 0) + 1
        
        summary_data = [['Metric', 'Value']]
        summary_data.append(['Total Bot Requests', total_bots])
        for bot_type, count in sorted(bot_types.items(), key=lambda x: x[1], reverse=True):
            summary_data.append([f'{bot_type.title()} Bots', count])
        
    elif export_type == 'performance':
        # Performance summary
        total_requests = len(data)
        response_times = [row.get('response_time', 0) for row in data if row.get('response_time')]
        
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            min_response_time = min(response_times)
            max_response_time = max(response_times)
        else:
            avg_response_time = min_response_time = max_response_time = 0
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Requests', total_requests],
            ['Average Response Time', f"{avg_response_time:.2f}ms"],
            ['Min Response Time', f"{min_response_time:.2f}ms"],
            ['Max Response Time', f"{max_response_time:.2f}ms"]
        ]
        
    else:
        summary_data = [['No summary available']]
    
    return summary_data

@export.route('/analytics/available-exports', methods=['GET'])
@jwt_required()
def get_available_exports():
    """Get list of available export types and their configurations"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        
        export_configs = {
            'traffic': {
                'name': 'Traffic Analytics',
                'description': 'Export traffic logs and patterns',
                'formats': ['csv', 'json', 'pdf'],
                'time_ranges': [7, 30, 90, 365],
                'filters': ['domain', 'date_range', 'bot_status']
            },
            'bots': {
                'name': 'Bot Detection Data',
                'description': 'Export bot detection results and analysis',
                'formats': ['csv', 'json', 'pdf'],
                'time_ranges': [7, 30, 90, 365],
                'filters': ['domain', 'bot_type', 'risk_level']
            },
            'performance': {
                'name': 'Performance Metrics',
                'description': 'Export system performance and response time data',
                'formats': ['csv', 'json', 'pdf'],
                'time_ranges': [1, 7, 30, 90],
                'filters': ['domain', 'response_time_range', 'status_codes']
            }
        }
        
        return jsonify({
            'success': True,
            'export_configs': export_configs,
            'available_domains': [
                {'id': domain.id, 'name': domain.domain_name} 
                for domain in domains
            ]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Available exports error: {str(e)}")
        return jsonify({'error': str(e)}), 500
