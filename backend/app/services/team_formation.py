from typing import Dict, List, Any, Optional, Tuple
import os
from supabase import create_client, Client
from .chemistry import ChemistryCalculator
from flask import Blueprint, jsonify, request
import traceback
from ..models.player import Player
from ..models.team import Team
from ..extensions import db

# Create a blueprint for team rating endpoints
team_rating_bp = Blueprint('team_rating', __name__)

class TeamFormation:
    """
    Service for generating optimal team formations including lines, chemistry, and ratings.
    """
    
    def __init__(self, team_abbreviation: str):
        """
        Initialize the team formation service.
        
        Args:
            team_abbreviation: The abbreviation of the team (e.g., MTL, TOR)
        """
        self.team_abbreviation = team_abbreviation
        # Import LineOptimizer lazily in the initialize method
        self.line_optimizer = None
        self.chemistry_calculator = ChemistryCalculator()
        self.team_rating = {}
        self.supabase_client = None
        self.players = []
        self.team = None
        self.coach = None
        
    def initialize(self) -> bool:
        """
        Initialize team data by fetching players and coach information.
        
        Returns:
            Boolean indicating success
        """
        try:
            # Import LineOptimizer here to avoid circular import
            from .lines import LineOptimizer
            self.line_optimizer = LineOptimizer(self.team_abbreviation)
            
            # Initialize Supabase client
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_KEY")
            self.supabase_client = create_client(url, key)
            
            # Fetch team data
            self.team = self._get_team_by_abbreviation(self.team_abbreviation)
            if not self.team:
                return False
                
            # Fetch player data
            self.players = self._get_team_players(self.team.get('id'))
            if not self.players:
                return False
                
            # Fetch coach data (placeholder)
            self.coach = self._get_coach(self.team.get('coach_id'))
            
            return True
            
        except Exception as e:
            print(f"Error initializing team formation: {e}")
            return False
            
    def _get_team_by_abbreviation(self, abbreviation: str) -> Optional[Dict[str, Any]]:
        """Get team data by abbreviation."""
        # Placeholder - would query the database in a real implementation
        team = Team.query.filter_by(abbreviation=abbreviation).first()
        return team.to_dict() if team else None
    
    def _get_team_players(self, team_id: int) -> List[Dict[str, Any]]:
        """Get all players for a team."""
        # Placeholder - would query the database in a real implementation
        players = Player.query.filter_by(team_id=team_id).all()
        return [player.to_dict() for player in players]
    
    def _get_coach(self, coach_id: Optional[int]) -> Optional[Dict[str, Any]]:
        """Get coach data."""
        # Placeholder - would query the database in a real implementation
        if not coach_id:
            return None
            
        # Dummy coach data
        return {
            "id": coach_id,
            "name": "Coach Smith",
            "offensive_style": 70,
            "defensive_style": 60,
            "preferred_formations": ["1-3-1", "2-1-2"]
        }
        
    def generate_optimal_lines(self) -> Dict[str, Any]:
        """
        Generate optimal line combinations based on player attributes and coach preferences.
        
        Returns:
            Dictionary with optimized lines, chemistry values, and team ratings
        """
        # This is a simplified placeholder implementation
        # In a real implementation, this would use complex algorithms to determine optimal lines
        
        # Categorize players by position
        forwards = [p for p in self.players if p.get('position') in ['C', 'LW', 'RW']]
        defensemen = [p for p in self.players if p.get('position') in ['LD', 'RD', 'D']]
        goalies = [p for p in self.players if p.get('position') == 'G']
        
        # Sort by overall rating
        forwards.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        defensemen.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        goalies.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Create lines
        forward_lines = []
        for i in range(0, min(12, len(forwards)), 3):
            if i + 2 < len(forwards):
                forward_lines.append(forwards[i:i+3])
            
        defense_pairs = []
        for i in range(0, min(6, len(defensemen)), 2):
            if i + 1 < len(defensemen):
                defense_pairs.append(defensemen[i:i+2])
        
        # Calculate team chemistry and ratings
        self.calculate_chemistry(forward_lines, defense_pairs)
        self.calculate_team_ratings(forward_lines, defense_pairs, goalies[0] if goalies else None)
        
        # Prepare response
        return {
            "forward_lines": forward_lines,
            "defense_pairs": defense_pairs,
            "goalies": goalies,
            "chemistry": self.team_rating,
            "team_rating": self.team_rating
        }
        
    def get_optimal_lines(self) -> Dict[str, Any]:
        """
        Get the current optimal lines without recalculating.
        
        Returns:
            Dictionary with lines, chemistry, and team ratings
        """
        if not self.team_rating:
            return self.generate_optimal_lines()
        
        # Return existing data
        return {
            'chemistry': self.team_rating,
            'team_rating': self.team_rating
        }
        
    def calculate_chemistry(self, forward_lines: List[List[Dict[str, Any]]], defense_pairs: List[List[Dict[str, Any]]]) -> None:
        """
        Calculate chemistry values for all line combinations.
        
        Args:
            forward_lines: List of forward lines
            defense_pairs: List of defense pairs
        """
        # Placeholder implementation - would use a more complex algorithm
        
        forward_chemistry = {}
        for i, line in enumerate(forward_lines):
            # Simple chemistry calculation - more complex in real implementation
            avg_rating = sum(p.get('overall_rating', 0) for p in line) / len(line)
            # Add some randomness to simulate chemistry effects
            from random import uniform
            chemistry_value = avg_rating * uniform(0.9, 1.1)
            forward_chemistry[f'line_{i+1}'] = round(chemistry_value, 1)
        
        defense_chemistry = {}
        for i, pair in enumerate(defense_pairs):
            avg_rating = sum(p.get('overall_rating', 0) for p in pair) / len(pair)
            from random import uniform
            chemistry_value = avg_rating * uniform(0.9, 1.1)
            defense_chemistry[f'pair_{i+1}'] = round(chemistry_value, 1)
        
        # Overall chemistry as weighted average
        overall = 0
        if forward_chemistry:
            overall += sum(forward_chemistry.values()) / len(forward_chemistry) * 0.6
        if defense_chemistry:
            overall += sum(defense_chemistry.values()) / len(defense_chemistry) * 0.4
        
        self.team_rating = {
            'overall': round(overall, 1),
            'forward_lines': forward_chemistry,
            'defense_pairs': defense_chemistry
        }
    
    def calculate_team_ratings(self, forward_lines: List[List[Dict[str, Any]]], defense_pairs: List[List[Dict[str, Any]]], goalie: Optional[Dict[str, Any]]) -> None:
        """
        Calculate team ratings based on player attributes and chemistry.
        
        Args:
            forward_lines: List of forward lines
            defense_pairs: List of defense pairs
            goalie: Starting goalie
        """
        # Placeholder implementation - would use a more complex algorithm
        
        # Calculate offense rating
        all_forwards = [player for line in forward_lines for player in line]
        offense_rating = 0
        if all_forwards:
            # Simple average of forward ratings with focus on offensive attributes
            offense_rating = sum(p.get('overall_rating', 0) for p in all_forwards) / len(all_forwards)
            # Apply chemistry bonus
            offense_rating *= (1 + (self.team_rating.get('overall', 0) - 75) / 200)
        
        # Calculate defense rating
        all_defensemen = [player for pair in defense_pairs for player in pair]
        defense_rating = 0
        if all_defensemen:
            # Simple average of defensemen ratings
            defense_rating = sum(p.get('overall_rating', 0) for p in all_defensemen) / len(all_defensemen)
            # Apply chemistry bonus
            defense_rating *= (1 + (self.team_rating.get('overall', 0) - 75) / 200)
        
        # Calculate goaltending rating
        goaltending_rating = goalie.get('overall_rating', 0) if goalie else 0
        
        # Calculate overall rating
        overall_rating = (offense_rating * 0.4 + defense_rating * 0.4 + goaltending_rating * 0.2)
        
        self.team_rating = {
            'overall': round(overall_rating, 1),
            'offense': round(offense_rating, 1),
            'defense': round(defense_rating, 1),
            'goaltending': round(goaltending_rating, 1)
        }
    
    def save_team_overall_to_database(self) -> bool:
        """
        Save the calculated team overall rating to the database.
        
        Returns:
            Boolean indicating success
        """
        try:
            if not self.supabase_client:
                print("Supabase client not initialized")
                return False
                
            if not self.team_rating:
                self.team_rating = self.line_optimizer.calculate_team_overall_rating()
                
            # Update the team record with the calculated ratings
            response = self.supabase_client.table('Team').update({
                'offense_rating': self.team_rating.get('offense', 0),
                'defense_rating': self.team_rating.get('defense', 0),
                'goaltending_rating': self.team_rating.get('goaltending', 0),
                'overall_rating': self.team_rating.get('overall', 0)
            }).eq('abbreviation', self.team_abbreviation).execute()
            
            if response.error:
                print(f"Error updating team rating: {response.error}")
                return False
                
            return True
            
        except Exception as e:
            print(f"Exception saving team overall: {e}")
            return False


