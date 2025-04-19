from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..models.player import Player
from ..extensions import db

# Create a blueprint for player endpoints
player_bp = Blueprint('player', __name__)

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