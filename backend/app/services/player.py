from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..extensions import db
from datetime import datetime, date

# Create a blueprint for player endpoints
player_bp = Blueprint('player', __name__)

# Player Model
class PlayerAttributes:
    """Helper class for player attributes"""
    def __init__(self, player):
        self.skating = player.skating
        self.shooting = player.shooting_skill
        self.puck_skills = player.puck_skills
        self.physical = player.physical
        self.defense = player.defense
        
        # Goalie attributes
        self.agility = player.agility
        self.positioning = player.positioning
        self.reflexes = player.reflexes
        self.puck_control = player.puck_control
        self.mental = player.mental


class Player(db.Model):
    """Player model for hockey players"""
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    jersey = db.Column(db.Integer)
    position_primary = db.Column(db.String(2), nullable=False)  # C, LW, RW, D, G
    position_secondary = db.Column(db.String(2))
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    associated_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))  # For prospects assigned to NHL teams
    overall_rating = db.Column(db.Integer, nullable=False)
    
    # Potential attributes
    potential = db.Column(db.String(2))  # A, A-, B+, B, B-, C+, C, C-, D+, D
    potential_precision = db.Column(db.Integer, default=50)  # 0-100, higher is more precise
    potential_volatility = db.Column(db.Integer, default=50)  # 0-100, higher means more volatile
    
    player_type = db.Column(db.String(50))
    nationality = db.Column(db.String(50))
    birthdate = db.Column(db.Date)
    age = db.Column(db.Integer)
    
    # Physical attributes
    height = db.Column(db.Integer)  # in cm
    weight = db.Column(db.Integer)  # in kg
    shooting = db.Column(db.String(1), default="L")  # L or R
    
    # Performance attributes
    skating = db.Column(db.Integer, default=0)
    shooting_skill = db.Column(db.Integer, default=0)
    puck_skills = db.Column(db.Integer, default=0)
    physical = db.Column(db.Integer, default=0)
    defense = db.Column(db.Integer, default=0)
    
    # Goalie attributes
    agility = db.Column(db.Integer, default=0)
    positioning = db.Column(db.Integer, default=0)
    reflexes = db.Column(db.Integer, default=0)
    puck_control = db.Column(db.Integer, default=0)
    mental = db.Column(db.Integer, default=0)
    
    # Draft information
    draft_year = db.Column(db.Integer)
    draft_round = db.Column(db.Integer)
    draft_pick = db.Column(db.Integer)  # Pick within round
    draft_overall = db.Column(db.Integer)  # Overall pick number
    draft_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    
    # Status
    injury_status = db.Column(db.String(20))  # IR, DTD, OUT
    return_timeline = db.Column(db.String(50))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - use string references to avoid circular imports
    team = db.relationship('Team', foreign_keys=[team_id], back_populates='players')
    prospect = db.relationship('DraftPick', foreign_keys='DraftPick.player_id', back_populates='player')
    
    def __repr__(self):
        return f'<Player {self.first_name} {self.last_name}>'
    
    def is_draft_eligible(self) -> bool:
        """Determine if player is draft eligible based on age"""
        return self.age == 17 and not self.draft_year
    
    def is_prospect(self) -> bool:
        """Determine if player is a prospect (drafted but not on NHL roster)"""
        return self.draft_year is not None and self.associated_team_id is not None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert Player object to dictionary"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'jersey': self.jersey,
            'position_primary': self.position_primary,
            'position_secondary': self.position_secondary,
            'team_id': self.team_id,
            'team': self.team.name if self.team else None,
            'associated_team_id': self.associated_team_id,
            'overall_rating': self.overall_rating,
            'potential': self.potential,
            'potential_precision': self.potential_precision,
            'potential_volatility': self.potential_volatility,
            'player_type': self.player_type,
            'nationality': self.nationality,
            'birthdate': self.birthdate.isoformat() if self.birthdate else None,
            'age': self.age,
            'height': self.height,
            'weight': self.weight,
            'shooting': self.shooting,
            'skating': self.skating,
            'shooting_skill': self.shooting_skill,
            'puck_skills': self.puck_skills,
            'physical': self.physical,
            'defense': self.defense,
            'agility': self.agility,
            'positioning': self.positioning,
            'reflexes': self.reflexes,
            'puck_control': self.puck_control,
            'mental': self.mental,
            'draft_year': self.draft_year,
            'draft_round': self.draft_round,
            'draft_pick': self.draft_pick,
            'draft_overall': self.draft_overall,
            'draft_team_id': self.draft_team_id,
            'injury_status': self.injury_status,
            'return_timeline': self.return_timeline
        }
        
    def to_chemistry_format(self) -> Dict[str, Any]:
        """Convert player to format expected by ChemistryCalculator"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'name': f'{self.first_name} {self.last_name}',
            'position': self.position_primary,
            'position_primary': self.position_primary,
            'position_secondary': self.position_secondary,
            'player_type': self.player_type,
            'overall': self.overall_rating,
            'potential': self.potential,
            'number': self.jersey,
            'weight': self.weight,
            'height': self.height,
            'shooting': self.shooting,
            'team': self.team.name if self.team else None,
            'attributes': {
                'skating': self.skating,
                'shooting': self.shooting_skill,
                'hands': self.puck_skills,
                'checking': self.physical,
                'defense': self.defense,
                # Goalie attributes
                'agility': self.agility,
                'positioning': self.positioning,
                'reflexes': self.reflexes,
                'puck_control': self.puck_control,
                'mental': self.mental
            }
        }

class PlayerService:
    """
    Service for managing players.
    """
    
    @staticmethod
    def get_all_players(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Get all players, optionally filtered.
        
        Args:
            filters: Optional dictionary of filter parameters
            
        Returns:
            List of players as dictionaries
        """
        # Start with base query
        query = Player.query
        
        # Apply filters if provided
        if filters:
            if 'team_id' in filters:
                query = query.filter_by(team_id=filters['team_id'])
            if 'position' in filters:
                query = query.filter_by(position=filters['position'])
                
        # Execute query and convert to list of dicts
        players = [player.to_dict() for player in query.all()]
        
        return players
    
    @staticmethod
    def get_player_by_id(player_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific player by ID.
        
        Args:
            player_id: The ID of the player to retrieve
            
        Returns:
            Player as dictionary, or None if not found
        """
        player = Player.query.get(player_id)
        return player.to_dict() if player else None
    
    @staticmethod
    def create_player(player_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new player.
        
        Args:
            player_data: Dictionary with player data
            
        Returns:
            Created player as dictionary
        """
        new_player = Player(
            first_name=player_data.get('first_name'),
            last_name=player_data.get('last_name'),
            position=player_data.get('position'),
            team_id=player_data.get('team_id'),
            overall_rating=player_data.get('overall_rating', 50),
            age=player_data.get('age', 18),
            nationality=player_data.get('nationality'),
            # Add other player attributes here
        )
        
        db.session.add(new_player)
        db.session.commit()
        
        return new_player.to_dict()
    
    @staticmethod
    def update_player(player_id: int, player_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing player.
        
        Args:
            player_id: The ID of the player to update
            player_data: Dictionary with updated player data
            
        Returns:
            Updated player as dictionary, or None if not found
        """
        player = Player.query.get(player_id)
        if not player:
            return None
            
        # Update player attributes
        for key, value in player_data.items():
            if hasattr(player, key):
                setattr(player, key, value)
        
        db.session.commit()
        
        return player.to_dict()
    
    @staticmethod
    def delete_player(player_id: int) -> bool:
        """
        Delete a player.
        
        Args:
            player_id: The ID of the player to delete
            
        Returns:
            Boolean indicating success
        """
        player = Player.query.get(player_id)
        if not player:
            return False
            
        db.session.delete(player)
        db.session.commit()
        
        return True


# API endpoints that utilize the player service

@player_bp.route('/', methods=['GET'])
def get_players():
    """Get all players or filter by query parameters"""
    # Get query parameters
    filters = {}
    
    team_id = request.args.get('team_id')
    position = request.args.get('position')
    
    if team_id:
        filters['team_id'] = team_id
    if position:
        filters['position'] = position
    
    # Get players
    players = PlayerService.get_all_players(filters)
    
    return jsonify(players), 200


@player_bp.route('/<int:player_id>', methods=['GET'])
def get_player(player_id):
    """Get a specific player by ID"""
    player = PlayerService.get_player_by_id(player_id)
    
    if not player:
        return jsonify({"error": f"Player with ID {player_id} not found"}), 404
        
    return jsonify(player), 200


@player_bp.route('/', methods=['POST'])
@jwt_required()
def create_player():
    """Create a new player"""
    player_data = request.get_json()
    
    if not player_data:
        return jsonify({"error": "No player data provided"}), 400
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'position']
    for field in required_fields:
        if field not in player_data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    new_player = PlayerService.create_player(player_data)
    return jsonify(new_player), 201


@player_bp.route('/<int:player_id>', methods=['PUT'])
@jwt_required()
def update_player(player_id):
    """Update an existing player"""
    player_data = request.get_json()
    
    if not player_data:
        return jsonify({"error": "No player data provided"}), 400
        
    updated_player = PlayerService.update_player(player_id, player_data)
    
    if not updated_player:
        return jsonify({"error": f"Player with ID {player_id} not found"}), 404
        
    return jsonify(updated_player), 200


@player_bp.route('/<int:player_id>', methods=['DELETE'])
@jwt_required()
def delete_player(player_id):
    """Delete a player"""
    success = PlayerService.delete_player(player_id)
    
    if not success:
        return jsonify({"error": f"Player with ID {player_id} not found"}), 404
        
    return jsonify({'message': 'Player deleted successfully'}), 200 