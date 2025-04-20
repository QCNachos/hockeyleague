from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from ..extensions import db
import random

# Create a blueprint for game endpoints
game_bp = Blueprint('game', __name__)

class GameSimulation:
    """
    Service for managing and simulating hockey games.
    """
    
    @staticmethod
    def get_all_games(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Get all games, optionally filtered.
        
        Args:
            filters: Optional dictionary of filter parameters
            
        Returns:
            List of games as dictionaries
        """
        # This is a placeholder implementation - update when Game model is implemented
        # In a real implementation, this would query the database
        games = [
            {
                "id": 1,
                "home_team": "TOR",
                "away_team": "MTL",
                "date": "2023-10-11",
                "status": "scheduled",
                "home_score": None,
                "away_score": None
            },
            {
                "id": 2,
                "home_team": "BOS",
                "away_team": "NYR",
                "date": "2023-10-11",
                "status": "scheduled",
                "home_score": None,
                "away_score": None
            },
            {
                "id": 3,
                "home_team": "EDM",
                "away_team": "CGY",
                "date": "2023-10-12",
                "status": "scheduled",
                "home_score": None,
                "away_score": None
            }
        ]
        
        # Apply filters if provided
        if filters:
            filtered_games = []
            for game in games:
                match = True
                for key, value in filters.items():
                    if game.get(key) != value:
                        match = False
                        break
                if match:
                    filtered_games.append(game)
            return filtered_games
            
        return games
    
    @staticmethod
    def get_game_by_id(game_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific game by ID.
        
        Args:
            game_id: The ID of the game to retrieve
            
        Returns:
            Game as dictionary, or None if not found
        """
        games = GameSimulation.get_all_games()
        for game in games:
            if game.get("id") == game_id:
                return game
                
        return None
    
    @staticmethod
    def simulate_game(game_id: int) -> Dict[str, Any]:
        """
        Simulate a hockey game.
        
        Args:
            game_id: The ID of the game to simulate
            
        Returns:
            Dictionary with game result
        """
        game = GameSimulation.get_game_by_id(game_id)
        if not game:
            return {"error": f"Game with ID {game_id} not found"}
        
        # Simple simulation logic - would be much more complex in a real implementation
        home_score = random.randint(0, 6)
        away_score = random.randint(0, 5)
        
        # Update game with results
        game["home_score"] = home_score
        game["away_score"] = away_score
        game["status"] = "completed"
        
        result = {
            "game_id": game_id,
            "home_team": game["home_team"],
            "away_team": game["away_team"],
            "home_score": home_score,
            "away_score": away_score,
            "winner": game["home_team"] if home_score > away_score else (
                game["away_team"] if away_score > home_score else "Tie"
            ),
            "periods": [
                {"home": random.randint(0, 3), "away": random.randint(0, 2)},
                {"home": random.randint(0, 2), "away": random.randint(0, 2)},
                {"home": random.randint(0, 2), "away": random.randint(0, 2)}
            ],
            "shots": {
                "home": random.randint(25, 40),
                "away": random.randint(20, 35)
            },
            "penalties": {
                "home": random.randint(2, 8),
                "away": random.randint(2, 8)
            }
        }
        
        return result


# API endpoints that utilize the game service

@game_bp.route('/', methods=['GET'])
def get_games():
    """Get all games or filter by query parameters"""
    # Get filters from request args
    filters = {}
    
    # Extract filters from request args
    status = request.args.get('status')
    home_team = request.args.get('home_team')
    away_team = request.args.get('away_team')
    date = request.args.get('date')
    
    if status:
        filters['status'] = status
    if home_team:
        filters['home_team'] = home_team
    if away_team:
        filters['away_team'] = away_team
    if date:
        filters['date'] = date
    
    # Get games
    if filters:
        games = GameSimulation.get_all_games(filters)
    else:
        games = GameSimulation.get_all_games()
    
    return jsonify(games), 200


@game_bp.route('/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Get a specific game by ID"""
    game = GameSimulation.get_game_by_id(game_id)
    
    if not game:
        return jsonify({"error": f"Game with ID {game_id} not found"}), 404
        
    return jsonify(game), 200


@game_bp.route('/simulate/<int:game_id>', methods=['POST'])
def simulate_game(game_id):
    """Simulate a specific game"""
    result = GameSimulation.simulate_game(game_id)
    
    if "error" in result:
        return jsonify(result), 404
        
    return jsonify(result), 200
