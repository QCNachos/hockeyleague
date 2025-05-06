from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..services.league import Division, League
from ..extensions import db
from datetime import datetime
import os
from supabase import create_client, Client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a blueprint for team endpoints
team_bp = Blueprint('team', __name__)

# Create Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client():
    """Get a Supabase client instance"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("Supabase credentials not configured")
        return None
    
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Error connecting to Supabase: {e}")
        return None

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
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'))  # New league_id column
    league = db.Column(db.String(100))  # Legacy league column for backward compatibility
    country = db.Column(db.String(100), default='Canada')  # Adding country field
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - use string references for all relationships to avoid import issues
    players = db.relationship('Player', foreign_keys='Player.team_id', back_populates='team')
    draft_players = db.relationship('Player', foreign_keys='Player.draft_team_id', backref='draft_team')
    associated_players = db.relationship('Player', foreign_keys='Player.associated_team_id', backref='associated_team')
    coach = db.relationship('Coach', back_populates='team')
    division_obj = db.relationship('Division', back_populates='teams')
    league_object = db.relationship('League', back_populates='teams')  # Updated relationship to League model
    
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
        league_type = None
        if self.league_object:
            league_type = self.league_object.league_level
        
        return {
            'id': self.id,
            'name': self.name,
            'city': self.city,
            'abbreviation': self.abbreviation,
            'logo_url': self.logo_url,
            'primary_color': self.primary_color or '#1e1e1e',  # Default dark gray if None
            'secondary_color': self.secondary_color or '#FFFFFF',  # Default white if None
            'division_id': self.division_id,
            'division': self.division_id,  # For backward compatibility
            'arena_name': self.arena_name,
            'arena_capacity': self.arena_capacity,
            'gm_name': self.gm_name,
            'coach_id': self.coach_id,
            'prestige': self.prestige,
            'budget': self.budget,
            'league_id': self.league_id,
            'league': self.league or (self.league_object.league if self.league_object else None),
            'league_type': league_type,
            'country': self.country
        }

class TeamService:
    """
    Service for managing teams.
    """
    
    @staticmethod
    def get_all_teams() -> List[Dict[str, Any]]:
        """
        Get all teams from Supabase.
            
        Returns:
            List of teams as dictionaries, with field names normalized
            to match what the frontend expects.
        """
        import os
        from supabase import create_client, Client
        import logging
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        # Get Supabase credentials
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        if not SUPABASE_URL or not SUPABASE_KEY:
            logger.error("Supabase credentials not found in environment variables")
            return []
        
        try:
            # Initialize Supabase client
            logger.info("Initializing Supabase client for team service")
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # STEP 1: Get all leagues with their abbreviations and league_level 
            logger.info("Fetching leagues with their abbreviations and league types")
            league_response = supabase.table("League").select("league, abbreviation, league_level").execute()
            leagues_data = league_response.data if hasattr(league_response, 'data') else []
            
            # Create mapping of league abbreviation to league_level
            # This is the key change - we map abbreviation to league_level instead of league name to league_level
            league_to_type_map = {}
            for league in leagues_data:
                if 'abbreviation' in league and 'league_level' in league:
                    league_to_type_map[league['abbreviation']] = league['league_level']
            
            logger.info(f"Created mapping of {len(league_to_type_map)} league abbreviations to league types")
            
            # Manually add NHL and other major leagues that might be missing
            if 'NHL' not in league_to_type_map:
                league_to_type_map['NHL'] = 'Pro'
            if 'AHL' not in league_to_type_map:
                league_to_type_map['AHL'] = 'Pro'
            if 'KHL' not in league_to_type_map:
                league_to_type_map['KHL'] = 'Pro'
                
            # STEP 2: Get all teams
            logger.info("Fetching teams from Supabase")
            response = supabase.table("Team").select("*").execute()
            teams_data = response.data if hasattr(response, 'data') else []
            
            # If no teams found, return empty array
            if not teams_data:
                logger.warning("No teams found in Supabase")
                return []
            
            # STEP 3: Process teams to include league_type by looking up in the mapping using league as abbreviation
            processed_teams = []
            for team in teams_data:
                # Get the team's league (which is actually the abbreviation in the Team table)
                team_league = team.get('league', '')
                
                # Look up the league_type from the mapping using the abbreviation
                league_type = league_to_type_map.get(team_league, None)
                
                # If league_type is still None, use a fallback based on known patterns
                if league_type is None:
                    logger.warning(f"No league type found for team {team.get('team')} with league {team_league}")
                    # Try to infer league type from league name
                    if 'NHL' in team_league or 'KHL' in team_league or 'SHL' in team_league or 'AHL' in team_league:
                        league_type = 'Pro'
                    elif 'Junior' in team_league or 'U20' in team_league:
                        league_type = 'Junior'
                    elif 'U18' in team_league or 'U17' in team_league:
                        league_type = 'Sub-Junior'
                    elif 'U16' in team_league or 'U15' in team_league or 'U14' in team_league:
                        league_type = 'Minor'
                    else:
                        league_type = 'Unknown'
                
                # Create a processed team dictionary with normalized field names
                processed_team = {
                    'id': team.get('id'),
                    'name': team.get('team'),
                    'city': team.get('location'),
                    'abbreviation': team.get('abbreviation'),
                    'league': team.get('league'),
                    'league_type': league_type,
                    'conference': team.get('conference'),
                    'division_id': team.get('division'),
                    'primary_color': team.get('primary_color'),
                    'secondary_color': team.get('secondary_color'),
                    'arena_name': team.get('arena_name'),
                    'arena_capacity': team.get('arena_capacity'),
                    'prestige': team.get('prestige'),
                    'country': team.get('country')
                }
                processed_teams.append(processed_team)
            
            # Count by league type for logging
            league_type_counts = {}
            for team in processed_teams:
                lt = team.get('league_type', 'Unknown')
                league_type_counts[lt] = league_type_counts.get(lt, 0) + 1
                
            logger.info(f"Processed {len(processed_teams)} teams with league types: {league_type_counts}")
            
            return processed_teams
            
        except Exception as e:
            logger.error(f"Error fetching teams from Supabase: {e}")
            return []
    
    @staticmethod
    def get_nhl_teams() -> List[Dict[str, Any]]:
        """
        Get all NHL teams from Supabase.
        
        Returns:
            List of NHL teams as dictionaries
        """
        try:
            supabase = get_supabase_client()
            if supabase:
                # Fetch all NHL teams from Supabase
                response = supabase.table("Team").select("*").eq("league", "NHL").execute()
                
                if response.data:
                    logger.info(f"Fetched {len(response.data)} NHL teams from Supabase")
                    return response.data
                else:
                    logger.warning("No NHL teams found in Supabase")
            else:
                logger.warning("Could not connect to Supabase")
        except Exception as e:
            logger.error(f"Error fetching NHL teams from Supabase: {e}")
        
        # Fallback to local database if Supabase fetch fails
        try:
            # Try to query teams that have league column set to "NHL"
            teams = []
            try:
                teams = Team.query.filter_by(league="NHL").all()
            except Exception:
                # If league column doesn't exist, try using divisions 1-4
                teams = Team.query.filter(Team.division_id.between(1, 4)).all()
                
            if not teams:
                # If still no teams, get first 32 teams
                teams = Team.query.limit(32).all()
                
            return [team.to_dict() for team in teams]
        except Exception as e:
            logger.error(f"Error fetching NHL teams from local database: {e}")
            return []
    
    @staticmethod
    def get_draft_picks(year=None, pick_status=None) -> List[Dict[str, Any]]:
        """
        Get the draft picks from Supabase.
        
        Args:
            year: Optional filter for draft year
            pick_status: Optional filter for pick status (Owned, Traded, etc.)
            
        Returns:
            List of draft picks as dictionaries
        """
        try:
            supabase = get_supabase_client()
            if supabase:
                # Start building the query
                query = supabase.table("Draft_Picks").select("*, team(*)")
                
                # Apply filters if provided
                if year:
                    query = query.eq("year", year)
                if pick_status:
                    query = query.eq("pick_status", pick_status)
                    
                # Sort by round, then team
                query = query.order("round", {"ascending": True})
                    
                # Execute query
                response = query.execute()
                
                if response.data:
                    logger.info(f"Fetched {len(response.data)} draft picks from Supabase")
                    return response.data
                else:
                    logger.warning("No draft picks found in Supabase")
            else:
                logger.warning("Could not connect to Supabase")
        except Exception as e:
            logger.error(f"Error fetching draft picks from Supabase: {e}")
        
        return []
    
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
            budget=team_data.get('budget'),
            league_id=team_data.get('league_id'),
            league=team_data.get('league'),
            country=team_data.get('country')
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


# API routes
@team_bp.route('/', methods=['GET'])
@team_bp.route('', methods=['GET'])  # Add route without trailing slash
def get_all_teams_api():
    """Get all teams
    
    Returns:
        JSON response with teams data
    """
    try:
        # Get teams without any filters
        teams = TeamService.get_all_teams()
        return jsonify(teams), 200
    except Exception as e:
        import logging
        logging.error(f"Error in get_all_teams_api: {e}")
        return jsonify({"error": str(e)}), 500


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


@team_bp.route('/nhl', methods=['GET'])
def get_nhl_teams():
    """Get all NHL teams"""
    teams = TeamService.get_nhl_teams()
    return jsonify(teams), 200


@team_bp.route('/draft-picks', methods=['GET'])
def get_draft_picks():
    """
    Get draft picks, optionally filtered by year and status.
    
    Returns:
        JSON array of draft picks
    """
    try:
        # Get filter parameters
        year = request.args.get('year', type=int)
        pick_status = request.args.get('pick_status')  # Make optional
        
        # Get draft picks from service
        picks = TeamService.get_draft_picks(year=year, pick_status=pick_status)
        
        if not picks:
            logger.warning(f"No draft picks found for year {year}")
            return jsonify([])
        
        # Log sample data for debugging
        if len(picks) > 0:
            sample_pick = picks[0]
            logger.info(f"Sample raw pick data: {sample_pick}")
            logger.info(f"Sample pick fields: {list(sample_pick.keys())}")
            
            # Log counts of different pick statuses
            status_counts = {}
            for pick in picks:
                status = pick.get('pick_status')
                if status:
                    status_counts[status] = status_counts.get(status, 0) + 1
                else:
                    status_counts['null'] = status_counts.get('null', 0) + 1
                    
            logger.info(f"Pick status counts: {status_counts}")
        
        # Format picks for frontend - carefully preserving the pick_status field
        # First, separate picks by round
        picks_by_round = {}
        for pick in picks:
            round_num = pick.get('round')
            if round_num not in picks_by_round:
                picks_by_round[round_num] = []
            picks_by_round[round_num].append(pick)
        
        # Now process each round in order
        formatted_picks = []
        overall_pick_counter = 1
        
        # Sort round numbers
        sorted_rounds = sorted(picks_by_round.keys())
        
        for round_num in sorted_rounds:
            round_picks = picks_by_round[round_num]
            pick_num_in_round = 1
            
            # We need to identify all teams that have picks in this round
            # including both original picks and received picks
            teams_with_picks = set()
            received_picks = {}
            
            # First pass - identify original and received picks
            for pick in round_picks:
                team = pick.get('team', {}).get('abbreviation') or pick.get('team')
                teams_with_picks.add(team)
                
                # Check for received picks
                pick_status = pick.get('pick_status')
                
                # If this pick was traded away, note which team has rights to it
                if pick_status == 'Traded':
                    for i in range(1, 7):  # Check received_pick_1 through received_pick_6
                        received_team = pick.get(f'received_pick_{i}')
                        if received_team:
                            if received_team not in received_picks:
                                received_picks[received_team] = []
                            received_picks[received_team].append({
                                'original_team': team,
                                'pick_data': pick
                            })
                            teams_with_picks.add(received_team)
                            break  # Only use the first non-empty received_pick field
            
            # Second pass - format picks in correct order
            for team in sorted(teams_with_picks):
                # First, add the team's own pick if it has status 'Owned'
                own_pick = next((p for p in round_picks if 
                              (p.get('team', {}).get('abbreviation') or p.get('team')) == team and 
                              p.get('pick_status') == 'Owned'), None)
                
                if own_pick:
                    formatted_pick = {
                        'id': own_pick.get('id'),
                        'round_num': round_num,
                        'overall_pick': overall_pick_counter,
                        'pick_num': pick_num_in_round,
                        'team_id': own_pick.get('team', {}).get('id'),
                        'team_abbreviation': team,
                        'team': own_pick.get('team'),
                        'pick_status': 'Owned',
                        'year': own_pick.get('year')
                    }
                    formatted_picks.append(formatted_pick)
                    overall_pick_counter += 1
                    pick_num_in_round += 1
                
                # Then, add any picks this team has received from other teams
                if team in received_picks:
                    for received in received_picks[team]:
                        original_team = received['original_team']
                        pick_data = received['pick_data']
                        
                        formatted_pick = {
                            'id': pick_data.get('id'),
                            'round_num': round_num,
                            'overall_pick': overall_pick_counter,
                            'pick_num': pick_num_in_round,
                            'team_id': pick_data.get('team', {}).get('id'),
                            'team_abbreviation': team,  # This is the team that now owns the pick
                            'team': {
                                'id': pick_data.get('team', {}).get('id'),
                                'abbreviation': team,
                                'name': team  # Will be replaced with actual team name if available
                            },
                            'pick_status': 'Received',
                            'received_from': original_team,
                            'year': pick_data.get('year')
                        }
                        formatted_picks.append(formatted_pick)
                        overall_pick_counter += 1
                        pick_num_in_round += 1
        
        # Now get team name/color information to enhance the display
        try:
            teams_data = TeamService.get_nhl_teams()
            if teams_data:
                # Create lookup by abbreviation
                team_info = {}
                for team in teams_data:
                    abbrev = team.get('abbreviation')
                    if abbrev:
                        team_info[abbrev] = team
                
                # Update formatted picks with full team info
                for pick in formatted_picks:
                    team_abbrev = pick.get('team_abbreviation')
                    if team_abbrev and team_abbrev in team_info:
                        pick['team'] = {
                            'id': team_info[team_abbrev].get('id'),
                            'name': team_info[team_abbrev].get('team'),
                            'abbreviation': team_abbrev,
                            'city': team_info[team_abbrev].get('city'),
                            'primary_color': team_info[team_abbrev].get('primary_color', '#333'),
                            'secondary_color': team_info[team_abbrev].get('secondary_color', '#fff')
                        }
        except Exception as team_err:
            logger.error(f"Error enhancing team data: {team_err}")
        
        # Log a sample of formatted picks
        if formatted_picks:
            logger.info(f"Sample formatted pick: {formatted_picks[0]}")
            logger.info(f"Total picks formatted: {len(formatted_picks)}")
            
        return jsonify(formatted_picks)
    except Exception as e:
        logger.error(f"Error in draft picks endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@team_bp.route('/draft-picks-debug', methods=['GET'])
def get_draft_picks_debug():
    """
    Debug endpoint to get raw draft picks data directly from Supabase.
    
    Returns:
        Raw JSON data from Supabase
    """
    try:
        # Get filter parameters
        year = request.args.get('year', type=int)
        
        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({"error": "Could not connect to Supabase"}), 500
        
        # Make raw query without any processing
        query = supabase.table("Draft_Picks").select("*")
        
        # Apply year filter if provided
        if year:
            query = query.eq("year", year)
            
        # Execute query
        response = query.execute()
        
        if response.data:
            # Count status values
            status_counts = {}
            for pick in response.data:
                status = pick.get('pick_status')
                if status:
                    status_counts[status] = status_counts.get(status, 0) + 1
                else:
                    status_counts['null'] = status_counts.get('null', 0) + 1
                    
            # Get non-owned picks
            non_owned = [pick for pick in response.data if pick.get('pick_status') != 'Owned']
            
            return jsonify({
                "raw_data": response.data,
                "count": len(response.data),
                "status_counts": status_counts,
                "non_owned_picks": non_owned
            })
        else:
            return jsonify({"error": "No draft picks found", "count": 0})
    except Exception as e:
        logger.error(f"Error in draft picks debug endpoint: {e}")
        return jsonify({"error": str(e)}), 500 


@team_bp.route('/conferences', methods=['GET'])
def get_team_conferences():
    """Get all conferences for teams"""
    from .league import ConferenceService
    conferences = ConferenceService.get_all_conferences()
    return jsonify(conferences), 200 