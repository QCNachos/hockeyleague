from typing import Dict, List, Any, Optional
import random
from ...services.player import Player
from ...services.team_service import Team
from ...extensions import db
import uuid
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta, date
import sqlalchemy as sa
import os
from sqlalchemy import inspect
import logging
from .draft_ranking import DraftRankingService

# Create a blueprint for draft endpoints
draft_bp = Blueprint('draft', __name__)

# Draft Models
class Draft(db.Model):
    """
    Model for NHL draft information.
    """
    __tablename__ = 'drafts'
    
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    round_count = db.Column(db.Integer, default=7)
    status = db.Column(db.String(20), default='pending')  # pending, active, completed
    current_round = db.Column(db.Integer, default=1)
    current_pick = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define relationship to draft picks
    picks = db.relationship('DraftPick', backref='draft', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the model instance to a dictionary.
        
        Returns:
            Dictionary representation of the draft
        """
        return {
            'id': self.id,
            'year': self.year,
            'round_count': self.round_count,
            'status': self.status,
            'current_round': self.current_round,
            'current_pick': self.current_pick,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Draft':
        """
        Create a new Draft instance from a dictionary.
        
        Args:
            data: Dictionary with draft data
            
        Returns:
            New Draft instance
        """
        return cls(
            year=data.get('year'),
            round_count=data.get('round_count', 7),
            status=data.get('status', 'pending'),
            current_round=data.get('current_round', 1),
            current_pick=data.get('current_pick', 1)
        )


class DraftPick(db.Model):
    """
    Model for individual draft picks.
    """
    __tablename__ = 'draft_picks'
    
    id = db.Column(db.Integer, primary_key=True)
    draft_id = db.Column(db.Integer, db.ForeignKey('drafts.id'), nullable=False)
    round_num = db.Column(db.Integer, nullable=False)
    pick_num = db.Column(db.Integer, nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'))
    overall_pick = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define relationships
    team = db.relationship('Team', backref=db.backref('draft_picks', lazy=True))
    player = db.relationship('Player', foreign_keys=[player_id], back_populates='prospect')
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the model instance to a dictionary.
        
        Returns:
            Dictionary representation of the draft pick
        """
        return {
            'id': self.id,
            'draft_id': self.draft_id,
            'round_num': self.round_num,
            'pick_num': self.pick_num,
            'team_id': self.team_id,
            'player_id': self.player_id,
            'overall_pick': self.overall_pick,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DraftPick':
        """
        Create a new DraftPick instance from a dictionary.
        
        Args:
            data: Dictionary with draft pick data
            
        Returns:
            New DraftPick instance
        """
        return cls(
            draft_id=data.get('draft_id'),
            round_num=data.get('round_num'),
            pick_num=data.get('pick_num'),
            team_id=data.get('team_id'),
            player_id=data.get('player_id'),
            overall_pick=data.get('overall_pick')
        )

def calculate_age_from_birthdate(birthdate):
    """Calculate age from birthdate."""
    today = datetime.now().date()
    age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    return age

class DraftEngine:
    """
    Service for managing and simulating the entry draft.
    """
    
    def __init__(self):
        """Initialize the draft engine."""
        self.draft_year = None
        self.draft = None  # Current draft object
        
    def initialize_draft(self, year: int) -> Dict[str, Any]:
        """
        Initialize the draft for a specific year.
        
        Args:
            year: The draft year
        
        Returns:
            Draft information as a dictionary
        """
        try:
            self.draft_year = year
            
            # Check if draft already exists for this year - add error handling
            try:
                existing_draft = Draft.query.filter_by(year=year).first()
                if existing_draft:
                    self.draft = existing_draft
                    return existing_draft.to_dict()
            except Exception as e:
                print(f"Error checking existing draft: {str(e)}")
                raise Exception(f"Database error when checking for existing draft: {str(e)}")
            
            # Create new draft
            try:
                self.draft = Draft(
                    year=year,
                    round_count=7,
                    status='pending',
                    current_round=1, 
                    current_pick=1
                )
                db.session.add(self.draft)
                db.session.commit()
            except Exception as e:
                print(f"Error creating new draft: {str(e)}")
                db.session.rollback()
                raise Exception(f"Failed to create new draft: {str(e)}")
            
            # Generate draft order and picks
            try:
                self._generate_draft_picks()
            except Exception as e:
                print(f"Error generating draft picks: {str(e)}")
                raise Exception(f"Failed to generate draft picks: {str(e)}")
            
            # Check for existing draft eligible players
            try:
                self._ensure_draft_eligible_players()
            except Exception as e:
                print(f"Error checking draft eligible players: {str(e)}")
                # Don't raise an exception here - just log it
                # The draft can still proceed even without eligible players
                print(f"Warning: {str(e)}")
            
            return self.draft.to_dict()
        except Exception as e:
            print(f"General error in initialize_draft: {str(e)}")
            raise e
    
    def _generate_draft_picks(self) -> None:
        """
        Generate draft picks for each team.
        """
        try:
            # Get all NHL teams from the database
            nhl_teams = []
            
            try:
                # Try to use the TeamService to get NHL teams from Supabase
                from ...services.team_service import TeamService
                nhl_teams_data = TeamService.get_nhl_teams()
                
                if nhl_teams_data:
                    print(f"Found {len(nhl_teams_data)} NHL teams from TeamService")
                    
                    # Get draft picks from Supabase
                    try:
                        draft_picks_data = TeamService.get_draft_picks()
                        if draft_picks_data:
                            print(f"Found {len(draft_picks_data)} draft picks from Supabase")
                            
                            # Create custom draft order based on Draft_Picks table
                            # Group picks by round
                            picks_by_round = {}
                            for pick in draft_picks_data:
                                round_num = pick.get('round_num', 1)
                                if round_num not in picks_by_round:
                                    picks_by_round[round_num] = []
                                picks_by_round[round_num].append(pick)
                            
                            # Create draft picks based on the custom order
                            overall_pick_counter = 1
                            for round_num in range(1, 8):  # 7 rounds
                                round_picks = picks_by_round.get(round_num, [])
                                
                                # If no picks found for this round, create default order
                                if not round_picks:
                                    team_ids = [team.get('id') for team in nhl_teams_data]
                                    for pick_num, team_id in enumerate(team_ids, 1):
                                        draft_pick = DraftPick(
                                            draft_id=self.draft.id,
                                            round_num=round_num,
                                            pick_num=pick_num,
                                            team_id=team_id,
                                            overall_pick=overall_pick_counter
                                        )
                                        db.session.add(draft_pick)
                                        overall_pick_counter += 1
                                else:
                                    # Create picks based on Draft_Picks table
                                    for pick_num, pick_data in enumerate(round_picks, 1):
                                        team_id = pick_data.get('team_id')
                                        owning_team_id = pick_data.get('owning_team_id', team_id)
                                        
                                        draft_pick = DraftPick(
                                            draft_id=self.draft.id,
                                            round_num=round_num,
                                            pick_num=pick_num,
                                            team_id=owning_team_id,  # Use the team that owns the pick
                                            overall_pick=overall_pick_counter
                                        )
                                        db.session.add(draft_pick)
                                        overall_pick_counter += 1
                            
                            # Save all picks
                            db.session.commit()
                            return
                    except Exception as pick_err:
                        print(f"Error processing draft picks: {str(pick_err)}")
                        # Continue with standard draft order generation
                    
                    # If we get here, create standard draft order with teams from NHL
                    for team_data in nhl_teams_data:
                        team = Team.query.get(team_data.get('id'))
                        if team:
                            nhl_teams.append(team)
                        else:
                            # Create a new team record if it doesn't exist in local DB
                            new_team = Team(
                                id=team_data.get('id'),
                                name=team_data.get('team', ''),
                                city=team_data.get('city', ''),
                                abbreviation=team_data.get('abbreviation', ''),
                                division_id=team_data.get('division_id')
                            )
                            db.session.add(new_team)
                            db.session.commit()
                            nhl_teams.append(new_team)
            except Exception as e:
                print(f"Error using TeamService: {str(e)}. Falling back to direct database query.")
            
            # If no NHL teams found from TeamService, fall back to direct database query
            if not nhl_teams:
                # First, try to query teams that have a league field set to "NHL"
                try:
                    # Check if the league column exists in the Team model
                    if hasattr(Team, 'league'):
                        nhl_teams = Team.query.filter_by(league="NHL").all()
                        print(f"Found {len(nhl_teams)} teams with league='NHL'")
                except Exception as league_err:
                    print(f"Error filtering by league attribute: {str(league_err)}. League column might not exist.")
                
                # If no NHL teams found using the league field, try using divisions 1-4 (Atlantic, Metropolitan, Central, Pacific)
                if not nhl_teams:
                    print("Trying to find NHL teams by division_id (1-4)")
                    nhl_teams = Team.query.filter(Team.division_id.between(1, 4)).all()
                    print(f"Found {len(nhl_teams)} teams with division_id between 1-4")
                
                # If still no NHL teams, assume the first 32 teams are NHL teams
                if not nhl_teams:
                    print("No NHL teams found by league or division. Using first 32 teams.")
                    all_teams = Team.query.limit(32).all()
                    if all_teams:
                        nhl_teams = all_teams
                        print(f"Using {len(nhl_teams)} teams as NHL teams")
            
            if not nhl_teams:
                # Fallback if no teams are found
                print("No teams found in database. Cannot generate draft picks.")
                raise Exception("No teams found in database. Cannot generate draft picks.")
            
            print(f"Found {len(nhl_teams)} teams for draft picks")
            
            # Randomize draft order (in a real implementation, this would be based on standings/lottery)
            team_ids = [team.id for team in nhl_teams]
            random.shuffle(team_ids)
            
            # Create draft picks for each round
            for round_num in range(1, 8):  # 7 rounds
                for pick_num, team_id in enumerate(team_ids, 1):
                    overall_pick = (round_num - 1) * len(team_ids) + pick_num
                    
                    draft_pick = DraftPick(
                        draft_id=self.draft.id,
                        round_num=round_num,
                        pick_num=pick_num,
                        team_id=team_id,
                        overall_pick=overall_pick
                    )
                    db.session.add(draft_pick)
            
            db.session.commit()
        except Exception as e:
            print(f"Error in _generate_draft_picks: {str(e)}")
            db.session.rollback()
            raise e
    
    def _ensure_draft_eligible_players(self) -> None:
        """
        Check for existing draft-eligible players based on draft year.
        No longer generates new players as we'll use existing players of appropriate age.
        """
        try:
            # Calculate eligible age based on draft year
            current_year = datetime.now().year
            draft_year = getattr(self, 'year', current_year)
            eligible_age = 17 - (draft_year - current_year)
            
            # Count existing draft-eligible players
            try:
                draft_eligible_count = Player.query.filter(
                    Player.age == eligible_age,
                    Player.draft_year.is_(None)
                ).count()
                print(f"Found {draft_eligible_count} draft-eligible players (age {eligible_age}) for year {draft_year}")
            except Exception as e:
                print(f"Error counting draft-eligible players: {str(e)}")
                draft_eligible_count = 0
            
            # Log the number of eligible players but don't generate new ones
            if draft_eligible_count == 0:
                print(f"WARNING: No draft-eligible players found in the database for age {eligible_age}.")
                print(f"Please ensure {eligible_age}-year-old players exist before using the draft system for year {draft_year}.")
            else:
                print(f"Draft system ready with {draft_eligible_count} eligible players for year {draft_year}.")
            
        except Exception as e:
            print(f"Error in _ensure_draft_eligible_players: {str(e)}")
            raise e
    
    def get_draft_order(self) -> List[Dict[str, Any]]:
        """
        Get the current draft order.
        
        Returns:
            List of draft picks with team information
        """
        if not self.draft:
            return []
        
        try:
            # Get all picks for this draft with team information
            picks = DraftPick.query.filter_by(draft_id=self.draft.id).order_by(DraftPick.overall_pick).all()
            
            # Build list of picks with team information
            picks_with_teams = []
            for pick in picks:
                pick_dict = pick.to_dict()
                
                # Add team information if available
                if pick.team_id:
                    team = Team.query.get(pick.team_id)
                    if team:
                        pick_dict['team'] = team.to_dict()
                
                # Add player information if available
                if pick.player_id:
                    player = Player.query.get(pick.player_id)
                    if player:
                        pick_dict['player'] = player.to_dict()
                        
                picks_with_teams.append(pick_dict)
            
            return picks_with_teams
        except Exception as e:
            print(f"Error getting draft order: {str(e)}")
            return []
    
    def get_draft_eligible_players(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get players eligible for the draft with ranking information.
        
        Args:
            limit: Optional limit on number of players to return
            
        Returns:
            List of draft-eligible player dictionaries with ranking information
        """
        try:
            from ...services.team_service import TeamService
            
            # Determine eligible age based on draft year
            current_year = datetime.now().year
            draft_year = getattr(self, 'year', current_year)
            eligible_age = 17 - (draft_year - current_year)
            
            print(f"Fetching draft-eligible players for year {draft_year} (age: {eligible_age})")
            
            # Get all draft-eligible players
            query = Player.query.filter(
                Player.age == eligible_age,
                Player.draft_year.is_(None)
            ).order_by(Player.overall_rating.desc())
            
            if limit:
                query = query.limit(limit)
            
            players = query.all()
            
            # Get all teams to map team abbreviations to leagues
            teams_data = TeamService.get_nhl_teams()
            team_leagues = {}
            if teams_data:
                for team in teams_data:
                    if 'abbreviation' in team and 'league' in team:
                        team_leagues[team['abbreviation']] = team['league']
            
            # Enhance player data with league information
            enhanced_players = []
            for player in players:
                player_dict = player.to_dict()
                
                # Add league information if team abbreviation exists
                if player_dict.get('team') and player_dict['team'] in team_leagues:
                    player_dict['league'] = team_leagues[player_dict['team']]
                
                enhanced_players.append(player_dict)
            
            # If no players were found in the database, try to get them from Supabase
            if not enhanced_players:
                try:
                    from ...supabase_client import get_draft_eligible_players
                    supabase_players = get_draft_eligible_players(limit, draft_year)
                    if supabase_players:
                        return supabase_players
                except Exception as e:
                    print(f"Error fetching from Supabase in get_draft_eligible_players: {str(e)}")
            
            return enhanced_players
            
        except Exception as e:
            print(f"Error in get_draft_eligible_players: {str(e)}")
            traceback.print_exc()
            return []
    
    def make_pick(self, draft_pick_id: int, player_id: int) -> Dict[str, Any]:
        """
        Make a draft pick.
        
        Args:
            draft_pick_id: The ID of the draft pick
            player_id: The ID of the player being drafted
            
        Returns:
            Dictionary with pick information
        """
        # Get the draft pick
        draft_pick = DraftPick.query.get(draft_pick_id)
        if not draft_pick:
            return {"error": "Invalid draft pick ID"}
            
        # Get the player
        player = Player.query.get(player_id)
        if not player:
            return {"error": "Invalid player ID"}
            
        if player.draft_year:
            return {"error": "Player has already been drafted"}
            
        # Update the draft pick with the player
        draft_pick.player_id = player.id
        
        # Get the team
        team = Team.query.get(draft_pick.team_id)
        if not team:
            return {"error": "Invalid team for draft pick"}
        
        # Update the player with draft information
        player.draft_year = self.draft_year
        player.draft_round = draft_pick.round_num
        player.draft_pick = draft_pick.pick_num
        player.draft_overall = draft_pick.overall_pick
        player.draft_team_id = draft_pick.team_id
        player.associated_team_id = draft_pick.team_id  # Associate with drafting team
        
        # Update draft status
        self.draft.current_pick += 1
        
        # Get total number of teams for this draft
        teams_count = db.session.query(sa.func.count(sa.distinct(DraftPick.team_id))).\
            filter_by(draft_id=self.draft.id).scalar() or 32
        
        if self.draft.current_pick > teams_count:
            self.draft.current_pick = 1
            self.draft.current_round += 1
            
        if self.draft.current_round > self.draft.round_count:
            self.draft.status = "completed"
            
        db.session.commit()
        
        # Return updated information
        return {
            "draft_pick": draft_pick.to_dict(),
            "player": player.to_dict(),
            "draft_status": self.draft.to_dict()
        }
    
    def simulate_pick(self, draft_pick_id: int) -> Dict[str, Any]:
        """
        Simulate a draft pick by selecting the best available player.
        
        Args:
            draft_pick_id: The ID of the draft pick
            
        Returns:
            Dictionary with pick information
        """
        # Get the draft pick
        draft_pick = DraftPick.query.get(draft_pick_id)
        if not draft_pick:
            return {"error": "Invalid draft pick ID"}
            
        # Get best available player
        best_player = Player.query.filter(
            Player.age == 17,
            Player.draft_year.is_(None)
        ).order_by(Player.overall_rating.desc()).first()
        
        if not best_player:
            return {"error": "No draft-eligible players available"}
            
        # Make the pick
        return self.make_pick(draft_pick_id, best_player.id)
    
    def simulate_next_pick(self) -> Dict[str, Any]:
        """
        Simulate the next pick in the draft.
        
        Returns:
            Dictionary with pick information
        """
        if not self.draft:
            return {"error": "No active draft"}
            
        if self.draft.status == "completed":
            return {"error": "Draft is already completed"}
            
        # Get the next pick
        next_pick = DraftPick.query.filter_by(
            draft_id=self.draft.id,
            round_num=self.draft.current_round,
            pick_num=self.draft.current_pick,
            player_id=None  # Not yet picked
        ).first()
        
        if not next_pick:
            return {"error": "No more picks available"}
            
        # Simulate the pick
        return self.simulate_pick(next_pick.id)
    
    def simulate_round(self) -> List[Dict[str, Any]]:
        """
        Simulate the current round of the draft.
        
        Returns:
            List of pick dictionaries
        """
        if not self.draft:
            return {"error": "No active draft"}
            
        if self.draft.status == "completed":
            return {"error": "Draft is already completed"}
            
        results = []
        
        # Get all unpicked picks in the current round
        picks = DraftPick.query.filter_by(
            draft_id=self.draft.id,
            round_num=self.draft.current_round,
            player_id=None  # Not yet picked
        ).order_by(DraftPick.pick_num).all()
        
        for pick in picks:
            result = self.simulate_pick(pick.id)
            results.append(result)
            
        return results
    
    def simulate_entire_draft(self) -> Dict[str, Any]:
        """
        Simulate all remaining picks in the draft.
        
        Returns:
            Dictionary with draft results
        """
        if not self.draft:
            return {"error": "No active draft"}
            
        if self.draft.status == "completed":
            return {"error": "Draft is already completed"}
            
        # Get all unpicked picks
        picks = DraftPick.query.filter_by(
            draft_id=self.draft.id,
            player_id=None  # Not yet picked
        ).order_by(DraftPick.round_num, DraftPick.pick_num).all()
        
        for pick in picks:
            self.simulate_pick(pick.id)
            
        # Update draft status
        self.draft.status = "completed"
        db.session.commit()
            
        return {
            "status": "completed",
            "message": f"Completed {len(picks)} draft picks",
            "draft": self.draft.to_dict()
        }


# API endpoints that utilize the draft service

@draft_bp.route('/', methods=['GET'])
def get_draft_info():
    """Get current draft information"""
    try:
        # Create a draft engine instance
        draft_engine = DraftEngine()
        
        # Get the current year or from query param
        year = request.args.get('year', datetime.now().year, type=int)
        
        print(f"Initializing draft for year {year}")
    
        # Initialize draft for the given year
        draft_info = draft_engine.initialize_draft(year)
        
        print(f"Successfully retrieved draft info for year {year}")

        return jsonify(draft_info), 200
            
    except Exception as e:
        # Log the error
        error_message = f"Error in get_draft_info: {str(e)}"
        print(error_message)
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'error': str(e),
            'message': 'Failed to retrieve draft information'
        }), 500  # Return 500 for server errors


@draft_bp.route('/prospects', methods=['GET'])
def get_draft_prospects():
    """Get draft prospects with rankings"""
    try:
        # Try using Supabase first for better reliability
        try:
            from ...supabase_client import get_draft_eligible_players
            from ...services.team_service import TeamService
            
            # Get the current year or from query param
            year = request.args.get('year', datetime.now().year, type=int)
            limit = request.args.get('limit', 100, type=int)
            
            # Try to fetch directly with Supabase
            print("Trying to fetch draft eligible players directly from Supabase first")
            prospects = get_draft_eligible_players(limit, year)
            
            if prospects and len(prospects) > 0:
                # Enhance prospects with league information
                teams_data = TeamService.get_nhl_teams()
                team_leagues = {}
                if teams_data:
                    for team in teams_data:
                        if 'abbreviation' in team and 'league' in team:
                            team_leagues[team['abbreviation']] = team['league']
                
                # Add league information to each prospect
                for prospect in prospects:
                    if prospect.get('team') and prospect['team'] in team_leagues:
                        prospect['league'] = team_leagues[prospect['team']]
                
                # Calculate draft rankings
                try:
                    # Calculate ranking value for each player
                    for player in prospects:
                        player['ranking_value'] = DraftRankingService.calculate_draft_ranking_value(player)
                    
                    # Sort by ranking value in descending order
                    prospects.sort(key=lambda p: p.get('ranking_value', 0), reverse=True)
                    
                    # Add ranking position
                    for i, player in enumerate(prospects):
                        player['draft_ranking'] = i + 1
                        # Format the ranking value to 2 decimal places for display
                        player['ranking_display'] = f"{int(player.get('draft_ranking', 0))}"
                except Exception as rank_err:
                    print(f"Error calculating draft rankings: {str(rank_err)}")
                    # Continue without rankings if there's an error
                
                print(f"Successfully fetched {len(prospects)} prospects from Supabase")
                return jsonify(prospects), 200
            else:
                print("No prospects found in direct Supabase query, trying SQLAlchemy...")
        except Exception as supabase_err:
            print(f"Initial Supabase attempt error: {str(supabase_err)}")
            # Continue to try with SQLAlchemy
        
        # Try to check Player model accessibility
        try:
            player_check = Player.query.limit(1).all()
            print(f"Player model check: found {len(player_check)} players")
        except Exception as player_err:
            print(f"Player model error: {str(player_err)}")
            # If Player model fails, try using Supabase directly
            try:
                from ...supabase_client import get_draft_eligible_players
                
                # Get the current year or from query param
                year = request.args.get('year', datetime.now().year, type=int)
                limit = request.args.get('limit', 100, type=int)
                
                # Try to fetch directly with Supabase
                print("Trying to fetch draft eligible players directly from Supabase as fallback")
                prospects = get_draft_eligible_players(limit, year)
                
                if prospects and len(prospects) > 0:
                    # Calculate draft rankings
                    try:
                        # Calculate ranking value for each player
                        for player in prospects:
                            player['ranking_value'] = DraftRankingService.calculate_draft_ranking_value(player)
                        
                        # Sort by ranking value in descending order
                        prospects.sort(key=lambda p: p.get('ranking_value', 0), reverse=True)
                        
                        # Add ranking position
                        for i, player in enumerate(prospects):
                            player['draft_ranking'] = i + 1
                            # Format the ranking value for display
                            player['ranking_display'] = f"{int(player.get('draft_ranking', 0))}"
                    except Exception as rank_err:
                        print(f"Error calculating draft rankings: {str(rank_err)}")
                    
                    print(f"Successfully fetched {len(prospects)} prospects from Supabase")
                    return jsonify(prospects), 200
                else:
                    print("No prospects found in Supabase")
                    return jsonify([]), 200
            except Exception as supabase_err:
                print(f"Supabase error: {str(supabase_err)}")
                # If Supabase also fails, return an empty array
                return jsonify([]), 200
            
        # Create a draft engine instance
        draft_engine = DraftEngine()
        
        # Get the current year or from query param
        year = request.args.get('year', datetime.now().year, type=int)
        limit = request.args.get('limit', 100, type=int)
        
        try:
            # Initialize draft for the given year
            draft_engine.initialize_draft(year)
            
            # Get prospects - handle empty result gracefully
            prospects = draft_engine.get_draft_eligible_players(limit)
            
            # Return empty array if no prospects found - this avoids 500 errors
            return jsonify(prospects), 200
        except Exception as draft_err:
            print(f"Draft initialization error in prospects: {str(draft_err)}")
            # Fall back to Supabase if draft engine fails
            try:
                from ...supabase_client import get_draft_eligible_players
                
                # Try to fetch directly with Supabase
                print("Falling back to Supabase after draft engine error")
                prospects = get_draft_eligible_players(limit, year)
                
                if prospects and len(prospects) > 0:
                    # Calculate draft rankings
                    try:
                        # Calculate ranking value for each player
                        for player in prospects:
                            player['ranking_value'] = DraftRankingService.calculate_draft_ranking_value(player)
                        
                        # Sort by ranking value in descending order
                        prospects.sort(key=lambda p: p.get('ranking_value', 0), reverse=True)
                        
                        # Add ranking position
                        for i, player in enumerate(prospects):
                            player['draft_ranking'] = i + 1
                            # Format the ranking value for display
                            player['ranking_display'] = f"{int(player.get('draft_ranking', 0))}"
                    except Exception as rank_err:
                        print(f"Error calculating draft rankings: {str(rank_err)}")
                    
                    print(f"Successfully fetched {len(prospects)} prospects from Supabase fallback")
                    return jsonify(prospects), 200
                else:
                    print("No prospects found in Supabase fallback")
                    return jsonify([]), 200
            except Exception as supabase_err:
                print(f"Supabase fallback error: {str(supabase_err)}")
                # Return empty array on all failures
                return jsonify([]), 200
            
    except Exception as e:
        print(f"Error in get_draft_prospects: {str(e)}")
        # Return an empty array instead of an error - this helps frontend handle it gracefully
        return jsonify([]), 200


@draft_bp.route('/order', methods=['GET'])
def get_draft_order():
    """Get the draft order"""
    try:
        # Get the current year or from query param
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Check if we should use lottery
        use_lottery = request.args.get('use_lottery', 'false').lower() == 'true'
        
        # Import the DraftOrderService
        from .draft_order import DraftOrderService
        
        # Generate the draft order using DraftOrderService
        draft_order = DraftOrderService.generate_draft_order(year, use_lottery)
        
        if draft_order and len(draft_order) > 0:
            return jsonify(draft_order), 200
        else:
            print("No draft order returned from DraftOrderService")
            
    except Exception as e:
        print(f"Error in get_draft_order: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # If we reach here, something went wrong or we didn't get a valid order
    # Return an empty array instead of error - this helps frontend handle errors gracefully
    return jsonify([]), 200


@draft_bp.route('/pick', methods=['POST'])
def make_draft_pick():
    """Make a draft pick"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    draft_pick_id = data.get('draft_pick_id')
    player_id = data.get('player_id')
    
    if not draft_pick_id or not player_id:
        return jsonify({"error": "Missing required parameters"}), 400
    
    try:
        # Check models accessibility first
        try:
            player_check = Player.query.get(player_id)
            draft_pick_check = DraftPick.query.get(draft_pick_id)
            
            # Quick validation
            if not player_check:
                return jsonify({"error": "Player not found", "success": False}), 404
            if not draft_pick_check:
                return jsonify({"error": "Draft pick not found", "success": False}), 404
                
        except Exception as model_err:
            print(f"Database model error in make_pick: {str(model_err)}")
            return jsonify({
                "error": "Database error",
                "message": "Could not access required database models",
                "success": False
            }), 200  # Use 200 to let frontend handle it
        
        # Create a draft engine instance
        draft_engine = DraftEngine()
        
        # Get the current year or from query param
        year = data.get('year', datetime.now().year)
        
        # Initialize draft for the given year
        try:
            draft_engine.initialize_draft(year)
            
            # Make the pick
            result = draft_engine.make_pick(draft_pick_id, player_id)
            
            if "error" in result:
                # Return the error but with a 200 status
                result["success"] = False
                return jsonify(result), 200
                
            # Add success flag
            result["success"] = True
            return jsonify(result), 200
            
        except Exception as draft_err:
            print(f"Draft error in make_pick: {str(draft_err)}")
            return jsonify({
                "error": str(draft_err),
                "message": "Error processing draft pick",
                "success": False
            }), 200
            
    except Exception as e:
        print(f"General error in make_pick: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Failed to make draft pick",
            "success": False
        }), 200


@draft_bp.route('/simulate/pick', methods=['POST'])
def simulate_next_pick():
    """Simulate the next draft pick"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided", "success": False}), 400
    
    try:    
        # Create a draft engine instance
        draft_engine = DraftEngine()
        
        # Get the current year or from query param
        year = data.get('year', datetime.now().year)
        
        try:
            # Initialize draft for the given year
            draft_engine.initialize_draft(year)
            
            # Simulate the next pick
            result = draft_engine.simulate_next_pick()
            
            if "error" in result:
                # Return the error but with a 200 status
                result["success"] = False
                return jsonify(result), 200
                
            # Add success flag
            result["success"] = True
            return jsonify(result), 200
            
        except Exception as draft_err:
            print(f"Draft error in simulate_next_pick: {str(draft_err)}")
            return jsonify({
                "error": str(draft_err),
                "message": "Error simulating draft pick",
                "success": False
            }), 200
            
    except Exception as e:
        print(f"General error in simulate_next_pick: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Failed to simulate next pick",
            "success": False
        }), 200


@draft_bp.route('/simulate/round', methods=['POST'])
def simulate_round():
    """Simulate the current round of the draft"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided", "success": False}), 400
        
    try:
        # Create a draft engine instance
        draft_engine = DraftEngine()
        
        # Get the current year or from query param
        year = data.get('year', datetime.now().year)
        
        try:
            # Initialize draft for the given year
            draft_engine.initialize_draft(year)
            
            # Simulate the round
            results = draft_engine.simulate_round()
            
            if isinstance(results, dict) and "error" in results:
                # Return the error but with a 200 status
                results["success"] = False
                return jsonify(results), 200
                
            # Add success flag to the response
            response = {
                "results": results if isinstance(results, list) else [],
                "success": True,
                "message": f"Simulated {len(results) if isinstance(results, list) else 0} picks"
            }
            return jsonify(response), 200
            
        except Exception as draft_err:
            print(f"Draft error in simulate_round: {str(draft_err)}")
            return jsonify({
                "error": str(draft_err),
                "message": "Error simulating draft round",
                "success": False,
                "results": []
            }), 200
            
    except Exception as e:
        print(f"General error in simulate_round: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Failed to simulate draft round",
            "success": False,
            "results": []
        }), 200


