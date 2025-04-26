from typing import Dict, List, Any
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..services.team_service import Team
from ..services.coach import Coach
from ..services.player import Player
from ..services.game_simulation import Game
from ..services.draft.draft_engine import Draft, DraftPick
from ..services.contract_manager import Contract
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

# Development-only route for initializing the database without authentication
@init_bp.route('/dev-init', methods=['GET'])
def dev_initialize():
    """Initialize the database for development without requiring authentication"""
    try:
        # Only allow this in development environment
        if os.environ.get("FLASK_ENV") == "production":
            return jsonify({
                "success": False,
                "message": "ERROR: Development initialization is disabled in production environment."
            }), 403
        
        # Print current team count for debugging
        team_count = 0
        try:
            team_count = Team.query.count()
            print(f"DEBUG: Current team count before initialization: {team_count}")
        except Exception as team_count_err:
            print(f"DEBUG: Error counting teams: {str(team_count_err)}")
        
        # Create tables
        db_init_result = DBInitializationService.initialize_database()
        print(f"DEBUG: Table initialization result: {db_init_result}")
        
        if not db_init_result["success"]:
            return jsonify(db_init_result), 500
            
        # Load sample data if requested
        load_data = request.args.get('load_data', 'true').lower() == 'true'
        
        if load_data:
            try:
                sample_data_result = DBInitializationService.load_sample_data()
                print(f"DEBUG: Sample data result: {sample_data_result}")
                
                # Check team count after loading
                try:
                    new_team_count = Team.query.count()
                    print(f"DEBUG: Team count after loading data: {new_team_count}")
                except Exception as e:
                    print(f"DEBUG: Error counting teams after loading: {str(e)}")
                
                return jsonify({
                    "db_init": db_init_result,
                    "sample_data": sample_data_result,
                    "team_count": Team.query.count(),
                    "message": "Development database initialization complete"
                }), 200
            except Exception as sample_data_err:
                print(f"DEBUG: Error loading sample data: {str(sample_data_err)}")
                return jsonify({
                    "db_init": db_init_result,
                    "sample_data": {
                        "success": False,
                        "message": f"Error loading sample data: {str(sample_data_err)}"
                    },
                    "message": "Database tables created but failed to load sample data"
                }), 500
        
        return jsonify({
            "db_init": db_init_result,
            "message": "Development database tables created (no sample data loaded)"
        }), 200
    except Exception as e:
        print(f"DEBUG: Unhandled exception in dev-init: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": f"Error in dev initialization: {str(e)}"
        }), 500 

# Add a simple database health check endpoint without authentication
@init_bp.route('/db-health', methods=['GET'])
def check_db_health():
    """Check database health and connection"""
    try:
        # Try to execute a simple SQL query
        from sqlalchemy import text
        result = db.session.execute(text('SELECT 1')).scalar()
        
        if result == 1:
            # Check if database has been initialized
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            all_tables = inspector.get_table_names()
            
            # Get DB connection info (sanitized for security)
            db_url = str(db.engine.url)
            # Remove potential password from URL for security
            if '@' in db_url:
                parts = db_url.split('@')
                if '://' in parts[0]:
                    prefix = parts[0].split('://')[0]
                    db_url = f"{prefix}://****@{parts[1]}"
            
            # Try to get counts of crucial tables
            tables_count = {}
            try:
                tables_count['teams'] = Team.query.count()
                tables_count['players'] = Player.query.count()
            except Exception as count_err:
                tables_count['error'] = str(count_err)
                
            return jsonify({
                'status': 'healthy',
                'database_connection': True,
                'tables': all_tables,
                'database_url': db_url,
                'tables_count': tables_count
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Database returned unexpected result',
                'result': result
            }), 500
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        
        return jsonify({
            'status': 'error',
            'message': f'Database connection failed: {str(e)}',
            'trace': error_trace
        }), 500 