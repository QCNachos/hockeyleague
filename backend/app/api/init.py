from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..utils.db_init import init_nhl_data

init_bp = Blueprint('init', __name__)


@init_bp.route('/nhl-data', methods=['POST'])
@jwt_required()
def initialize_nhl_data():
    """Initialize database with NHL data"""
    result = init_nhl_data()
    return jsonify({
        "message": "NHL data initialized successfully",
        "data": result
    }), 201 