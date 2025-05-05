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
    def simulate_game(game_id: int, simulation_mode: str = 'fast_simulation') -> Dict[str, Any]:
        """
        Simulate a hockey game with different simulation modes.
        
        Args:
            game_id: The ID of the game to simulate
            simulation_mode: The simulation mode to use
                'play': Full gameplay mode (not implemented)
                'play_by_play': Full play-by-play simulation with 20 min periods
                'fast_play_by_play': Fast play-by-play simulation with 3 min periods
                'simulation': Simple simulation with UI updates (30 sec per period)
                'fast_simulation': Instant simulation with no visual feedback
            
        Returns:
            Dictionary with game result
        """
        game = GameSimulation.get_game_by_id(game_id)
        if not game:
            return {"error": f"Game with ID {game_id} not found"}
        
        # Choose the appropriate simulation mode
        if simulation_mode == 'play_by_play':
            return GameSimulation.simulate_play_by_play(game, full_length=True)
        elif simulation_mode == 'fast_play_by_play':
            return GameSimulation.simulate_play_by_play(game, full_length=False)
        elif simulation_mode == 'simulation':
            return GameSimulation.simulate_with_updates(game)
        else:  # Default to fast simulation
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
    
    @staticmethod
    def simulate_play_by_play(game: Dict[str, Any], full_length: bool = False) -> Dict[str, Any]:
        """
        Simulate a play-by-play hockey game.
        
        Args:
            game: The game to simulate
            full_length: Whether to simulate full 20-minute periods (True) or 3-minute periods (False)
            
        Returns:
            Dictionary with game events and final result
        """
        # Initialize game state
        period_length = 1200 if full_length else 180  # 20 minutes (1200 seconds) or 3 minutes (180 seconds)
        periods = 3  # Standard hockey game has 3 periods
        
        # Create team and player data structures
        home_team = {
            "id": game["home_team_id"],
            "abbreviation": game["home_team"],
            "score": 0,
            "shots": 0,
            "penalties": 0,
            "players": [f"Player{i}" for i in range(1, 13)]  # 12 players including 2 goalies
        }
        
        away_team = {
            "id": game["away_team_id"],
            "abbreviation": game["away_team"],
            "score": 0,
            "shots": 0,
            "penalties": 0,
            "players": [f"Player{i}" for i in range(1, 13)]  # 12 players including 2 goalies
        }
        
        # Initialize game events
        game_events = []
        
        # Initial positions (simplified)
        initial_positions = {
            "home": {
                "Player1": {"x": 10, "y": 50, "role": "center"},
                "Player2": {"x": 20, "y": 30, "role": "left_wing"},
                "Player3": {"x": 20, "y": 70, "role": "right_wing"},
                "Player4": {"x": 30, "y": 40, "role": "defense"},
                "Player5": {"x": 30, "y": 60, "role": "defense"},
                "Player6": {"x": 5, "y": 50, "role": "goalie"},
                # Bench players
                "Player7": {"x": -10, "y": 20, "role": "bench"},
                "Player8": {"x": -10, "y": 25, "role": "bench"},
                "Player9": {"x": -10, "y": 30, "role": "bench"},
                "Player10": {"x": -10, "y": 35, "role": "bench"},
                "Player11": {"x": -10, "y": 40, "role": "bench"},
                "Player12": {"x": -10, "y": 45, "role": "backup_goalie"},
            },
            "away": {
                "Player1": {"x": 90, "y": 50, "role": "center"},
                "Player2": {"x": 80, "y": 30, "role": "left_wing"},
                "Player3": {"x": 80, "y": 70, "role": "right_wing"},
                "Player4": {"x": 70, "y": 40, "role": "defense"},
                "Player5": {"x": 70, "y": 60, "role": "defense"},
                "Player6": {"x": 95, "y": 50, "role": "goalie"},
                # Bench players
                "Player7": {"x": 110, "y": 20, "role": "bench"},
                "Player8": {"x": 110, "y": 25, "role": "bench"},
                "Player9": {"x": 110, "y": 30, "role": "bench"},
                "Player10": {"x": 110, "y": 35, "role": "bench"},
                "Player11": {"x": 110, "y": 40, "role": "bench"},
                "Player12": {"x": 110, "y": 45, "role": "backup_goalie"},
            },
            "puck": {"x": 50, "y": 50, "possession": None}
        }
        
        # Simulate each period
        for period in range(1, periods + 1):
            # Reset positions for face-off at the start of the period
            positions = dict(initial_positions)
            
            # Initialize period state
            period_time = 0
            period_events = []
            
            # Simulate the period second by second (in a real implementation, this would use a smaller time step)
            while period_time < period_length:
                # Simulate game logic for this time step
                # This is greatly simplified - a real implementation would have complex physics and AI
                
                # Random events based on probabilities
                event_type = random.choices(
                    ["shot", "goal", "penalty", "face_off", "none"],
                    weights=[0.05, 0.01, 0.02, 0.02, 0.9],
                    k=1
                )[0]
                
                if event_type == "shot":
                    # Determine which team takes the shot
                    shooting_team = random.choice(["home", "away"])
                    defending_team = "away" if shooting_team == "home" else "home"
                    
                    # Choose a random player to take the shot
                    shooter = random.choice([p for p in (home_team if shooting_team == "home" else away_team)["players"] if not p.endswith("6") and not p.endswith("12")])
                    
                    # Increment shots
                    if shooting_team == "home":
                        home_team["shots"] += 1
                    else:
                        away_team["shots"] += 1
                    
                    # Add shot event
                    period_events.append({
                        "type": "shot",
                        "time": period_time,
                        "period": period,
                        "team": shooting_team,
                        "player": shooter,
                        "x": random.randint(50, 95) if shooting_team == "home" else random.randint(5, 50),
                        "y": random.randint(30, 70)
                    })
                    
                    # Move puck position
                    positions["puck"]["x"] = random.randint(50, 95) if shooting_team == "home" else random.randint(5, 50)
                    positions["puck"]["y"] = random.randint(30, 70)
                    positions["puck"]["possession"] = shooter
                
                elif event_type == "goal":
                    # Determine which team scores
                    scoring_team = random.choice(["home", "away"])
                    defending_team = "away" if scoring_team == "home" else "home"
                    
                    # Choose a random player to score
                    scorer = random.choice([p for p in (home_team if scoring_team == "home" else away_team)["players"] if not p.endswith("6") and not p.endswith("12")])
                    
                    # Choose a random player for the assist
                    assist = random.choice([p for p in (home_team if scoring_team == "home" else away_team)["players"] if p != scorer and not p.endswith("6") and not p.endswith("12")])
                    
                    # Increment score and shots
                    if scoring_team == "home":
                        home_team["score"] += 1
                        home_team["shots"] += 1
                    else:
                        away_team["score"] += 1
                        away_team["shots"] += 1
                    
                    # Add goal event
                    period_events.append({
                        "type": "goal",
                        "time": period_time,
                        "period": period,
                        "team": scoring_team,
                        "scorer": scorer,
                        "assist": assist,
                        "x": 90 if scoring_team == "home" else 10,
                        "y": random.randint(40, 60)
                    })
                    
                    # Reset positions for face-off after goal
                    positions = dict(initial_positions)
                
                elif event_type == "penalty":
                    # Determine which team takes the penalty
                    penalty_team = random.choice(["home", "away"])
                    
                    # Choose a random player for the penalty
                    offender = random.choice([p for p in (home_team if penalty_team == "home" else away_team)["players"] if not p.endswith("6") and not p.endswith("12")])
                    
                    # Determine penalty type and duration
                    penalty_types = ["tripping", "hooking", "interference", "slashing", "high-sticking"]
                    penalty_type = random.choice(penalty_types)
                    duration = 2  # 2-minute minor penalty
                    
                    # Increment penalties
                    if penalty_team == "home":
                        home_team["penalties"] += 1
                    else:
                        away_team["penalties"] += 1
                    
                    # Add penalty event
                    period_events.append({
                        "type": "penalty",
                        "time": period_time,
                        "period": period,
                        "team": penalty_team,
                        "player": offender,
                        "penalty_type": penalty_type,
                        "duration": duration
                    })
                    
                    # Reset positions for face-off after penalty
                    positions = dict(initial_positions)
                
                elif event_type == "face_off":
                    # Add face-off event
                    period_events.append({
                        "type": "face_off",
                        "time": period_time,
                        "period": period,
                        "x": 50,
                        "y": 50
                    })
                    
                    # Reset positions for face-off
                    positions = dict(initial_positions)
                
                # Increment time
                period_time += 1
            
            # Add all period events to game events
            game_events.extend(period_events)
        
        # Create final result
        result = {
            "game_id": game["id"],
            "home_team": game["home_team"],
            "away_team": game["away_team"],
            "home_score": home_team["score"],
            "away_score": away_team["score"],
            "winner": game["home_team"] if home_team["score"] > away_team["score"] else (
                game["away_team"] if away_team["score"] > home_team["score"] else "Tie"
            ),
            "periods": [
                # Simplified - in a real implementation, this would track period scores properly
                {"home": 0, "away": 0},
                {"home": 0, "away": 0},
                {"home": 0, "away": 0}
            ],
            "shots": {
                "home": home_team["shots"],
                "away": away_team["shots"]
            },
            "penalties": {
                "home": home_team["penalties"],
                "away": away_team["penalties"]
            },
            "events": game_events,
            "positions": positions  # Final positions at end of game
        }
        
        # Update game with results
        game["home_score"] = home_team["score"]
        game["away_score"] = away_team["score"]
        game["status"] = "completed"
        
        return result
    
    @staticmethod
    def simulate_with_updates(game: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate a hockey game with periodic UI updates (simulation mode).
        
        Args:
            game: The game to simulate
            
        Returns:
            Dictionary with game result and update events
        """
        # This is a placeholder for the simulation with UI updates mode
        # In a real implementation, this would send periodic updates to the frontend
        
        # Simple simulation logic similar to fast simulation but with update events
        home_score = 0
        away_score = 0
        
        # Track events for UI updates
        events = []
        
        # Simulate 3 periods
        for period in range(1, 4):
            # Period events
            period_events = []
            
            # Simulate goals in this period
            home_period_goals = random.randint(0, 2)
            away_period_goals = random.randint(0, 2)
            
            # Add home team goals
            for _ in range(home_period_goals):
                goal_time = random.randint(0, 1200)  # Random time in the period (in seconds)
                period_events.append({
                    "type": "goal",
                    "team": "home",
                    "time": goal_time,
                    "period": period
                })
                home_score += 1
            
            # Add away team goals
            for _ in range(away_period_goals):
                goal_time = random.randint(0, 1200)  # Random time in the period (in seconds)
                period_events.append({
                    "type": "goal",
                    "team": "away",
                    "time": goal_time,
                    "period": period
                })
                away_score += 1
            
            # Sort events by time
            period_events.sort(key=lambda e: e["time"])
            
            # Add to overall events
            events.extend(period_events)
        
        # Update game with results
        game["home_score"] = home_score
        game["away_score"] = away_score
        game["status"] = "completed"
        
        # Create result object
        result = {
            "game_id": game["id"],
            "home_team": game["home_team"],
            "away_team": game["away_team"],
            "home_score": home_score,
            "away_score": away_score,
            "winner": game["home_team"] if home_score > away_score else (
                game["away_team"] if away_score > home_score else "Tie"
            ),
            "periods": [
                {"home": sum(1 for e in events if e["type"] == "goal" and e["team"] == "home" and e["period"] == 1),
                 "away": sum(1 for e in events if e["type"] == "goal" and e["team"] == "away" and e["period"] == 1)},
                {"home": sum(1 for e in events if e["type"] == "goal" and e["team"] == "home" and e["period"] == 2),
                 "away": sum(1 for e in events if e["type"] == "goal" and e["team"] == "away" and e["period"] == 2)},
                {"home": sum(1 for e in events if e["type"] == "goal" and e["team"] == "home" and e["period"] == 3),
                 "away": sum(1 for e in events if e["type"] == "goal" and e["team"] == "away" and e["period"] == 3)}
            ],
            "shots": {
                "home": random.randint(25, 40),
                "away": random.randint(20, 35)
            },
            "penalties": {
                "home": random.randint(2, 8),
                "away": random.randint(2, 8)
            },
            "events": events
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
    # Get simulation mode from request parameters
    simulation_mode = request.args.get('mode', 'fast_simulation')
    
    # Validate simulation mode
    valid_modes = ['play_by_play', 'fast_play_by_play', 'simulation', 'fast_simulation']
    if simulation_mode not in valid_modes:
        return jsonify({"error": f"Invalid simulation mode. Must be one of: {', '.join(valid_modes)}"}), 400
    
    # Simulate the game with the specified mode
    result = GameSimulation.simulate_game(game_id, simulation_mode)
    
    if "error" in result:
        return jsonify(result), 404
        
    return jsonify(result), 200
