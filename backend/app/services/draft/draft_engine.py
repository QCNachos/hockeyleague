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
            except Exception as e:
                print(f"Error finding NHL teams: {str(e)}. Getting all teams instead.")
                # If all else fails, get all teams
                nhl_teams = Team.query.all()
            
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
        Check for existing draft-eligible players.
        No longer generates new players as we'll use existing 17-year-olds.
        """
        try:
            # Count existing draft-eligible players
            try:
                draft_eligible_count = Player.query.filter(
                    Player.age == 17,
                    Player.draft_year.is_(None)
                ).count()
                print(f"Found {draft_eligible_count} draft-eligible players")
            except Exception as e:
                print(f"Error counting draft-eligible players: {str(e)}")
                draft_eligible_count = 0
            
            # Log the number of eligible players but don't generate new ones
            if draft_eligible_count == 0:
                print("WARNING: No draft-eligible players found in the database.")
                print("Please ensure 17-year-old players exist before using the draft system.")
            else:
                print(f"Draft system ready with {draft_eligible_count} eligible players.")
            
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
        
        # Get all picks for this draft with team information
        picks = DraftPick.query.filter_by(draft_id=self.draft.id).order_by(DraftPick.overall_pick).all()
        
        return [pick.to_dict() for pick in picks]
    
    def get_draft_eligible_players(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get players eligible for the draft.
        
        Args:
            limit: Optional limit on number of players to return
            
        Returns:
            List of draft-eligible player dictionaries
        """
        try:
            query = Player.query.filter(
                Player.age == 17,
                Player.draft_year.is_(None)
            ).order_by(Player.overall_rating.desc())
            
            if limit:
                query = query.limit(limit)
                
            return [player.to_dict() for player in query.all()]
        except Exception as e:
            print(f"Error getting draft-eligible players: {str(e)}")
            return []  # Return empty list on error
    
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
        # Try to check Draft model accessibility first
        try:
            draft_check = Draft.query.limit(1).all()
            print(f"Draft model check: found {len(draft_check)} drafts")
        except Exception as draft_model_err:
            print(f"Draft model error: {str(draft_model_err)}")
            # If Draft model fails, return mock data
            year = request.args.get('year', datetime.now().year, type=int)
            mock_data = {
                "id": 1,
                "year": year,
                "round_count": 7,
                "status": "pending",
                "current_round": 1,
                "current_pick": 1,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "mock_data": True,
                "message": "This is mock data - database connectivity issue detected"
            }
            return jsonify(mock_data), 200
            
        # Create a draft engine instance
        draft_engine = DraftEngine()
        
        # Get the current year or from query param
        year = request.args.get('year', datetime.now().year, type=int)
        
        print(f"Initializing draft for year {year}")
    
        try:
            # Initialize draft for the given year
            draft_info = draft_engine.initialize_draft(year)
            
            print(f"Successfully retrieved draft info for year {year}")
    
            return jsonify(draft_info), 200
        except Exception as draft_err:
            print(f"Draft initialization error: {str(draft_err)}")
            # Return mock data on draft initialization error
            mock_data = {
                "id": 1,
                "year": year,
                "round_count": 7,
                "status": "pending",
                "current_round": 1,
                "current_pick": 1,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "mock_data": True,
                "message": f"This is mock data - draft initialization failed: {str(draft_err)}"
            }
            return jsonify(mock_data), 200
            
    except Exception as e:
        # Log the error
        error_message = f"Error in get_draft_info: {str(e)}"
        print(error_message)
        
        # Provide a fallback response with error details
        year = request.args.get('year', datetime.now().year, type=int)
        mock_data = {
            "id": 1,
            "year": year,
            "round_count": 7,
            "status": "pending",
            "current_round": 1,
            "current_pick": 1,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "mock_data": True,
            "message": "This is mock data - database may not be initialized properly"
        }
        
        return jsonify(mock_data), 200  # Return 200 even for fallback to let the frontend handle it gracefully


