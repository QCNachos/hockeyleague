from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..extensions import db

draft_bp = Blueprint('draft', __name__)


@draft_bp.route('/', methods=['GET'])
def get_draft_info():
    """Get draft information"""
    # This is a placeholder. Actual implementation will depend on your Draft model
    return jsonify({"message": "Draft API - Info endpoint"}), 200


@draft_bp.route('/prospects', methods=['GET'])
def get_draft_prospects():
    """Get draft prospects"""
    # This is a placeholder. Actual implementation will depend on your Player model
    return jsonify({"message": "Draft API - Prospects endpoint"}), 200