# API endpoints that utilize the team formation service

@team_rating_bp.route("/calculate/<team_abbreviation>", methods=['GET'])
def calculate_team_rating(team_abbreviation):
    """
    Calculate team ratings based on player attributes and team chemistry.
    
    Args:
        team_abbreviation: The team abbreviation (e.g., MTL, TOR)
        
    Returns:
        Dictionary with calculated team ratings
    """
    try:
        # Initialize the team formation service
        formation = TeamFormation(team_abbreviation)
        
        # Initialize and fetch player and coach data
        init_success = formation.initialize()
        
        if not init_success:
            return jsonify({"error": f"Failed to initialize team data for {team_abbreviation}"}), 404
            
        # Generate optimal lines to get team rating
        lines_data = formation.generate_optimal_lines()
        
        # Save the calculated overall rating to the database
        save_result = formation.save_team_overall_to_database()
        
        return jsonify(lines_data.get('team_rating', {})), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error calculating team rating: {str(e)}"}), 500

@team_rating_bp.route("/all", methods=['GET'])
def get_all_team_ratings():
    """
    Get all team ratings.
    
    Returns:
        List of team ratings
    """
    try:
        # Get all team abbreviations
        # This is a placeholder - in reality, you would fetch these from the database
        team_abbreviations = [
            "ANA", "ARI", "BOS", "BUF", "CGY", "CAR", "CHI", "COL", 
            "CBJ", "DAL", "DET", "EDM", "FLA", "LAK", "MIN", "MTL", 
            "NSH", "NJD", "NYI", "NYR", "OTT", "PHI", "PIT", "SJS", 
            "SEA", "STL", "TBL", "TOR", "VAN", "VGK", "WSH", "WPG"
        ]
        
        team_ratings = []
        
        # For each team, initialize and calculate ratings
        for abbr in team_abbreviations:
            try:
                formation = TeamFormation(abbr)
                init_success = formation.initialize()
                
                if init_success:
                    # Get team rating
                    lines_data = formation.generate_optimal_lines()
                    rating = lines_data.get('team_rating', {})
                    
                    # Add team info
                    rating['team'] = abbr
                    
                    # Save the rating to the database
                    formation.save_team_overall_to_database()
                    
                    # Add to results
                    team_ratings.append(rating)
            except Exception as team_error:
                print(f"Error processing team {abbr}: {str(team_error)}")
                # Continue processing other teams
                
        # Sort by overall rating
        team_ratings.sort(key=lambda x: x.get('overall', 0), reverse=True)
        
        return jsonify(team_ratings), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error fetching team ratings: {str(e)}"}), 500

@team_rating_bp.route("/rankings", methods=['GET'])
def get_team_rankings():
    """
    Get teams sorted by overall rating.
    
    Returns:
        List of teams sorted by rating
    """
    try:
        # This would typically fetch data from a database
        # Here we're using the get_all_team_ratings function
        response = get_all_team_ratings()
        
        # Check if the response was successful
        if isinstance(response, tuple) and len(response) > 1 and response[1] == 200:
            return response
        else:
            return jsonify({"error": "Failed to get team rankings"}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Error getting team rankings: {str(e)}"}), 500 