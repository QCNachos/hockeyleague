import os
from supabase import create_client, Client
from flask import current_app
from dotenv import load_dotenv
from unittest.mock import MagicMock

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
    supabase = get_supabase()
    query = supabase.table('Player')\
        .select('*')\
        .eq('age', 17)\
        .is_('draft_year', 'null')\
        .order('overall_rating', desc=True)
    
    if limit:
        query = query.limit(limit)
    
    response = query.execute()
    return response.data

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