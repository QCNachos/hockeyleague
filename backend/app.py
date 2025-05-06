import os
from flask import Flask, request, jsonify
from app import create_app
from flask_cors import CORS
from app.supabase_client import get_data, get_item_by_id, get_supabase_client
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    filename='flask.log',
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = create_app(os.getenv('FLASK_ENV', 'development'))

# Enable Cross-Origin Resource Sharing (CORS) for the API
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints after they are created in create_app()
# Blueprint registrations are handled in app/__init__.py and app/services/__init__.py

# Print registered routes
print("All registered routes:")
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule.rule}")

@app.route('/api/supabase/<table_name>', methods=['GET'])
def get_supabase_data(table_name):
    """
    Centralized endpoint to get data from any Supabase table
    
    Query parameters:
    - filters: JSON string of key-value pairs for filtering
    - select: Comma-separated list of columns to select
    
    Returns:
        JSON response with data from Supabase
    """
    try:
        # Get query parameters
        filters = request.args.get('filters')
        select_columns = request.args.get('select', '*')
        
        # Parse filters if provided
        filter_dict = {}
        if filters:
            import json
            filter_dict = json.loads(filters)
            
        # Get data from Supabase
        data = get_data(table_name, filter_dict, select_columns)
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/supabase/<table_name>/<item_id>', methods=['GET'])
def get_supabase_item(table_name, item_id):
    """
    Centralized endpoint to get a single item from any Supabase table by ID
    
    Path parameters:
    - table_name: Name of the table to query
    - item_id: ID of the item to retrieve
    
    Query parameters:
    - id_column: Name of the ID column (default is 'id')
    
    Returns:
        JSON response with the item data from Supabase
    """
    try:
        # Get ID column name if provided
        id_column = request.args.get('id_column', 'id')
        
        # Get item from Supabase
        item = get_item_by_id(table_name, item_id, id_column)
        
        if item:
            return jsonify({"data": item}), 200
        else:
            return jsonify({"error": f"Item not found in {table_name} with {id_column}={item_id}"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/db/db-health', methods=['GET'])
def db_health_check():
    """Check database connectivity"""
    try:
        from app.extensions import db
        # Try a simple query
        result = db.session.execute('SELECT 1').fetchone()
        if result:
            return jsonify({"status": "ok", "message": "Database connection successful"}), 200
        return jsonify({"status": "error", "message": "Database returned unexpected result"}), 500
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/db/supabase-health', methods=['GET'])
def supabase_health_check():
    """Check Supabase connectivity"""
    try:
        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({"status": "error", "message": "Could not initialize Supabase client"}), 500
            
        # Try a simple query
        response = supabase.table("Team").select("count", count="exact").limit(1).execute()
        
        return jsonify({
            "status": "ok", 
            "message": "Supabase connection successful",
            "count": response.count if hasattr(response, 'count') else None
        }), 200
    except Exception as e:
        logger.error(f"Supabase health check failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/league-types', methods=['GET'])
def get_league_types():
    """Get all league types from the League_Level_Rules table in Supabase"""
    try:
        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            logger.error("Could not initialize Supabase client for league-types endpoint")
            return jsonify({"error": "Could not initialize Supabase client"}), 500
            
        # Query the League_Level_Rules table
        logger.info("Querying League_Level_Rules table for league types")
        response = supabase.table("League_Level_Rules").select("league_level").execute()
        
        # Standard league types that should always be included
        standard_league_types = ["Pro", "Junior", "Sub-Junior", "Minor"]
        
        if response.data:
            # Extract just the league_level values
            league_types = [item["league_level"] for item in response.data if "league_level" in item]
            
            # Debug info on case and exact value of league types
            for idx, lt in enumerate(league_types):
                logger.info(f"League type {idx+1}: '{lt}', Type: {type(lt)}, ASCII: {[ord(c) for c in lt]}")
            
            # Normalize case and remove duplicates
            normalized_types = set()
            for lt in league_types:
                # Handle case variations specifically for Sub-Junior/Sub-junior
                if lt.lower() == 'sub-junior':
                    lt = 'Sub-Junior'  # Standardize to this capitalization
                else:
                    # Properly capitalize each word in the league type
                    words = lt.split()
                    lt = ' '.join(word.capitalize() for word in words)
                
                normalized_types.add(lt)
            
            # Add standard league types if missing
            for std_type in standard_league_types:
                if std_type not in normalized_types:
                    normalized_types.add(std_type)
            
            # Convert back to sorted list
            final_types = sorted(list(normalized_types))
            
            logger.info(f"Returning {len(final_types)} league types: {final_types}")
            return jsonify(final_types), 200
        else:
            logger.warning("No league types found in League_Level_Rules table")
            # Return standard types if no data found
            logger.info(f"Returning standard league types: {standard_league_types}")
            return jsonify(standard_league_types), 200
    except Exception as e:
        logger.error(f"Error fetching league types: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001) 