"""
CAPTCHA and Human Verification System
Provides multiple verification methods to distinguish humans from bots
"""

from flask import Blueprint, jsonify, request, session
from datetime import datetime, timedelta
import uuid
import random
import string
import hashlib
import requests
import os
from typing import Dict, Optional, Tuple
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io
import base64

from ..models import db
from ..models_enhanced import CaptchaChallenge
# from ..utils.rate_limiter import rate_limit  # TODO: Implement rate_limit decorator
from ..interceptor.llm_bot_detector import llm_bot_detector

bp = Blueprint('captcha', __name__, url_prefix='/api/captcha')

# CAPTCHA configuration
CAPTCHA_CONFIG = {
    'recaptcha': {
        'site_key': os.getenv('RECAPTCHA_SITE_KEY'),
        'secret_key': os.getenv('RECAPTCHA_SECRET_KEY'),
        'verify_url': 'https://www.google.com/recaptcha/api/siteverify'
    },
    'hcaptcha': {
        'site_key': os.getenv('HCAPTCHA_SITE_KEY'),
        'secret_key': os.getenv('HCAPTCHA_SECRET_KEY'),
        'verify_url': 'https://hcaptcha.com/siteverify'
    },
    'custom': {
        'difficulty_levels': ['easy', 'medium', 'hard'],
        'expiry_minutes': 5,
        'max_attempts': 3
    }
}


class CaptchaGenerator:
    """Generate custom CAPTCHA challenges"""
    
    def __init__(self):
        self.fonts = self._load_fonts()
        self.backgrounds = self._generate_backgrounds()
    
    def _load_fonts(self):
        """Load fonts for CAPTCHA generation"""
        # In production, load actual font files
        # For now, use default font
        try:
            from PIL import ImageFont
            return {
                'default': ImageFont.load_default(),
                # Add more fonts as needed
            }
        except:
            return {'default': None}
    
    def _generate_backgrounds(self):
        """Generate background patterns"""
        patterns = []
        for _ in range(5):
            pattern = Image.new('RGB', (300, 100), color=(
                random.randint(200, 255),
                random.randint(200, 255),
                random.randint(200, 255)
            ))
            patterns.append(pattern)
        return patterns
    
    def generate_text_captcha(self, difficulty='medium'):
        """Generate text-based CAPTCHA"""
        # Generate random text
        length = {'easy': 4, 'medium': 6, 'hard': 8}.get(difficulty, 6)
        characters = string.ascii_uppercase + string.digits
        if difficulty == 'hard':
            characters += string.ascii_lowercase
        
        text = ''.join(random.choice(characters) for _ in range(length))
        
        # Create image
        width, height = 300, 100
        image = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(image)
        
        # Add background noise
        for _ in range(random.randint(500, 1000)):
            x = random.randint(0, width)
            y = random.randint(0, height)
            color = (
                random.randint(150, 200),
                random.randint(150, 200),
                random.randint(150, 200)
            )
            draw.point((x, y), fill=color)
        
        # Draw text with distortion
        font = self.fonts.get('default')
        text_width, text_height = draw.textsize(text, font=font)
        
        # Position text
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        # Draw each character with slight rotation and offset
        char_x = x
        for char in text:
            # Random color for each character
            char_color = (
                random.randint(0, 100),
                random.randint(0, 100),
                random.randint(0, 100)
            )
            
            # Random offset
            offset_y = random.randint(-5, 5)
            
            draw.text((char_x, y + offset_y), char, fill=char_color, font=font)
            char_width, _ = draw.textsize(char, font=font)
            char_x += char_width + random.randint(-2, 5)
        
        # Add lines for additional difficulty
        if difficulty in ['medium', 'hard']:
            for _ in range(random.randint(3, 6)):
                x1 = random.randint(0, width)
                y1 = random.randint(0, height)
                x2 = random.randint(0, width)
                y2 = random.randint(0, height)
                color = (
                    random.randint(100, 200),
                    random.randint(100, 200),
                    random.randint(100, 200)
                )
                draw.line([(x1, y1), (x2, y2)], fill=color, width=1)
        
        # Apply filters for hard difficulty
        if difficulty == 'hard':
            image = image.filter(ImageFilter.GaussianBlur(radius=0.5))
        
        # Convert to base64
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return text, f"data:image/png;base64,{image_base64}"
    
    def generate_math_captcha(self, difficulty='medium'):
        """Generate math-based CAPTCHA"""
        if difficulty == 'easy':
            a = random.randint(1, 10)
            b = random.randint(1, 10)
            operation = '+'
            answer = a + b
            question = f"{a} + {b} = ?"
        elif difficulty == 'medium':
            a = random.randint(10, 50)
            b = random.randint(1, 20)
            operation = random.choice(['+', '-', '*'])
            if operation == '+':
                answer = a + b
            elif operation == '-':
                answer = a - b
            else:
                answer = a * b
            question = f"{a} {operation} {b} = ?"
        else:  # hard
            a = random.randint(50, 100)
            b = random.randint(10, 50)
            c = random.randint(1, 10)
            answer = (a + b) * c
            question = f"({a} + {b}) × {c} = ?"
        
        return str(answer), question
    
    def generate_puzzle_captcha(self, difficulty='medium'):
        """Generate puzzle-based CAPTCHA"""
        puzzles = {
            'easy': [
                ("What color is the sky on a clear day?", "blue"),
                ("How many days are in a week?", "7"),
                ("What is 2 + 2?", "4")
            ],
            'medium': [
                ("What is the capital of France?", "paris"),
                ("How many minutes in an hour?", "60"),
                ("What comes after Thursday?", "friday")
            ],
            'hard': [
                ("What is the square root of 144?", "12"),
                ("How many bytes in a kilobyte?", "1024"),
                ("What is the chemical symbol for gold?", "au")
            ]
        }
        
        puzzle = random.choice(puzzles.get(difficulty, puzzles['medium']))
        return puzzle[1].lower(), puzzle[0]


