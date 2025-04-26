from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..services.league import Division
from ..extensions import db
from datetime import datetime

# Create a blueprint for team endpoints
team_bp = Blueprint('team', __name__)

# Team Model
class Team(db.Model):
    """Team model for hockey teams"""
    __tablename__ = 'teams'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    abbreviation = db.Column(db.String(3), nullable=False, unique=True)
    logo_url = db.Column(db.String(255))
    primary_color = db.Column(db.String(7))  # Hex color code
    secondary_color = db.Column(db.String(7))  # Hex color code
    division_id = db.Column(db.Integer, db.ForeignKey('divisions.id'))
    arena_name = db.Column(db.String(100))
    arena_capacity = db.Column(db.Integer)
    gm_name = db.Column(db.String(100))
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.id'))
    prestige = db.Column(db.Integer, default=50)  # 1-100 scale
    budget = db.Column(db.Integer)  # in $
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - use string references for all relationships to avoid import issues
    players = db.relationship('Player', foreign_keys='Player.team_id', back_populates='team')
    draft_players = db.relationship('Player', foreign_keys='Player.draft_team_id', backref='draft_team')
    associated_players = db.relationship('Player', foreign_keys='Player.associated_team_id', backref='associated_team')
    coach = db.relationship('Coach', back_populates='team')
    division = db.relationship('Division', back_populates='teams')
    
    # Games relationships - changed to lazy='dynamic' to avoid circular reference issues
    # and removed backref/back_populates to let Game define its own relationships
    home_games = db.relationship('Game', 
                               foreign_keys='Game.home_team_id',
                               lazy='dynamic')
    away_games = db.relationship('Game', 
                                foreign_keys='Game.away_team_id',
                                lazy='dynamic')
    
    def __repr__(self):
        return f'<Team {self.name}>'
    
    def to_dict(self):
        """Convert Team object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'city': self.city,
            'abbreviation': self.abbreviation,
            'logo_url': self.logo_url,
            'primary_color': self.primary_color or '#1e1e1e',  # Default dark gray if None
            'secondary_color': self.secondary_color or '#FFFFFF',  # Default white if None
            'division_id': self.division_id,
            'arena_name': self.arena_name,
            'arena_capacity': self.arena_capacity,
            'gm_name': self.gm_name,
            'coach_id': self.coach_id,
            'prestige': self.prestige,
            'budget': self.budget
        }

class TeamService:
    """
    Service for managing teams.
    """
    
    @staticmethod
    def get_all_teams(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Get all teams, optionally filtered.
        
        Args:
            filters: Optional dictionary of filter parameters
            
        Returns:
            List of teams as dictionaries
        """
        # Start with base query
        query = Team.query
        
        # Apply filters if provided
        if filters:
            if 'division_id' in filters:
                query = query.filter_by(division_id=filters['division_id'])
                
        # Execute query and convert to list of dicts
        teams = [team.to_dict() for team in query.all()]
        
        return teams
    
    @staticmethod
    def get_team_by_id(team_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific team by ID.
        
        Args:
            team_id: The ID of the team to retrieve
            
        Returns:
            Team as dictionary, or None if not found
        """
        team = Team.query.get(team_id)
        return team.to_dict() if team else None
    
    @staticmethod
    def get_team_by_abbreviation(abbreviation: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific team by its abbreviation.
        
        Args:
            abbreviation: The abbreviation of the team to retrieve (e.g., "TOR", "NYR")
            
        Returns:
            Team as dictionary, or None if not found
        """
        team = Team.query.filter_by(abbreviation=abbreviation).first()
        return team.to_dict() if team else None
    
    @staticmethod
    def create_team(team_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new team.
        
        Args:
            team_data: Dictionary with team data
            
        Returns:
            Created team as dictionary
        """
        new_team = Team(
            name=team_data.get('name'),
            city=team_data.get('city'),
            abbreviation=team_data.get('abbreviation'),
            logo_url=team_data.get('logo_url'),
            primary_color=team_data.get('primary_color'),
            secondary_color=team_data.get('secondary_color'),
            division_id=team_data.get('division_id'),
            arena_name=team_data.get('arena_name'),
            arena_capacity=team_data.get('arena_capacity'),
            gm_name=team_data.get('gm_name'),
            coach_id=team_data.get('coach_id'),
            prestige=team_data.get('prestige', 50),
            budget=team_data.get('budget')
        )
        
        db.session.add(new_team)
        db.session.commit()
        
        return new_team.to_dict()
    
    @staticmethod
    def update_team(team_id: int, team_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing team.
        
        Args:
            team_id: The ID of the team to update
            team_data: Dictionary with updated team data
            
        Returns:
            Updated team as dictionary, or None if not found
        """
        team = Team.query.get(team_id)
        if not team:
            return None
            
        # Update team attributes
        for key, value in team_data.items():
            if hasattr(team, key):
                setattr(team, key, value)
        
        db.session.commit()
        
        return team.to_dict()
    
    @staticmethod
    def delete_team(team_id: int) -> bool:
        """
        Delete a team.
        
        Args:
            team_id: The ID of the team to delete
            
        Returns:
            Boolean indicating success
        """
        team = Team.query.get(team_id)
        if not team:
            return False
            
        db.session.delete(team)
        db.session.commit()
        
        return True
    
    @staticmethod
    def get_all_divisions() -> List[Dict[str, Any]]:
        """
        Get all divisions.
        
        Returns:
            List of divisions as dictionaries
        """
        divisions = Division.query.all()
        return [division.to_dict() for division in divisions]


# API endpoints that utilize the team service

@team_bp.route('/', methods=['GET'])
def get_teams():
    """Get all teams or filter by query parameters"""
    # Get query parameters
    filters = {}
    
    division_id = request.args.get('division_id')
    
    if division_id:
        filters['division_id'] = division_id
    
    # Get teams
    teams = TeamService.get_all_teams(filters)
    
    return jsonify(teams), 200


@team_bp.route('/<int:team_id>', methods=['GET'])
def get_team(team_id):
    """Get a specific team by ID"""
    team = TeamService.get_team_by_id(team_id)
    
    if not team:
        return jsonify({"error": f"Team with ID {team_id} not found"}), 404
        
    return jsonify(team), 200


@team_bp.route('/abbreviation/<string:abbreviation>', methods=['GET'])
def get_team_by_abbreviation(abbreviation):
    """Get a specific team by abbreviation"""
    team = TeamService.get_team_by_abbreviation(abbreviation.upper())
    
    if not team:
        return jsonify({"error": f"Team with abbreviation {abbreviation} not found"}), 404
        
    return jsonify(team), 200


@team_bp.route('/', methods=['POST'])
@jwt_required()
def create_team():
    """Create a new team"""
    team_data = request.get_json()
    
    if not team_data:
        return jsonify({"error": "No team data provided"}), 400
    
    # Validate required fields
    required_fields = ['name', 'city', 'abbreviation']
    for field in required_fields:
        if field not in team_data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    new_team = TeamService.create_team(team_data)
    return jsonify(new_team), 201


@team_bp.route('/<int:team_id>', methods=['PUT'])
@jwt_required()
def update_team(team_id):
    """Update an existing team"""
    team_data = request.get_json()
    
    if not team_data:
        return jsonify({"error": "No team data provided"}), 400
        
    updated_team = TeamService.update_team(team_id, team_data)
    
    if not updated_team:
        return jsonify({"error": f"Team with ID {team_id} not found"}), 404
        
    return jsonify(updated_team), 200


@team_bp.route('/<int:team_id>', methods=['DELETE'])
@jwt_required()
def delete_team(team_id):
    """Delete a team"""
    success = TeamService.delete_team(team_id)
    
    if not success:
        return jsonify({"error": f"Team with ID {team_id} not found"}), 404
        
    return jsonify({'message': 'Team deleted successfully'}), 200


@team_bp.route('/divisions', methods=['GET'])
def get_divisions():
    """Get all divisions"""
    divisions = TeamService.get_all_divisions()
    return jsonify(divisions), 200 