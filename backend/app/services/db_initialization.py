from typing import Dict, List, Any
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.team import Team
from ..models.player import Player
from ..models.coach import Coach
from ..models.contract import Contract
from ..models.draft import Draft, DraftPick
import os

# Create a blueprint for initialization endpoints
init_bp = Blueprint('init', __name__)

class DBInitializationService:
    """
    Service for initializing the database and loading sample data.
    """
    
    @staticmethod
    def initialize_database() -> Dict[str, Any]:
        """
        Initialize the database by creating all tables.
        NOTE: This will not delete existing data, but may cause issues if table structures have changed.
        
        Returns:
            Dictionary with initialization status
        """
        try:
            # Create all tables defined by the models
            db.create_all()
            
            return {
                "success": True,
                "message": "Database tables created successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error creating database tables: {str(e)}"
            }
    
    @staticmethod
    def load_sample_data() -> Dict[str, Any]:
        """
        Load sample data into the database.
        This will only add data that doesn't conflict with existing records.
        
        Returns:
            Dictionary with sample data loading status
        """
        try:
            # Import NHL data initialization function
            from ..utils.db_init import init_nhl_data
            
            # Check if data already exists to prevent duplications
            existing_teams = Team.query.count()
            if existing_teams > 0:
                return {
                    "success": False,
                    "message": f"Data already exists ({existing_teams} teams found). To prevent duplicates, no new data was added."
                }
            
            # Load initial data if no teams exist
            result = init_nhl_data()
            
            return {
                "success": True,
                "message": f"Sample data loaded successfully: {result['conferences']} conferences, {result['divisions']} divisions, {result['teams']} teams"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error loading sample data: {str(e)}"
            }
    
    @staticmethod
    def reset_database(confirmation_code: str = None) -> Dict[str, Any]:
        """
        Reset the database by dropping all tables and reinitializing.
        This permanently deletes all data and requires a confirmation code.
        
        Args:
            confirmation_code: Required code to confirm the destructive action
        
        Returns:
            Dictionary with reset status
        """
        try:
            # Validation: Require a confirmation code
            expected_code = os.environ.get("DB_RESET_CODE", "CONFIRM_DB_RESET")
            
            if not confirmation_code:
                return {
                    "success": False,
                    "message": "ERROR: Database reset requires confirmation code. No action taken."
                }
            
            if confirmation_code != expected_code:
                return {
                    "success": False,
                    "message": "ERROR: Invalid confirmation code. No action taken."
                }
            
            # Additional validation: Prevent reset in production
            if os.environ.get("FLASK_ENV") == "production":
                return {
                    "success": False,
                    "message": "ERROR: Database reset is disabled in production environment. No action taken."
                }
            
            # Drop all tables
            db.drop_all()
            
            # Recreate all tables
            db.create_all()
            
            return {
                "success": True,
                "message": "⚠️ DATABASE RESET SUCCESSFULLY. All data has been deleted and tables recreated."
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error resetting database: {str(e)}"
            }


# API endpoints that utilize the initialization service

@init_bp.route('/create-tables', methods=['POST'])
@jwt_required()
def create_tables():
    """Create all database tables without dropping existing data"""
    # Log who is performing this action
    current_user = get_jwt_identity()
    print(f"User {current_user} is creating database tables")
    
    result = DBInitializationService.initialize_database()
    
    if result["success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 500


@init_bp.route('/sample-data', methods=['POST'])
@jwt_required()
def load_sample_data():
    """Load sample data into the database (skips if data already exists)"""
    # Log who is performing this action
    current_user = get_jwt_identity()
    print(f"User {current_user} is loading sample data")
    
    result = DBInitializationService.load_sample_data()
    
    if result["success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 400  # Use 400 for issues that aren't server errors


@init_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_database():
    """
    Reset the database by dropping all tables and recreating them.
    
    DANGER: This permanently deletes all data!
    Requires confirmation_code in the request body.
    """
    # Log who is performing this action
    current_user = get_jwt_identity()
    print(f"⚠️ User {current_user} is attempting database reset")
    
    # Get confirmation code from request
    data = request.get_json()
    confirmation_code = data.get('confirmation_code') if data else None
    
    # Require confirmation code
    if not confirmation_code:
        return jsonify({
            "success": False,
            "message": "ERROR: Database reset requires confirmation code. Send {'confirmation_code': 'YOUR_CODE'} in the request body."
        }), 400
    
    result = DBInitializationService.reset_database(confirmation_code)
    
    if result["success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 400 