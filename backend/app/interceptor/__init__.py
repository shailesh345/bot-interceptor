# Interceptor Blueprint
from flask import Blueprint

interceptor = Blueprint('interceptor', __name__)

# Import services
from .domain_verification_enhanced import domain_verification_service
from .traffic_processor_enhanced import traffic_processor

# Import routes
from . import routes
