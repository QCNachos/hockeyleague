from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..models.player import Player
from ..extensions import db

player_bp = Blueprint('player', __name__)


@player_bp.route('/', methods=['GET'])
def get_players():
    """Get all players or filter by query parameters"""
    # Get query parameters
    team_id = request.args.get('team_id')
    position = request.args.get('position')
    
    # Start with base query
    query = Player.query
    
    # Apply filters if provided
    if team_id:
        query = query.filter_by(team_id=team_id)
    if position:
        query = query.filter_by(position=position)
    
    # Execute query and convert to list of dicts
    players = [player.to_dict() for player in query.all()]
    
    return jsonify(players), 200


@player_bp.route('/<int:player_id>', methods=['GET'])
def get_player(player_id):
    """Get a specific player by ID"""
    player = Player.query.get_or_404(player_id)
    return jsonify(player.to_dict()), 200


@player_bp.route('/', methods=['POST'])
@jwt_required()
def create_player():
    """Create a new player"""
    data = request.get_json()
    
    new_player = Player(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        position=data.get('position'),
        team_id=data.get('team_id'),
        overall_rating=data.get('overall_rating', 50),
        age=data.get('age', 18),
        nationality=data.get('nationality'),
        # Add other player attributes here
    )
    
    db.session.add(new_player)
    db.session.commit()
    
    return jsonify(new_player.to_dict()), 201


@player_bp.route('/<int:player_id>', methods=['PUT'])
@jwt_required()
def update_player(player_id):
    """Update an existing player"""
    player = Player.query.get_or_404(player_id)
    data = request.get_json()
    
    # Update player attributes
    for key, value in data.items():
        if hasattr(player, key):
            setattr(player, key, value)
    
    db.session.commit()
    
    return jsonify(player.to_dict()), 200


@player_bp.route('/<int:player_id>', methods=['DELETE'])
@jwt_required()
def delete_player(player_id):
    """Delete a player"""
    player = Player.query.get_or_404(player_id)
    
    db.session.delete(player)
    db.session.commit()
    
    return jsonify({'message': 'Player deleted successfully'}), 200