# Initialize CAPTCHA generator
captcha_generator = CaptchaGenerator()


@bp.route('/challenge', methods=['POST'])
    # @rate_limit(limit=10, window=60)  # TODO: Implement rate_limit decorator
def create_challenge():
    """Create a new CAPTCHA challenge"""
    try:
        data = request.get_json()
        
        # Get request info
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
        user_agent = request.headers.get('User-Agent', '')
        
        # Check if it's a suspected bot
        request_data = {
            'client_ip': ip_address,
            'user_agent': user_agent,
            'request_path': request.path,
            'headers': dict(request.headers)
        }
        
        bot_detection = llm_bot_detector.detect_llm_bot(request_data)
        
        # Determine CAPTCHA type and difficulty based on bot detection
        if bot_detection['confidence'] > 0.8:
            captcha_type = data.get('type', 'custom')
            difficulty = 'hard'
        elif bot_detection['confidence'] > 0.5:
            captcha_type = data.get('type', 'custom')
            difficulty = 'medium'
        else:
            captcha_type = data.get('type', 'recaptcha')
            difficulty = 'easy'
        
        # Generate challenge ID
        challenge_id = str(uuid.uuid4())
        
        # Create challenge based on type
        if captcha_type == 'recaptcha':
            # Return reCAPTCHA configuration
            challenge_data = {
                'type': 'recaptcha',
                'site_key': CAPTCHA_CONFIG['recaptcha']['site_key'],
                'challenge_id': challenge_id
            }
            answer = None
            
        elif captcha_type == 'hcaptcha':
            # Return hCaptcha configuration
            challenge_data = {
                'type': 'hcaptcha',
                'site_key': CAPTCHA_CONFIG['hcaptcha']['site_key'],
                'challenge_id': challenge_id
            }
            answer = None
            
        else:  # custom CAPTCHA
            # Generate custom challenge
            challenge_subtype = data.get('subtype', 'text')
            
            if challenge_subtype == 'math':
                answer, question = captcha_generator.generate_math_captcha(difficulty)
                challenge_data = {
                    'type': 'custom',
                    'subtype': 'math',
                    'question': question,
                    'challenge_id': challenge_id
                }
            elif challenge_subtype == 'puzzle':
                answer, question = captcha_generator.generate_puzzle_captcha(difficulty)
                challenge_data = {
                    'type': 'custom',
                    'subtype': 'puzzle',
                    'question': question,
                    'challenge_id': challenge_id
                }
            else:  # text
                answer, image = captcha_generator.generate_text_captcha(difficulty)
                challenge_data = {
                    'type': 'custom',
                    'subtype': 'text',
                    'image': image,
                    'challenge_id': challenge_id
                }
        
        # Store challenge in database
        challenge = CaptchaChallenge(
            challenge_id=challenge_id,
            ip_address=ip_address,
            user_agent=user_agent,
            challenge_type=f"{captcha_type}:{challenge_data.get('subtype', 'default')}",
            created_at=datetime.utcnow()
        )
        db.session.add(challenge)
        
        # Store answer in session (encrypted)
        if answer:
            session[f'captcha_{challenge_id}'] = hashlib.sha256(
                answer.lower().encode()
            ).hexdigest()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'challenge': challenge_data,
            'expires_in': CAPTCHA_CONFIG['custom']['expiry_minutes'] * 60,
            'difficulty': difficulty,
            'bot_suspected': bot_detection['confidence'] > 0.5
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/verify', methods=['POST'])
    # @rate_limit(limit=5, window=60)  # TODO: Implement rate_limit decorator
