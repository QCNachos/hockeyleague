import os
from supabase import create_client, Client
from flask import current_app, Blueprint, jsonify
from dotenv import load_dotenv
from unittest.mock import MagicMock
import traceback
from sqlalchemy import text, inspect

# Create a blueprint for health check endpoint
supabase_bp = Blueprint('supabase', __name__)

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Global Supabase client instance
_supabase_client = None

def get_supabase() -> Client:
    """
    Get or create a Supabase client instance.
    This is the main function for getting a Supabase client.
    
    Returns:
        Supabase client
    """
    global _supabase_client
    
    # Return existing client if available
    if _supabase_client is not None:
        return _supabase_client
    
    # Get URL and key from environment or Flask config if available
    url = SUPABASE_URL
    key = SUPABASE_KEY
    
    # Try to get from Flask app if environment variables not set
    if not url or not key:
        try:
            url = current_app.config.get('SUPABASE_URL')
            key = current_app.config.get('SUPABASE_KEY')
        except RuntimeError:
            # Not in Flask context
            pass
    
    if not url or not key:
        print("WARNING: Missing Supabase credentials in environment variables")
        # Return dummy client
        mock_client = MagicMock()
        # Configure the mock to return empty data for common methods
        mock_client.table().select().execute.return_value.data = []
        return mock_client
    
    # Create new client
    _supabase_client = create_client(url, key)
    return _supabase_client

# Alias for backward compatibility and clarity
get_supabase_client = get_supabase

# Simple database health check endpoint
@supabase_bp.route('/db-health', methods=['GET'])
def check_db_health():
    """
    Check database health and connection.
    This endpoint checks both SQLAlchemy connection and Supabase connection.
    """
    response = {
        'status': 'checking',
        'sqlalchemy': {'status': 'unknown'},
        'supabase': {'status': 'unknown'}
    }
    
    # Check SQLAlchemy connection if available
    try:
        from ..extensions import db
        
        # Try to execute a simple SQL query
        result = db.session.execute(text('SELECT 1')).scalar()
        
        if result == 1:
            # Check if database has been initialized
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
                from ..services.team_service import Team
                from ..services.player import Player
                tables_count['teams'] = Team.query.count()
                tables_count['players'] = Player.query.count()
            except Exception as count_err:
                tables_count['error'] = str(count_err)
                
            response['sqlalchemy'] = {
                'status': 'healthy',
                'connection': True,
                'tables': all_tables,
                'database_url': db_url,
                'tables_count': tables_count
            }
        else:
            response['sqlalchemy'] = {
                'status': 'error',
                'message': 'Database returned unexpected result',
                'result': result
            }
    except Exception as e:
        error_trace = traceback.format_exc()
        response['sqlalchemy'] = {
            'status': 'error',
            'message': f'Database connection failed: {str(e)}',
            'trace': error_trace
        }
    
    # Check Supabase connection
    try:
        supabase = get_supabase()
        
        # Try to perform a simple query
        test_response = supabase.table('Team').select('id').limit(1).execute()
        
        response['supabase'] = {
            'status': 'healthy',
            'connection': True,
            'url': SUPABASE_URL.replace('://', '://****@') if SUPABASE_URL else 'Not configured'
        }
    except Exception as e:
        error_trace = traceback.format_exc()
        response['supabase'] = {
            'status': 'error',
            'message': f'Supabase connection failed: {str(e)}',
            'trace': error_trace
        }
    
    # Determine overall status
    if response['sqlalchemy']['status'] == 'healthy' and response['supabase']['status'] == 'healthy':
        response['status'] = 'healthy'
    elif response['sqlalchemy']['status'] == 'error' and response['supabase']['status'] == 'error':
        response['status'] = 'critical'
    else:
        response['status'] = 'degraded'
    
    return jsonify(response), 200 if response['status'] != 'critical' else 500

# Data retrieval functions - only for getting data, not creating tables