@draft_bp.route('/prospects', methods=['GET'])
def get_draft_prospects():
    """Get draft prospects"""
    try:
        # Try to check Player model accessibility first
        try:
            player_check = Player.query.limit(1).all()
            print(f"Player model check: found {len(player_check)} players")
        except Exception as player_err:
            print(f"Player model error: {str(player_err)}")
            # If Player model fails, return an empty array
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
            # Return empty array on draft initialization error
            return jsonify([]), 200
            
    except Exception as e:
        print(f"Error in get_draft_prospects: {str(e)}")
        # Return an empty array instead of an error - this helps frontend handle it gracefully
        return jsonify([]), 200


@draft_bp.route('/order', methods=['GET'])
def get_draft_order():
    """Get the draft order"""
    try:
        # Create a draft engine instance
        draft_engine = DraftEngine()
        
        # Get the current year or from query param
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Check if we can access the Team model first before trying to initialize draft
        # This will fail early if there are database issues
        try:
            team_check = Team.query.limit(1).all()
            print(f"Team model check: found {len(team_check)} teams")
        except Exception as team_err:
            print(f"Team model error: {str(team_err)}")
            # If Team model fails, return an empty array with a 200 status
            # This is better than a 500 error that breaks the frontend
            return jsonify([]), 200
        
        try:
            # Initialize draft for the given year
            draft_engine.initialize_draft(year)
            
            # Get draft order
            order = draft_engine.get_draft_order()
            
            return jsonify(order), 200
        except Exception as draft_err:
            print(f"Draft initialization error: {str(draft_err)}")
            # Return empty array on draft initialization error
            return jsonify([]), 200
            
    except Exception as e:
        print(f"Error in get_draft_order: {str(e)}")
        # Return an empty array instead of error - helps frontend handle gracefully
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


# Add a test endpoint that doesn't use database
@draft_bp.route('/test', methods=['GET'])
def test_draft_endpoint():
    """Test endpoint that doesn't depend on database"""
    response = {
        "status": "ok",
        "message": "Draft endpoint is working",
        "cors_enabled": True
    }
    return jsonify(response), 200


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


# Update the debug_draft_database function to better handle errors and CORS
@draft_bp.route('/debug', methods=['GET'])
def debug_draft_database():
    """Debug endpoint to check database state"""
    try:
        # Create a simplified response with basic database information
        response = {
            "status": "ok",
            "database_info": {
                "player_table": {
                    "exists": True,
                    "record_count": 0,
                    "draft_eligible_count": 0
                },
                "team_table": {
                    "exists": True,
                    "record_count": 0
                },
                "draft_table": {
                    "exists": True,
                    "record_count": 0
                },
                "draftpick_table": {
                    "exists": True,
                    "record_count": 0
                }
            }
        }
        
        # Try to get player count
        try:
            player_count = Player.query.count()
            response["database_info"]["player_table"]["record_count"] = player_count
            
            # Try to get draft-eligible player count
            draft_eligible_count = Player.query.filter(
                Player.age == 17,
                Player.draft_year.is_(None)
            ).count()
            response["database_info"]["player_table"]["draft_eligible_count"] = draft_eligible_count
        except Exception as player_err:
            print(f"Error getting player data: {str(player_err)}")
            response["database_info"]["player_table"]["exists"] = False
            response["database_info"]["player_table"]["error"] = str(player_err)
        
        # Try to get team count
        try:
            team_count = Team.query.count()
            response["database_info"]["team_table"]["record_count"] = team_count
        except Exception as team_err:
            print(f"Error getting team data: {str(team_err)}")
            response["database_info"]["team_table"]["exists"] = False
            response["database_info"]["team_table"]["error"] = str(team_err)
        
        # Try to get draft count
        try:
            draft_count = Draft.query.count()
            response["database_info"]["draft_table"]["record_count"] = draft_count
        except Exception as draft_err:
            print(f"Error getting draft data: {str(draft_err)}")
            response["database_info"]["draft_table"]["exists"] = False
            response["database_info"]["draft_table"]["error"] = str(draft_err)
        
        # Try to get draft pick count
        try:
            draftpick_count = DraftPick.query.count()
            response["database_info"]["draftpick_table"]["record_count"] = draftpick_count
        except Exception as pick_err:
            print(f"Error getting draft pick data: {str(pick_err)}")
            response["database_info"]["draftpick_table"]["exists"] = False
            response["database_info"]["draftpick_table"]["error"] = str(pick_err)
        
        return jsonify(response), 200
    except Exception as e:
        print(f"DEBUG: Error in debug endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