def verify_challenge():
    """Verify CAPTCHA challenge response"""
    try:
        data = request.get_json()
        
        challenge_id = data.get('challenge_id')
        response = data.get('response')
        
        if not challenge_id or not response:
            return jsonify({
                'success': False,
                'error': 'Missing challenge_id or response'
            }), 400
        
        # Get challenge from database
        challenge = CaptchaChallenge.query.filter_by(
            challenge_id=challenge_id
        ).first()
        
        if not challenge:
            return jsonify({
                'success': False,
                'error': 'Invalid challenge'
            }), 404
        
        # Check if expired
        if challenge.is_expired():
            return jsonify({
                'success': False,
                'error': 'Challenge expired'
            }), 400
        
        # Check attempts
        if challenge.attempts >= CAPTCHA_CONFIG['custom']['max_attempts']:
            return jsonify({
                'success': False,
                'error': 'Max attempts exceeded'
            }), 400
        
        # Update attempt
        challenge.attempts += 1
        challenge.attempted_at = datetime.utcnow()
        
        # Verify based on type
        challenge_type = challenge.challenge_type.split(':')[0]
        success = False
        score = 0.0
        
        if challenge_type == 'recaptcha':
            # Verify with Google reCAPTCHA
            verify_response = requests.post(
                CAPTCHA_CONFIG['recaptcha']['verify_url'],
                data={
                    'secret': CAPTCHA_CONFIG['recaptcha']['secret_key'],
                    'response': response,
                    'remoteip': request.remote_addr
                }
            )
            result = verify_response.json()
            success = result.get('success', False)
            score = result.get('score', 0.0)
            
        elif challenge_type == 'hcaptcha':
            # Verify with hCaptcha
            verify_response = requests.post(
                CAPTCHA_CONFIG['hcaptcha']['verify_url'],
                data={
                    'secret': CAPTCHA_CONFIG['hcaptcha']['secret_key'],
                    'response': response,
                    'remoteip': request.remote_addr
                }
            )
            result = verify_response.json()
            success = result.get('success', False)
            score = 1.0 if success else 0.0
            
        else:  # custom CAPTCHA
            # Get stored answer from session
            stored_answer = session.get(f'captcha_{challenge_id}')
            if stored_answer:
                # Hash the response and compare
                response_hash = hashlib.sha256(
                    response.lower().encode()
                ).hexdigest()
                success = response_hash == stored_answer
                score = 1.0 if success else 0.0
                
                # Clean up session
                session.pop(f'captcha_{challenge_id}', None)
        
        # Update challenge
        if success:
            challenge.is_solved = True
            challenge.solved_at = datetime.utcnow()
            challenge.score = score
        
        db.session.commit()
        
        # Generate verification token if successful
        verification_token = None
        if success:
            verification_token = str(uuid.uuid4())
            # Store token with expiry (in production, use Redis)
            session[f'verified_{verification_token}'] = {
                'timestamp': datetime.utcnow().isoformat(),
                'ip': request.remote_addr,
                'score': score
            }
        
        return jsonify({
            'success': success,
            'verification_token': verification_token,
            'score': score,
            'attempts_remaining': CAPTCHA_CONFIG['custom']['max_attempts'] - challenge.attempts
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify a CAPTCHA verification token"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({
                'valid': False,
                'error': 'No token provided'
            }), 400
        
        # Check token in session (in production, use Redis)
        token_data = session.get(f'verified_{token}')
        
        if not token_data:
            return jsonify({
                'valid': False,
                'error': 'Invalid token'
            }), 404
        
        # Check token age (valid for 10 minutes)
        token_time = datetime.fromisoformat(token_data['timestamp'])
        if datetime.utcnow() - token_time > timedelta(minutes=10):
            session.pop(f'verified_{token}', None)
            return jsonify({
                'valid': False,
                'error': 'Token expired'
            }), 400
        
        return jsonify({
            'valid': True,
            'score': token_data['score'],
            'verified_at': token_data['timestamp']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/behavioral-analysis', methods=['POST'])
def analyze_behavior():
    """Analyze user behavior for bot detection"""
    try:
        data = request.get_json()
        
        # Behavioral indicators
        mouse_movements = data.get('mouse_movements', [])
        key_strokes = data.get('key_strokes', [])
        touch_events = data.get('touch_events', [])
        time_on_page = data.get('time_on_page', 0)
        scroll_patterns = data.get('scroll_patterns', [])
        
        # Analyze patterns
        is_human_score = 0.0
        evidence = []
        
        # Mouse movement analysis
        if mouse_movements:
            # Check for natural curves and acceleration
            movement_variance = np.var([m['x'] for m in mouse_movements])
            if movement_variance > 100:
                is_human_score += 0.3
                evidence.append('natural_mouse_movement')
            else:
                evidence.append('linear_mouse_movement')
        
        # Keystroke analysis
        if key_strokes:
            # Check typing rhythm
            intervals = []
            for i in range(1, len(key_strokes)):
                interval = key_strokes[i]['timestamp'] - key_strokes[i-1]['timestamp']
                intervals.append(interval)
            
            if intervals:
                interval_variance = np.var(intervals)
                if interval_variance > 50:
                    is_human_score += 0.2
                    evidence.append('natural_typing_rhythm')
                else:
                    evidence.append('mechanical_typing')
        
        # Time on page
        if 5 < time_on_page < 300:  # Between 5 seconds and 5 minutes
            is_human_score += 0.2
            evidence.append('reasonable_time_on_page')
        
        # Touch events (mobile)
        if touch_events:
            is_human_score += 0.2
            evidence.append('touch_interaction')
        
        # Scroll patterns
        if scroll_patterns:
            # Check for natural scrolling
            scroll_variance = np.var([s['delta'] for s in scroll_patterns])
            if scroll_variance > 10:
                is_human_score += 0.1
                evidence.append('natural_scrolling')
        
        # Determine if human
        is_likely_human = is_human_score > 0.5
        
        return jsonify({
            'is_likely_human': is_likely_human,
            'confidence_score': min(is_human_score, 1.0),
            'evidence': evidence,
            'recommendation': 'allow' if is_likely_human else 'challenge'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/stats', methods=['GET'])
def get_captcha_stats():
    """Get CAPTCHA statistics"""
    try:
        # Time range
        hours = request.args.get('hours', 24, type=int)
        since = datetime.utcnow() - timedelta(hours=hours)
        
        # Get statistics
        total_challenges = CaptchaChallenge.query.filter(
            CaptchaChallenge.created_at >= since
        ).count()
        
        solved_challenges = CaptchaChallenge.query.filter(
            CaptchaChallenge.created_at >= since,
            CaptchaChallenge.is_solved == True
        ).count()
        
        # Get by type
        type_stats = db.session.query(
            CaptchaChallenge.challenge_type,
            db.func.count(CaptchaChallenge.id).label('count'),
            db.func.avg(CaptchaChallenge.attempts).label('avg_attempts'),
            db.func.sum(CaptchaChallenge.is_solved).label('solved')
        ).filter(
            CaptchaChallenge.created_at >= since
        ).group_by(CaptchaChallenge.challenge_type).all()
        
        # Format stats
        stats_by_type = {}
        for stat in type_stats:
            stats_by_type[stat.challenge_type] = {
                'total': stat.count,
                'solved': stat.solved or 0,
                'solve_rate': (stat.solved or 0) / stat.count * 100 if stat.count > 0 else 0,
                'avg_attempts': float(stat.avg_attempts or 0)
            }
        
        return jsonify({
            'period_hours': hours,
            'total_challenges': total_challenges,
            'solved_challenges': solved_challenges,
            'overall_solve_rate': solved_challenges / total_challenges * 100 if total_challenges > 0 else 0,
            'by_type': stats_by_type
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
