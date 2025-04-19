from typing import Dict, List, Any, Optional, Tuple
import os
from supabase import create_client, Client
from flask import Blueprint, jsonify, request
import traceback

# Create a blueprint for lines endpoints
lines_bp = Blueprint('lines', __name__)

class LineOptimizer:
    """
    Optimizes line combinations based on player attributes and position fits.
    """
    
    def __init__(self, team_abbreviation: str):
        """
        Initialize the line optimizer.
        
        Args:
            team_abbreviation: The abbreviation of the team
        """
        self.team_abbreviation = team_abbreviation
        self.players = []
        self.forwards = []
        self.defensemen = []
        self.goalies = []
        self.lines = {}
        
    def fetch_team_players(self) -> bool:
        """
        Fetch all players for the team from the database.
        
        Returns:
            Boolean indicating success
        """
        try:
            # Initialize Supabase client
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_KEY")
            supabase: Client = create_client(url, key)
            
            # Fetch players for the team
            response = supabase.table('Player').select('*').eq('team', self.team_abbreviation).execute()
            
            if response.error:
                print(f"Error fetching players: {response.error}")
                return False
                
            # Store players and sort by position
            self.players = response.data
            
            # Categorize players by position
            self.forwards = [p for p in self.players if p.get('position_primary') in ['LW', 'C', 'RW']]
            self.defensemen = [p for p in self.players if p.get('position_primary') in ['LD', 'RD']]
            self.goalies = [p for p in self.players if p.get('position_primary') in ['G', 'Goalie']]
            
            # Sort by overall rating
            self.forwards.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
            self.defensemen.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
            self.goalies.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
            
            return True
            
        except Exception as e:
            print(f"Exception fetching team players: {e}")
            return False
            
    def generate_all_lines(self) -> Dict[str, Any]:
        """
        Generate all line combinations for the team.
        
        Returns:
            Dictionary with all line combinations
        """
        # Create empty team composition dictionary
        lines = {
            'forward_lines': [],
            'defense_pairs': [],
            'goalies': [],
            'power_play_units': [],
            'penalty_kill_units': [],
            'other_situations': {}
        }
        
        # Generate forward lines respecting positions
        lines['forward_lines'] = self._generate_forward_lines()
        
        # Generate defense pairs
        lines['defense_pairs'] = self._generate_defense_pairs()
        
        # Assign goalies
        lines['goalies'] = self._assign_goalies()
        
        # Generate special teams
        lines['power_play_units'] = self._generate_power_play_units()
        lines['penalty_kill_units'] = self._generate_penalty_kill_units()
        
        # Generate other situations
        lines['other_situations'] = self._generate_other_situations()
        
        # Store the line combinations
        self.lines = lines
        
        return lines
        
    def _generate_forward_lines(self) -> List[Dict[str, Any]]:
        """
        Generate optimal forward lines respecting player positions.
        
        Returns:
            List of line dictionaries with LW, C, RW positions
        """
        # Group forwards by position
        lw_players = [p for p in self.forwards if p.get('position_primary') == 'LW']
        c_players = [p for p in self.forwards if p.get('position_primary') == 'C']
        rw_players = [p for p in self.forwards if p.get('position_primary') == 'RW']
        
        # Sort by overall rating
        lw_players.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        c_players.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        rw_players.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Create up to 4 lines
        lines = []
        for i in range(4):
            line = {
                'LW': lw_players[i] if i < len(lw_players) else None,
                'C': c_players[i] if i < len(c_players) else None,
                'RW': rw_players[i] if i < len(rw_players) else None,
                'line_number': i + 1
            }
            lines.append(line)
            
        return lines
        
    def _generate_defense_pairs(self) -> List[Dict[str, Any]]:
        """
        Generate optimal defense pairs respecting player positions.
        
        Returns:
            List of pair dictionaries with LD, RD positions
        """
        # Group defensemen by position
        ld_players = [p for p in self.defensemen if p.get('position_primary') == 'LD']
        rd_players = [p for p in self.defensemen if p.get('position_primary') == 'RD']
        
        # Sort by overall rating
        ld_players.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        rd_players.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Create up to 3 pairs
        pairs = []
        for i in range(3):
            pair = {
                'LD': ld_players[i] if i < len(ld_players) else None,
                'RD': rd_players[i] if i < len(rd_players) else None,
                'pair_number': i + 1
            }
            pairs.append(pair)
            
        return pairs
        
    def _assign_goalies(self) -> List[Dict[str, Any]]:
        """
        Assign starting and backup goalies.
        
        Returns:
            List of goalies with starter designation
        """
        assigned_goalies = []
        
        for i, goalie in enumerate(self.goalies[:2]):
            if goalie:
                assigned_goalie = goalie.copy()
                assigned_goalie['is_starter'] = (i == 0)
                assigned_goalie['split'] = 65 if i == 0 else 35  # Default splits
                assigned_goalies.append(assigned_goalie)
                
        return assigned_goalies
        
    def _generate_power_play_units(self) -> List[Dict[str, Any]]:
        """
        Generate power play units.
        
        Returns:
            List of power play units
        """
        pp_units = []
        
        # First unit: top 3 forwards, top 2 defensemen
        if len(self.forwards) >= 3 and len(self.defensemen) >= 2:
            pp_units.append({
                'unit_number': 1,
                'players': self.forwards[:3] + self.defensemen[:2]
            })
            
        # Second unit: next 3 forwards, next 2 defensemen
        if len(self.forwards) >= 6 and len(self.defensemen) >= 4:
            pp_units.append({
                'unit_number': 2,
                'players': self.forwards[3:6] + self.defensemen[2:4]
            })
            
        return pp_units
        
    def _generate_penalty_kill_units(self) -> List[Dict[str, Any]]:
        """
        Generate penalty kill units.
        
        Returns:
            List of penalty kill units
        """
        pk_units = []
        
        # Sort forwards and defensemen by defensive attributes
        def_forwards = sorted(self.forwards, key=lambda p: p.get('defensive_ability', 0), reverse=True)
        
        # First unit: top 2 defensive forwards, top 2 defensemen
        if len(def_forwards) >= 2 and len(self.defensemen) >= 2:
            pk_units.append({
                'unit_number': 1,
                'players': def_forwards[:2] + self.defensemen[:2]
            })
            
        # Second unit: next 2 defensive forwards, next 2 defensemen
        if len(def_forwards) >= 4 and len(self.defensemen) >= 4:
            pk_units.append({
                'unit_number': 2,
                'players': def_forwards[2:4] + self.defensemen[2:4]
            })
            
        return pk_units
        
    def _generate_other_situations(self) -> Dict[str, Any]:
        """
        Generate line combinations for other situations.
        
        Returns:
            Dictionary with specialized line combinations
        """
        other_situations = {}
        
        # Overtime line: best forwards and defensemen
        if len(self.forwards) >= 2 and len(self.defensemen) >= 1:
            other_situations['overtime'] = {
                'forwards': self.forwards[:2],
                'defensemen': self.defensemen[:1]
            }
            
        # Shootout: best forwards by shooting/deking ability
        # In a real implementation, would sort by specific shootout-relevant attributes
        if len(self.forwards) >= 3:
            other_situations['shootout'] = {
                'players': self.forwards[:3]
            }
            
        return other_situations
        
    def save_line_preset(self, preset_name: str) -> bool:
        """
        Save the current line combinations as a preset.
        
        Args:
            preset_name: Name of the preset to save
            
        Returns:
            Boolean indicating success
        """
        # This is a placeholder implementation
        # In a real implementation, would save to database
        print(f"Would save preset {preset_name} for team {self.team_abbreviation}")
        return True
        
    def load_line_preset(self, preset_name: str) -> bool:
        """
        Load a previously saved line preset.
        
        Args:
            preset_name: Name of the preset to load
            
        Returns:
            Boolean indicating success
        """
        # This is a placeholder implementation
        # In a real implementation, would load from database
        print(f"Would load preset {preset_name} for team {self.team_abbreviation}")
        return True
        
    def calculate_team_overall_rating(self) -> Dict[str, float]:
        """
        Calculate the team's overall rating based on player attributes.
        
        Returns:
            Dictionary with rating categories
        """
        # Simple weighted average of player ratings
        # In a real implementation, would be much more complex
        
        # Get all players currently on lines
        forwards = []
        for line in self.lines.get('forward_lines', []):
            forwards.extend([p for p in [line.get('LW'), line.get('C'), line.get('RW')] if p])
            
        defensemen = []
        for pair in self.lines.get('defense_pairs', []):
            defensemen.extend([p for p in [pair.get('LD'), pair.get('RD')] if p])
            
        goalies = [g for g in self.lines.get('goalies', []) if g and g.get('is_starter')]
        
        # Calculate offense rating
        offense_rating = 0
        if forwards:
            offense = sum(f.get('overall_rating', 0) for f in forwards) / len(forwards)
            offense_rating = min(99, round(offense))
            
        # Calculate defense rating
        defense_rating = 0
        if defensemen:
            defense = sum(d.get('overall_rating', 0) for d in defensemen) / len(defensemen)
            defense_rating = min(99, round(defense))
            
        # Calculate goaltending rating
        goaltending_rating = 0
        if goalies:
            goaltending = sum(g.get('overall_rating', 0) for g in goalies) / len(goalies)
            goaltending_rating = min(99, round(goaltending))
            
        # Calculate overall rating (weighted average)
        overall_rating = round((offense_rating * 0.4 + defense_rating * 0.4 + goaltending_rating * 0.2))
        
        return {
            'overall': overall_rating,
            'offense': offense_rating,
            'defense': defense_rating,
            'goaltending': goaltending_rating
        }


