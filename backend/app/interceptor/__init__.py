# Interceptor Blueprint
from flask import Blueprint

interceptor = Blueprint('interceptor', __name__)

from app.interceptor import routes