def get_data(table_name, filters=None, select_columns='*'):
    """
    Get data from any Supabase table with optional filters
    
    Args:
        table_name: Name of the table to query
        filters: Optional dict of filters to apply (key-value pairs)
        select_columns: Columns to select, default is all columns
    
    Returns:
        List of dictionaries with the retrieved data
    """
    supabase = get_supabase()
    query = supabase.table(table_name).select(select_columns)
    
    if filters:
        for key, value in filters.items():
            if value is None:
                query = query.is_(key, 'null')
            else:
                query = query.eq(key, value)
    
    response = query.execute()
    return response.data

def get_item_by_id(table_name, item_id, id_column='id'):
    """
    Get a single item by ID from any Supabase table
    
    Args:
        table_name: Name of the table to query
        item_id: The ID value to match
        id_column: The column name for the ID field, default is 'id'
    
    Returns:
        Dictionary with the item data or None if not found
    """
    supabase = get_supabase()
    response = supabase.table(table_name).select('*').eq(id_column, item_id).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

# Helper functions for common operations

def get_teams(filters=None):
    """
    Get teams from Supabase with optional filters
    
    Args:
        filters: Optional dict of filters to apply
    
    Returns:
        List of team dictionaries
    """
    return get_data('Team', filters)

def get_team_by_id(team_id):
    """
    Get a team by ID from Supabase
    
    Args:
        team_id: The team ID
    
    Returns:
        Team dictionary or None if not found
    """
    return get_item_by_id('Team', team_id)

def get_players(filters=None):
    """
    Get players from Supabase with optional filters
    
    Args:
        filters: Optional dict of filters to apply
    
    Returns:
        List of player dictionaries
    """
    return get_data('Player', filters)

def get_player_by_id(player_id):
    """
    Get a player by ID from Supabase
    
    Args:
        player_id: The player ID
    
    Returns:
        Player dictionary or None if not found
    """
    return get_item_by_id('Player', player_id)

def get_draft_eligible_players(limit=None):
    """
    Get draft-eligible players (17-year-olds not yet drafted)
    
    Args:
        limit: Optional limit on number of players to return
    
    Returns:
        List of player dictionaries
    """
    try:
        supabase = get_supabase()
        print(f"Fetching draft-eligible players from Supabase with limit={limit}")
        
        # Try first approach: age=17 and draft_year is null
        query = supabase.table('Player')\
            .select('*')\
            .eq('age', 17)\
            .is_('draft_year', 'null')\
            .order('overall_rating', desc=True)
        
        if limit:
            query = query.limit(limit)
        
        response = query.execute()
        print(f"First query found {len(response.data)} draft-eligible players in Supabase")
        
        # If we found players, return them
        if response.data and len(response.data) > 0:
            return response.data
            
        print("No players found using age=17 + draft_year is null, trying alternatives...")
        
        # Try second approach: Just age=17
        try:
            alt_query = supabase.table('Player')\
                .select('*')\
                .eq('age', 17)\
                .order('overall_rating', desc=True)
                
            if limit:
                alt_query = alt_query.limit(limit)
                
            alt_response = alt_query.execute()
            print(f"Second query found {len(alt_response.data)} players with just age=17")
            
            if alt_response.data and len(alt_response.data) > 0:
                return alt_response.data
        except Exception as alt_err:
            print(f"Error in second query approach: {str(alt_err)}")
        
        # Try third approach: Check if the field might be draft_year_id or draft_team_id
        try:
            fields_query = supabase.table('Player')\
                .select('*')\
                .limit(1)\
                .execute()
                
            if fields_query.data and len(fields_query.data) > 0:
                player_fields = fields_query.data[0].keys()
                print(f"Available player fields: {', '.join(player_fields)}")
                
                # Try different field names that might contain draft info
                draft_field_options = ['draft_year', 'draft_year_id', 'drafted', 'draft_status']
                
                # Test each potential field name
                for field in draft_field_options:
                    if field in player_fields:
                        print(f"Found field {field} in Player table, trying to filter with it")
                        field_query = supabase.table('Player')\
                            .select('*')\
                            .eq('age', 17)\
                            .is_(field, 'null')\
                            .order('overall_rating', desc=True)
                            
                        if limit:
                            field_query = field_query.limit(limit)
                            
                        field_response = field_query.execute()
                        print(f"Query using {field} found {len(field_response.data)} players")
                        
                        if field_response.data and len(field_response.data) > 0:
                            return field_response.data
        except Exception as fields_err:
            print(f"Error in fields exploration: {str(fields_err)}")
        
        # Final approach: Just return all players and filter on client side
        print("All previous approaches failed, retrieving all players...")
        all_players_query = supabase.table('Player')\
            .select('*')\
            .order('overall_rating', desc=True)
            
        if limit:
            all_players_query = all_players_query.limit(limit)
            
        all_players_response = all_players_query.execute()
        
        # Client-side filter for players who appear to be 17-year-olds without draft info
        filtered_players = []
        for player in all_players_response.data:
            if player.get('age') == 17:
                # Check various draft fields to ensure they don't have draft information
                has_draft_info = False
                for field in ['draft_year', 'draft_round', 'draft_pick', 'draft_overall', 'draft_team_id']:
                    if player.get(field) is not None:
                        has_draft_info = True
                        break
                
                if not has_draft_info:
                    filtered_players.append(player)
        
        print(f"Client-side filtering found {len(filtered_players)} draft-eligible players")
        return filtered_players
        
    except Exception as e:
        print(f"Error in get_draft_eligible_players: {str(e)}")
        traceback.print_exc()
        return []