# API endpoints that utilize the line optimizer service

@lines_bp.route("/formation/<team_abbreviation>", methods=['GET'])
def get_team_formation(team_abbreviation):
    """Get team formation including lines, chemistry, and ratings."""
    try:
        # Import TeamFormation locally to avoid circular import
        from .team_formation import TeamFormation
        
        # Initialize the team formation service
        formation = TeamFormation(team_abbreviation)
        print(f"TeamFormation service initialized for {team_abbreviation}")
        
        # Initialize data
        init_success = formation.initialize()
        print(f"TeamFormation initialization success: {init_success}")
        
        if not init_success:
            return jsonify({"error": "Failed to initialize team formation data"}), 500
            
        # Generate optimal lines
        optimal_formation = formation.generate_optimal_lines()
        
        return jsonify(optimal_formation), 200
    except Exception as e:
        print(f"Error generating team formation: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@lines_bp.route("/chemistry/<team_abbreviation>", methods=['GET'])
def get_team_chemistry(team_abbreviation):
    """Get team chemistry values."""
    try:
        # Import TeamFormation locally to avoid circular import
        from .team_formation import TeamFormation
        
        # Initialize the team formation service
        formation = TeamFormation(team_abbreviation)
        
        # Initialize data
        init_success = formation.initialize()
        if not init_success:
            return jsonify({"error": "Failed to initialize team formation data"}), 500
            
        # Get chemistry without recalculating lines
        chemistry = formation.get_optimal_lines().get('chemistry', {})
        
        return jsonify(chemistry), 200
    except Exception as e:
        print(f"Error getting team chemistry: {e}")
        return jsonify({"error": str(e)}), 500

@lines_bp.route("/update-team-overall/<team_abbreviation>", methods=['GET'])
def update_team_overall(team_abbreviation):
    """Update team overall rating in the database."""
    try:
        # Import TeamFormation locally to avoid circular import
        from .team_formation import TeamFormation
        
        # Initialize the team formation service
        formation = TeamFormation(team_abbreviation)
        
        # Initialize data
        init_success = formation.initialize()
        if not init_success:
            return jsonify({"error": "Failed to initialize team formation data"}), 500
            
        # Generate optimal lines and calculate ratings
        formation.generate_optimal_lines()
        
        # Save to database
        save_success = formation.save_team_overall_to_database()
        
        if save_success:
            return jsonify({"message": f"Updated team overall rating for {team_abbreviation}"}), 200
        else:
            return jsonify({"error": "Failed to save team rating to database"}), 500
    
    except Exception as e:
        print(f"Error updating team overall: {e}")
        return jsonify({"error": str(e)}), 500