@draft_bp.route('/simulate/all', methods=['POST'])
def simulate_draft():
    """Simulate the entire draft"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided", "success": False}), 400
        
    try:
        # Create a draft engine instance
        draft_engine = DraftEngine()
        
        # Get the current year or from query param
        year = data.get('year', datetime.now().year)
    
        try:
            # Initialize draft for the given year
            draft_engine.initialize_draft(year)
            
            # Simulate the entire draft
            results = draft_engine.simulate_entire_draft()
            
            if "error" in results:
                # Return the error but with a 200 status
                results["success"] = False
                return jsonify(results), 200
                
            # Add success flag
            results["success"] = True
            return jsonify(results), 200
            
        except Exception as draft_err:
            print(f"Draft error in simulate_draft: {str(draft_err)}")
            return jsonify({
                "error": str(draft_err),
                "message": "Error simulating entire draft",
                "success": False
            }), 200
            
    except Exception as e:
        print(f"General error in simulate_draft: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Failed to simulate entire draft",
            "success": False
        }), 200


# Add a OPTIONS handler to support CORS preflight requests
@draft_bp.route('/<path:path>', methods=['OPTIONS'])
@draft_bp.route('/', methods=['OPTIONS'])
def handle_draft_options(path=None):
    """Handle OPTIONS requests for CORS preflight"""
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response, 200


def count_statuses(picks):
    """Helper function to count pick statuses"""
    counts = {}
    for pick in picks:
        status = pick.get('pick_status')
        if status:
            counts[status] = counts.get(status, 0) + 1
        else:
            counts['null'] = counts.get('null', 0) + 1
    return counts


# Add a new endpoint for draft rankings
@draft_bp.route('/rankings', methods=['GET'])
def get_rankings():
    """Get draft rankings for eligible players"""
    try:
        # Get year from query params, default to current year
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Get draft rankings using the ranking service
        rankings = DraftRankingService.get_draft_rankings(year)
        
        # Return rankings
        return jsonify(rankings), 200
    except Exception as e:
        print(f"Error in get_rankings: {str(e)}")
        return jsonify({"error": str(e)}), 500