def get_draft_by_year(year):
    """
    Get draft information for a specific year
    
    Args:
        year: The draft year
    
    Returns:
        Draft dictionary or None if not found
    """
    supabase = get_supabase()
    response = supabase.table('Draft').select('*').eq('year', year).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

def create_draft(draft_data):
    """
    Create a new draft in Supabase
    
    Args:
        draft_data: Dictionary with draft data
    
    Returns:
        Created draft data
    """
    supabase = get_supabase()
    response = supabase.table('Draft').insert(draft_data).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

def update_draft(draft_id, draft_data):
    """
    Update an existing draft in Supabase
    
    Args:
        draft_id: The draft ID
        draft_data: Dictionary with updated draft data
    
    Returns:
        Updated draft data
    """
    supabase = get_supabase()
    response = supabase.table('Draft').update(draft_data).eq('id', draft_id).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

def get_draft_picks(draft_id):
    """
    Get draft picks for a specific draft
    
    Args:
        draft_id: The draft ID
    
    Returns:
        List of draft pick dictionaries
    """
    supabase = get_supabase()
    response = supabase.table('DraftPick').select('*').eq('draft_id', draft_id).order('overall_pick').execute()
    return response.data

def create_draft_pick(pick_data):
    """
    Create a new draft pick in Supabase
    
    Args:
        pick_data: Dictionary with draft pick data
    
    Returns:
        Created draft pick data
    """
    supabase = get_supabase()
    response = supabase.table('DraftPick').insert(pick_data).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

def update_draft_pick(pick_id, pick_data):
    """
    Update an existing draft pick in Supabase
    
    Args:
        pick_id: The draft pick ID
        pick_data: Dictionary with updated draft pick data
    
    Returns:
        Updated draft pick data
    """
    supabase = get_supabase()
    response = supabase.table('DraftPick').update(pick_data).eq('id', pick_id).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

def update_player(player_id, player_data):
    """
    Update a player in Supabase
    
    Args:
        player_id: The player ID
        player_data: Dictionary with updated player data
    
    Returns:
        Updated player data
    """
    supabase = get_supabase()
    response = supabase.table('Player').update(player_data).eq('id', player_id).execute()
    
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None 