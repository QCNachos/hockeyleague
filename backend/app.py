import os
from flask import Flask, request, jsonify
from app import create_app
from flask_cors import CORS
from app.supabase_client import get_data, get_item_by_id, get_supabase
from app.services.draft.draft_ranking import draft_ranking_bp

app = create_app(os.getenv('FLASK_ENV', 'development'))

# Enable Cross-Origin Resource Sharing (CORS) for the API
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register the blueprints
app.register_blueprint(draft_ranking_bp, url_prefix='/api/draft/rankings')

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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001) 