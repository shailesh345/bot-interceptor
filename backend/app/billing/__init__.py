# Billing Blueprint
from flask import Blueprint

billing = Blueprint('billing', __name__)

# Import routes
from . import routes
