from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..models.team import Team
from ..models.division import Division
from ..extensions import db

team_bp = Blueprint('team', __name__)


@team_bp.route('/', methods=['GET'])
def get_teams():
    """Get all teams or filter by query parameters"""
    # Get query parameters
    division_id = request.args.get('division_id')
    
    # Start with base query
    query = Team.query
    
    # Apply filters if provided
    if division_id:
        query = query.filter_by(division_id=division_id)
    
    # Execute query and convert to list of dicts
    teams = [team.to_dict() for team in query.all()]
    
    return jsonify(teams), 200


@team_bp.route('/<int:team_id>', methods=['GET'])
def get_team(team_id):
    """Get a specific team by ID"""
    team = Team.query.get_or_404(team_id)
    return jsonify(team.to_dict()), 200


@team_bp.route('/', methods=['POST'])
@jwt_required()
def create_team():
    """Create a new team"""
    data = request.get_json()
    
    new_team = Team(
        name=data.get('name'),
        city=data.get('city'),
        abbreviation=data.get('abbreviation'),
        logo_url=data.get('logo_url'),
        primary_color=data.get('primary_color'),
        secondary_color=data.get('secondary_color'),
        division_id=data.get('division_id'),
        arena_name=data.get('arena_name'),
        arena_capacity=data.get('arena_capacity'),
        gm_name=data.get('gm_name'),
        coach_id=data.get('coach_id'),
        prestige=data.get('prestige', 50),
        budget=data.get('budget')
    )
    
    db.session.add(new_team)
    db.session.commit()
    
    return jsonify(new_team.to_dict()), 201


@team_bp.route('/<int:team_id>', methods=['PUT'])
@jwt_required()
def update_team(team_id):
    """Update an existing team"""
    team = Team.query.get_or_404(team_id)
    data = request.get_json()
    
    # Update team attributes
    for key, value in data.items():
        if hasattr(team, key):
            setattr(team, key, value)
    
    db.session.commit()
    
    return jsonify(team.to_dict()), 200


@team_bp.route('/<int:team_id>', methods=['DELETE'])
@jwt_required()
def delete_team(team_id):
    """Delete a team"""
    team = Team.query.get_or_404(team_id)
    
    db.session.delete(team)
    db.session.commit()
    
    return jsonify({'message': 'Team deleted successfully'}), 200


@team_bp.route('/divisions', methods=['GET'])
def get_divisions():
    """Get all divisions"""
    divisions = Division.query.all()
    return jsonify([division.to_dict() for division in divisions]), 200
