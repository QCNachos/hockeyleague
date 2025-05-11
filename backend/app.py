#!/usr/bin/env python3
from flask import Flask, request, jsonify
import os
import logging
from dotenv import load_dotenv
from flask_cors import CORS
from app.supabase_client import supabase_bp, get_supabase
from app.services.value_trade import calculate_player_trade_value, evaluate_trade
import httpx

# Load environment variables
load_dotenv()

# Create and configure the app
app = Flask(__name__)
# Use basic configuration instead of importing from config module
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-for-testing')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///hockey_league.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-dev-key-for-testing')

# Enable CORS - simplified configuration that allows all origins in development
CORS(app, resources={r"/*": {"origins": "*"}})

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://kodoxoactqqajqrdnozg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'your-supabase-anon-key')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend_output.log"),
        logging.StreamHandler()
    ]
)

# Register blueprints
try:
    from app.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
except ImportError:
    print("Warning: Could not import auth blueprint")

app.register_blueprint(supabase_bp, url_prefix='/api/supabase')

# Initialize extensions
try:
    from app.extensions import db, jwt
    db.init_app(app)
    jwt.init_app(app)
except ImportError:
    print("Warning: Could not initialize extensions")

# Home route
@app.route('/')
def index():
    return "NHL League Manager API"

# Health check route
@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"}), 200

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# Register API endpoints for trade valuation
@app.route('/api/evaluate-trade', methods=['POST'])
def api_evaluate_trade():
    try:
        data = request.json
        
        # Get player data for each team
        team1_players = data.get('team1_players', [])
        team2_players = data.get('team2_players', [])
        team3_players = data.get('team3_players', [])
        is_three_way = data.get('is_three_way', False)
        
        # Get draft pick data (if provided)
        team1_picks = data.get('team1_picks', [])
        team2_picks = data.get('team2_picks', [])
        team3_picks = data.get('team3_picks', [])
        
        # Get asset destinations for 3-way trades
        asset_destinations = data.get('asset_destinations', {})
        
        # Get draft context
        draft_context = data.get('draft_context', 'no_context')
        
        # Log information about the request
        app.logger.info(f"Evaluate trade request: {len(team1_players)} players and {len(team1_picks)} picks from team 1, "
                      f"{len(team2_players)} players and {len(team2_picks)} picks from team 2"
                      + (f", {len(team3_players)} players and {len(team3_picks)} picks from team 3" if is_three_way else ""))
        
        # Call the trade evaluation function with all parameters
        result = evaluate_trade(
            team1_players, 
            team2_players,
            team3_players if is_three_way else None, 
            is_three_way=is_three_way,
            team1_picks=team1_picks,
            team2_picks=team2_picks,
            team3_picks=team3_picks if is_three_way else None,
            asset_destinations=asset_destinations,
            draft_context=draft_context
        )
            
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error in trade evaluation: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Endpoint to get all leagues
@app.route('/api/leagues', methods=['GET'])
@app.route('/api/leagues/', methods=['GET'])  # Added trailing slash version
def get_leagues():
    try:
        supabase = get_supabase()
        response = supabase.table('League').select('*').order('league').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to get all teams
@app.route('/api/teams', methods=['GET'])
@app.route('/api/teams/', methods=['GET'])  # Added trailing slash version
def get_teams():
    try:
        supabase = get_supabase()
        response = supabase.table('Team').select('*, League(league_level)').order('team').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Endpoint to get all players
@app.route('/api/players', methods=['GET'])
@app.route('/api/players/', methods=['GET'])  # Added trailing slash version
def get_players():
    try:
        supabase = get_supabase()
        response = supabase.table('Player').select('*, team:Team!Players_team_fkey(id,team,abbreviation,league,League(league_level))').order('last_name').execute()
        return jsonify(response.data)
    except Exception as e:
        app.logger.error(f"Error fetching players: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Endpoint to get all draft picks
@app.route('/api/draft-picks', methods=['GET'])
@app.route('/api/draft-picks/', methods=['GET'])  # Added trailing slash version
def get_draft_picks():
    try:
        supabase = get_supabase()
        response = supabase.table('Draft_Picks').select('*').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)