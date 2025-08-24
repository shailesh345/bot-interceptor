# Admin Blueprint
from flask import Blueprint

admin = Blueprint('admin', __name__)

# Import routes
from . import routes
