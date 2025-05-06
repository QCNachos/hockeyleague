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

@player_bp.route('/best-by-team', methods=['GET'])
def get_best_player_by_team():
    """Get the best player for each team based on overall rating"""
    from ..supabase_client import get_supabase
    import logging
    import traceback
    
    try:
        logging.info("Fetching best players by team from Supabase")
        supabase = get_supabase()
        
        # First, examine the Player table schema to know which columns exist
        try:
            logging.info("Inspecting Player table schema...")
            # Use a generic select to get the first record and see its structure
            schema_query = supabase.table('Player').select('*').limit(1).execute()
            if schema_query.data and len(schema_query.data) > 0:
                sample_player = schema_query.data[0]
                available_columns = list(sample_player.keys())
                logging.info(f"Available Player columns: {available_columns}")
                
                # Get the team identifier column (could be 'team' or 'team_id')
                team_column = None
                if 'team_id' in available_columns:
                    team_column = 'team_id'
                elif 'team' in available_columns:
                    team_column = 'team'
                
                # Get column for player's overall rating 
                rating_column = None
                possible_rating_columns = ['overall', 'overall_rating', 'rating']
                for col in possible_rating_columns:
                    if col in available_columns:
                        rating_column = col
                        break
                
                # Get column for player's position
                position_column = None
                possible_position_columns = ['position', 'position_primary', 'player_position']
                for col in possible_position_columns:
                    if col in available_columns:
                        position_column = col
                        break
                
                logging.info(f"Using columns: team={team_column}, rating={rating_column}, position={position_column}")
            else:
                logging.warning("No data found in Player table schema query")
                team_column = 'team'
                rating_column = 'overall' 
                position_column = 'position'
        except Exception as schema_error:
            logging.error(f"Error inspecting Player table schema: {schema_error}")
            traceback.print_exc()
            team_column = 'team'
            rating_column = 'overall'
            position_column = 'position'
                
        # Now fetch players for all positions
        best_players = []
        
        # Only proceed with player query if we have a team column
        if team_column:
            try:
                logging.info(f"Querying Player table for all positions using team column: {team_column}")
                
                # Build select statement based on available columns
                select_statement = f"id, first_name, last_name, {team_column}"
                if rating_column:
                    select_statement += f", {rating_column}"
                if position_column:
                    select_statement += f", {position_column}"
                
                # Get all players with team assignment
                player_query = supabase.table('Player').select(select_statement).execute()
                
                if player_query.data and len(player_query.data) > 0:
                    logging.info(f"Found {len(player_query.data)} players")
                    
                    # Group players by team
                    players_by_team = {}
                    for player in player_query.data:
                        team = player.get(team_column)
                        if not team:
                            continue
                        
                        # Get overall rating and ensure it's an integer
                        overall = 0
                        if rating_column:
                            try:
                                overall_value = player.get(rating_column)
                                if isinstance(overall_value, str):
                                    overall = int(float(overall_value))
                                else:
                                    overall = int(overall_value or 0)
                            except (ValueError, TypeError):
                                overall = 0
                        
                        # Initialize team entry if not exists
                        if team not in players_by_team:
                            players_by_team[team] = []
                        
                        # Add player to team's list with crucial data for sorting
                        players_by_team[team].append({
                            'player': player,
                            'overall': overall
                        })
                    
                    # For each team, find the player with the highest overall rating
                    for team, players in players_by_team.items():
                        if not players:
                            continue
                        
                        # Sort players by overall in descending order (highest first)
                        sorted_players = sorted(players, key=lambda x: x['overall'], reverse=True)
                        
                        # Get the player with highest overall rating
                        best_player_data = sorted_players[0]
                        player = best_player_data['player']
                        
                        formatted_player = {
                            'id': player.get('id'),
                            'first_name': player.get('first_name', ''),
                            'last_name': player.get('last_name', ''),
                            'team_id': team,
                            'overall': best_player_data['overall']
                        }
                        
                        # Add position if available
                        if position_column:
                            formatted_player['position'] = player.get(position_column, '')
                        
                        best_players.append(formatted_player)
                        
                else:
                    logging.warning("No data returned from Player query")
            except Exception as player_error:
                logging.error(f"Error querying Player table: {player_error}")
                traceback.print_exc()
        else:
            logging.error(f"Cannot query Player table due to missing team column")
        
        # Return the results
        return jsonify(best_players), 200
    except Exception as e:
        logging.error(f"Error in get_best_player_by_team: {e}")
        logging.exception("Traceback:")
        return jsonify({"error": str(e)}), 500

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