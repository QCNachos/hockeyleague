from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from ..extensions import db
import random
from datetime import datetime
import json

# Create a blueprint for game endpoints
game_bp = Blueprint('game', __name__)

# Game Model
class Game(db.Model):
    """Game model for hockey games"""
    __tablename__ = 'games'
    
    id = db.Column(db.Integer, primary_key=True)
    home_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    away_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    
    # Game status: scheduled, in_progress, completed, cancelled
    status = db.Column(db.String(20), default='scheduled')
    
    # Date and time
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    
    # Scores
    home_score = db.Column(db.Integer)
    away_score = db.Column(db.Integer)
    
    # Period data (stored as JSON)
    period_data = db.Column(db.Text)  # JSON string with period scores, shots, etc.
    
    # Game statistics (stored as JSON)
    home_stats = db.Column(db.Text)  # JSON string with home team stats
    away_stats = db.Column(db.Text)  # JSON string with away team stats
    
    # Other game details
    arena = db.Column(db.String(100))
    attendance = db.Column(db.Integer)
    season_id = db.Column(db.Integer)
    season_type = db.Column(db.String(20), default='regular')  # regular, playoffs, preseason
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    home_team = db.relationship('Team', foreign_keys=[home_team_id])
    away_team = db.relationship('Team', foreign_keys=[away_team_id])
    
    def __repr__(self):
        return f'<Game {self.id}: {self.away_team.abbreviation} @ {self.home_team.abbreviation}>'
    
    def to_dict(self):
        """Convert Game object to dictionary"""
        
        # Parse JSON strings to dictionaries
        period_data_dict = {}
        home_stats_dict = {}
        away_stats_dict = {}
        
        try:
            if self.period_data:
                period_data_dict = json.loads(self.period_data)
            if self.home_stats:
                home_stats_dict = json.loads(self.home_stats)
            if self.away_stats:
                away_stats_dict = json.loads(self.away_stats)
        except json.JSONDecodeError:
            # If JSON is invalid, use empty dict
            pass
            
        return {
            'id': self.id,
            'home_team_id': self.home_team_id,
            'away_team_id': self.away_team_id,
            'home_team': self.home_team.abbreviation if self.home_team else None,
            'away_team': self.away_team.abbreviation if self.away_team else None,
            'status': self.status,
            'date': self.date.isoformat() if self.date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'home_score': self.home_score,
            'away_score': self.away_score,
            'period_data': period_data_dict,
            'home_stats': home_stats_dict,
            'away_stats': away_stats_dict,
            'arena': self.arena,
            'attendance': self.attendance,
            'season_id': self.season_id,
            'season_type': self.season_type
        }
    
    def set_period_data(self, period_data):
        """Set period data as JSON string"""
        self.period_data = json.dumps(period_data)
    
    def set_home_stats(self, stats):
        """Set home team stats as JSON string"""
        self.home_stats = json.dumps(stats)
    
    def set_away_stats(self, stats):
        """Set away team stats as JSON string"""
        self.away_stats = json.dumps(stats)

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
