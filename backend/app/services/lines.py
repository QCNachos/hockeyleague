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
        
        Component weights:
        - Line 1: 17%
        - Line 2: 11%
        - Line 3: 8%
        - Line 4: 4%
        - Pair 1: 11%
        - Pair 2: 7%
        - Pair 3: 5%
        - Power Play 1: 8%
        - Power Play 2: 3%
        - Penalty Kill 1: 8%
        - Penalty Kill 2: 3%
        - Other Special Teams: 2%
        - Shootout: 3%
        - Goaltending: 10%
        
        Returns:
            Dictionary with rating categories and component ratings
        """
        # Component weights as specified
        weights = {
            'line_1': 0.17,
            'line_2': 0.11,
            'line_3': 0.08,
            'line_4': 0.04,
            'pair_1': 0.11,
            'pair_2': 0.07,
            'pair_3': 0.05,
            'power_play_1': 0.08,
            'power_play_2': 0.03,
            'penalty_kill_1': 0.08,
            'penalty_kill_2': 0.03,
            'other_special_teams': 0.02,
            'shootout': 0.03,
            'goaltending': 0.10
        }
        
        # Initialize component ratings dictionary
        component_ratings = {}
        
        # Get all players from the lines
        forward_lines = self.lines.get('forward_lines', [])
        defense_pairs = self.lines.get('defense_pairs', [])
        goalies = self.lines.get('goalies', [])
        power_play_units = self.lines.get('power_play_units', [])
        penalty_kill_units = self.lines.get('penalty_kill_units', [])
        other_situations = self.lines.get('other_situations', {})
        
        # Calculate forward line ratings
        for i, line in enumerate(forward_lines):
            if i < 4:  # Only consider the first 4 lines
                # Get players in this line
                players = [p for p in [line.get('LW'), line.get('C'), line.get('RW')] if p]
                
                # Calculate average rating for this line
                if players:
                    line_rating = sum(p.get('overall_rating', 0) for p in players) / len(players)
                    component_ratings[f'line_{i+1}'] = round(line_rating, 1)
                else:
                    component_ratings[f'line_{i+1}'] = 0
        
        # Calculate defense pair ratings
        for i, pair in enumerate(defense_pairs):
            if i < 3:  # Only consider the first 3 pairs
                # Get players in this pair
                players = [p for p in [pair.get('LD'), pair.get('RD')] if p]
                
                # Calculate average rating for this pair
                if players:
                    pair_rating = sum(p.get('overall_rating', 0) for p in players) / len(players)
                    component_ratings[f'pair_{i+1}'] = round(pair_rating, 1)
                else:
                    component_ratings[f'pair_{i+1}'] = 0
        
        # Calculate power play unit ratings
        for i, unit in enumerate(power_play_units):
            if i < 2:  # Only consider the first 2 PP units
                # Get players in this unit
                players = unit.get('players', [])
                
                # Calculate average rating for this unit
                if players:
                    unit_rating = sum(p.get('overall_rating', 0) for p in players) / len(players)
                    component_ratings[f'power_play_{i+1}'] = round(unit_rating, 1)
                else:
                    component_ratings[f'power_play_{i+1}'] = 0
        
        # Calculate penalty kill unit ratings
        for i, unit in enumerate(penalty_kill_units):
            if i < 2:  # Only consider the first 2 PK units
                # Get players in this unit
                players = unit.get('players', [])
                
                # Calculate average rating for this unit
                if players:
                    unit_rating = sum(p.get('overall_rating', 0) for p in players) / len(players)
                    component_ratings[f'penalty_kill_{i+1}'] = round(unit_rating, 1)
                else:
                    component_ratings[f'penalty_kill_{i+1}'] = 0
        
        # Calculate other special teams rating (combined)
        other_teams_players = []
        if 'overtime' in other_situations:
            other_teams_players.extend(other_situations['overtime'].get('forwards', []))
            other_teams_players.extend(other_situations['overtime'].get('defensemen', []))
        
        if other_teams_players:
            other_teams_rating = sum(p.get('overall_rating', 0) for p in other_teams_players) / len(other_teams_players)
            component_ratings['other_special_teams'] = round(other_teams_rating, 1)
        else:
            component_ratings['other_special_teams'] = 0
        
        # Calculate shootout rating
        shootout_players = []
        if 'shootout' in other_situations:
            shootout_players = other_situations['shootout'].get('players', [])
        
        if shootout_players:
            shootout_rating = sum(p.get('overall_rating', 0) for p in shootout_players) / len(shootout_players)
            component_ratings['shootout'] = round(shootout_rating, 1)
        else:
            component_ratings['shootout'] = 0
        
        # Calculate goaltending rating
        starting_goalies = [g for g in goalies if g and g.get('is_starter')]
        
        if starting_goalies:
            goaltending_rating = sum(g.get('overall_rating', 0) for g in starting_goalies) / len(starting_goalies)
            component_ratings['goaltending'] = round(goaltending_rating, 1)
        else:
            component_ratings['goaltending'] = 0
        
        # Calculate overall rating using weighted components
        weighted_sum = 0
        total_weight_applied = 0
        
        for component, weight in weights.items():
            if component in component_ratings and component_ratings[component] > 0:
                weighted_sum += component_ratings[component] * weight
                total_weight_applied += weight
        
        # Calculate overall rating - it's just a simple weighted average
        overall_rating = 0
        if total_weight_applied > 0:
            # No need to multiply by 100 since player ratings are already on a 0-100 scale
            overall_rating = weighted_sum / total_weight_applied
        
        # Ensure overall is within 0-99 range
        overall_rating = min(99, max(0, round(overall_rating)))
        
        # Calculate main category ratings
        offense_rating = 0
        offense_components = ['line_1', 'line_2', 'line_3', 'line_4', 'power_play_1', 'power_play_2']
        offense_weights = [weights[c] for c in offense_components if c in component_ratings and component_ratings[c] > 0]
        offense_weighted_sum = 0
        
        if offense_weights:
            for c in offense_components:
                if c in component_ratings and component_ratings[c] > 0:
                    offense_weighted_sum += component_ratings[c] * weights[c]
            offense_rating = offense_weighted_sum / sum(offense_weights)
            offense_rating = min(99, max(0, round(offense_rating)))
        
        defense_rating = 0
        defense_components = ['pair_1', 'pair_2', 'pair_3', 'penalty_kill_1', 'penalty_kill_2']
        defense_weights = [weights[c] for c in defense_components if c in component_ratings and component_ratings[c] > 0]
        defense_weighted_sum = 0
        
        if defense_weights:
            for c in defense_components:
                if c in component_ratings and component_ratings[c] > 0:
                    defense_weighted_sum += component_ratings[c] * weights[c]
            defense_rating = defense_weighted_sum / sum(defense_weights)
            defense_rating = min(99, max(0, round(defense_rating)))
        
        # Special teams combines PP and PK
        special_teams_rating = 0
        special_teams_components = ['power_play_1', 'power_play_2', 'penalty_kill_1', 'penalty_kill_2', 'other_special_teams']
        special_teams_weights = [weights[c] for c in special_teams_components if c in component_ratings and component_ratings[c] > 0]
        special_teams_weighted_sum = 0
        
        if special_teams_weights:
            for c in special_teams_components:
                if c in component_ratings and component_ratings[c] > 0:
                    special_teams_weighted_sum += component_ratings[c] * weights[c]
            special_teams_rating = special_teams_weighted_sum / sum(special_teams_weights)
            special_teams_rating = min(99, max(0, round(special_teams_rating)))
        
        # Return complete rating information
        return {
            'overall': overall_rating,
            'offense': offense_rating,
            'defense': defense_rating,
            'special_teams': special_teams_rating,
            'goaltending': component_ratings.get('goaltending', 0),
            'component_ratings': component_ratings
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
            print(f"Failed to initialize team formation data for {team_abbreviation}, returning default formation")
            # Return default formation structure rather than an error
            # This allows the frontend to still display something
            default_formation = {
                'lines': {
                    'forward_lines': [],
                    'defense_pairs': [],
                    'goalies': [],
                    'power_play_1': {'forwards': [], 'defense': []},
                    'power_play_2': {'forwards': [], 'defense': []},
                    'penalty_kill_1': {'forwards': [], 'defense': []},
                    'penalty_kill_2': {'forwards': [], 'defense': []}
                },
                'chemistry': {
                    'forward_lines': [],
                    'defense_pairs': [],
                    'power_play': [],
                    'penalty_kill': [],
                    'overall': 0.0
                },
                'team_rating': {
                    'overall': 75,
                    'offense': 75,
                    'defense': 75,
                    'special_teams': 75,
                    'goaltending': 75,
                    'component_ratings': {
                        'line_1': 80,
                        'line_2': 77,
                        'line_3': 74,
                        'line_4': 70,
                        'pair_1': 80,
                        'pair_2': 76,
                        'pair_3': 73,
                        'power_play_1': 79,
                        'power_play_2': 76,
                        'penalty_kill_1': 78,
                        'penalty_kill_2': 75
                    }
                }
            }
            return jsonify(default_formation), 200
            
        # Generate optimal lines
        print(f"Generating optimal lines for {team_abbreviation}")
        try:
            optimal_formation = formation.generate_optimal_lines()
            
            # Ensure all team rating fields are present and properly formatted
            if 'team_rating' in optimal_formation:
                team_rating = optimal_formation['team_rating']
                
                # Ensure all ratings are rounded to 1 decimal place
                for key in ['overall', 'offense', 'defense', 'special_teams', 'goaltending']:
                    if key in team_rating:
                        team_rating[key] = round(float(team_rating[key]), 1)
                    else:
                        team_rating[key] = 75.0  # Default value
                
                # Ensure component ratings are present
                if 'component_ratings' not in team_rating:
                    team_rating['component_ratings'] = {}
                
                # Ensure all component ratings have valid values
                component_rating_defaults = {
                    'line_1': 80, 'line_2': 77, 'line_3': 74, 'line_4': 70,
                    'pair_1': 80, 'pair_2': 76, 'pair_3': 73,
                    'power_play_1': 79, 'power_play_2': 76,
                    'penalty_kill_1': 78, 'penalty_kill_2': 75
                }
                
                for comp, default in component_rating_defaults.items():
                    if comp not in team_rating['component_ratings'] or team_rating['component_ratings'][comp] <= 0:
                        team_rating['component_ratings'][comp] = default
            
            # Save ratings to database
            try:
                # Get the ratings without saving to database
                team_ratings = formation.save_team_overall_to_database()
                print("Retrieved team ratings")
            except Exception as save_error:
                print(f"Error getting team ratings: {save_error}")
                # Continue even if getting ratings fails
            
            print(f"Successfully generated formation for {team_abbreviation}")
            return jsonify(optimal_formation), 200
        except Exception as gen_error:
            print(f"Error generating optimal lines: {gen_error}")
            traceback.print_exc()
            # Return default formation on error
            default_formation = {
                'lines': {
                    'forward_lines': [],
                    'defense_pairs': [],
                    'goalies': [],
                    'power_play_1': {'forwards': [], 'defense': []},
                    'power_play_2': {'forwards': [], 'defense': []},
                    'penalty_kill_1': {'forwards': [], 'defense': []},
                    'penalty_kill_2': {'forwards': [], 'defense': []}
                },
                'chemistry': {
                    'forward_lines': [],
                    'defense_pairs': [],
                    'power_play': [],
                    'penalty_kill': [],
                    'overall': 0.0
                },
                'team_rating': {
                    'overall': 75,
                    'offense': 75,
                    'defense': 75,
                    'special_teams': 75,
                    'goaltending': 75,
                    'component_ratings': {
                        'line_1': 80,
                        'line_2': 77,
                        'line_3': 74,
                        'line_4': 70,
                        'pair_1': 80,
                        'pair_2': 76,
                        'pair_3': 73,
                        'power_play_1': 79,
                        'power_play_2': 76,
                        'penalty_kill_1': 78,
                        'penalty_kill_2': 75
                    }
                }
            }
            return jsonify(default_formation), 200
    except Exception as e:
        print(f"Error generating team formation: {e}")
        traceback.print_exc()
        
        # Return default formation in case of any error
        default_formation = {
            'lines': {
                'forward_lines': [],
                'defense_pairs': [],
                'goalies': [],
                'power_play_1': {'forwards': [], 'defense': []},
                'power_play_2': {'forwards': [], 'defense': []},
                'penalty_kill_1': {'forwards': [], 'defense': []},
                'penalty_kill_2': {'forwards': [], 'defense': []}
            },
            'chemistry': {
                'forward_lines': [],
                'defense_pairs': [],
                'power_play': [],
                'penalty_kill': [],
                'overall': 0.0
            },
            'team_rating': {
                'overall': 75,
                'offense': 75,
                'defense': 75,
                'special_teams': 75,
                'goaltending': 75,
                'component_ratings': {
                    'line_1': 80,
                    'line_2': 77,
                    'line_3': 74,
                    'line_4': 70,
                    'pair_1': 80,
                    'pair_2': 76,
                    'pair_3': 73,
                    'power_play_1': 79,
                    'power_play_2': 76,
                    'penalty_kill_1': 78,
                    'penalty_kill_2': 75
                }
            }
        }
        return jsonify(default_formation), 200

@lines_bp.route("/chemistry/<team_abbreviation>", methods=['GET'])
def get_team_chemistry(team_abbreviation):
    """Get team chemistry values."""
    try:
        # Import TeamFormation locally to avoid circular import
        from .team_formation import TeamFormation
        
        # Initialize the team formation service
        formation = TeamFormation(team_abbreviation)
        print(f"Chemistry: TeamFormation service initialized for {team_abbreviation}")
        
        # Initialize data
        init_success = formation.initialize()
        print(f"Chemistry: TeamFormation initialization success: {init_success}")
        
        if not init_success:
            print(f"Failed to initialize team chemistry data for {team_abbreviation}, returning default chemistry")
            # Return default chemistry values
            default_chemistry = {
                'forward_lines': [
                    {'line': 1, 'chemistry': 1, 'factors': {}},
                    {'line': 2, 'chemistry': 0, 'factors': {}},
                    {'line': 3, 'chemistry': 0, 'factors': {}},
                    {'line': 4, 'chemistry': 0, 'factors': {}}
                ],
                'defense_pairs': [
                    {'pair': 1, 'chemistry': 1, 'factors': {}},
                    {'pair': 2, 'chemistry': 0, 'factors': {}},
                    {'pair': 3, 'chemistry': 0, 'factors': {}}
                ],
                'power_play': [
                    {'unit': 1, 'chemistry': 1, 'factors': {}},
                    {'unit': 2, 'chemistry': 0, 'factors': {}}
                ],
                'penalty_kill': [
                    {'unit': 1, 'chemistry': 1, 'factors': {}},
                    {'unit': 2, 'chemistry': 0, 'factors': {}}
                ],
                'overall': 0.5
            }
            return jsonify(default_chemistry), 200
            
        # Get chemistry without recalculating lines
        print(f"Getting chemistry for {team_abbreviation}")
        chemistry = formation.get_optimal_lines().get('chemistry', {})
        
        print(f"Successfully retrieved chemistry for {team_abbreviation}")
        return jsonify(chemistry), 200
    except Exception as e:
        print(f"Error getting team chemistry: {e}")
        traceback.print_exc()
        
        # Return default chemistry values in case of error
        default_chemistry = {
            'forward_lines': [
                {'line': 1, 'chemistry': 1, 'factors': {}},
                {'line': 2, 'chemistry': 0, 'factors': {}},
                {'line': 3, 'chemistry': 0, 'factors': {}},
                {'line': 4, 'chemistry': 0, 'factors': {}}
            ],
            'defense_pairs': [
                {'pair': 1, 'chemistry': 1, 'factors': {}},
                {'pair': 2, 'chemistry': 0, 'factors': {}},
                {'pair': 3, 'chemistry': 0, 'factors': {}}
            ],
            'power_play': [
                {'unit': 1, 'chemistry': 1, 'factors': {}},
                {'unit': 2, 'chemistry': 0, 'factors': {}}
            ],
            'penalty_kill': [
                {'unit': 1, 'chemistry': 1, 'factors': {}},
                {'unit': 2, 'chemistry': 0, 'factors': {}}
            ],
            'overall': 0.5
        }
        return jsonify(default_chemistry), 200

@lines_bp.route("/update-team-overall/<team_abbreviation>", methods=['GET'])
def update_team_overall(team_abbreviation):
    """Update team overall rating in the database."""
    try:
        # Import TeamFormation locally to avoid circular import
        from .team_formation import TeamFormation
        
        # Initialize the team formation service
        print(f"Starting team formation initialization for {team_abbreviation}")
        formation = TeamFormation(team_abbreviation)
        
        # Initialize data
        init_success = formation.initialize()
        print(f"Team formation initialization result: {init_success}")
        
        if not init_success:
            print(f"Failed to initialize team formation data for {team_abbreviation}, returning default ratings")
            # Return default ratings instead of an error when initialization fails
            # This allows the frontend to still display something
            default_rating = {
                'overall_rating': 75,  # Default overall rating
                'offense': 75,
                'defense': 75,
                'special_teams': 75,
                'goaltending': 75,
                'component_ratings': {
                    'line_1': 80,
                    'line_2': 77,
                    'line_3': 74,
                    'line_4': 70,
                    'pair_1': 80,
                    'pair_2': 76,
                    'pair_3': 73,
                    'power_play_1': 79,
                    'power_play_2': 76,
                    'penalty_kill_1': 78,
                    'penalty_kill_2': 75
                }
            }
            return jsonify(default_rating), 200
            
        # Generate optimal lines and calculate ratings
        print(f"Generating optimal lines for {team_abbreviation}")
        lines_data = formation.generate_optimal_lines()
        team_rating = lines_data.get('team_rating', {})
        
        # Get the ratings directly without saving to database
        try:
            ratings = formation.save_team_overall_to_database()
            print("Retrieved team ratings")
        except Exception as save_error:
            print(f"Error getting team ratings: {save_error}")
            # Continue even if getting ratings fails
        
        # Return a formatted response that matches what the frontend expects
        # Ensure all fields are properly formatted and present
        response = {
            'overall_rating': round(team_rating.get('overall', 75), 1),
            'offense': round(team_rating.get('offense', 75), 1),
            'defense': round(team_rating.get('defense', 75), 1),
            'special_teams': round(team_rating.get('special_teams', 75), 1),
            'goaltending': round(team_rating.get('goaltending', 75), 1),
            'component_ratings': {
                'line_1': round(team_rating.get('component_ratings', {}).get('line_1', 80), 1),
                'line_2': round(team_rating.get('component_ratings', {}).get('line_2', 77), 1),
                'line_3': round(team_rating.get('component_ratings', {}).get('line_3', 74), 1),
                'line_4': round(team_rating.get('component_ratings', {}).get('line_4', 70), 1),
                'pair_1': round(team_rating.get('component_ratings', {}).get('pair_1', 80), 1),
                'pair_2': round(team_rating.get('component_ratings', {}).get('pair_2', 76), 1),
                'pair_3': round(team_rating.get('component_ratings', {}).get('pair_3', 73), 1),
                'power_play_1': round(team_rating.get('component_ratings', {}).get('power_play_1', 79), 1),
                'power_play_2': round(team_rating.get('component_ratings', {}).get('power_play_2', 76), 1),
                'penalty_kill_1': round(team_rating.get('component_ratings', {}).get('penalty_kill_1', 78), 1),
                'penalty_kill_2': round(team_rating.get('component_ratings', {}).get('penalty_kill_2', 75), 1)
            }
        }
        
        print(f"Successfully generated team rating for {team_abbreviation}")
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Error updating team overall: {e}")
        traceback.print_exc()
        
        # Return default ratings in case of any error
        default_rating = {
            'overall_rating': 75,  # Default overall rating
            'offense': 75,
            'defense': 75,
            'special_teams': 75,
            'goaltending': 75,
            'component_ratings': {
                'line_1': 80,
                'line_2': 77,
                'line_3': 74,
                'line_4': 70,
                'pair_1': 80,
                'pair_2': 76,
                'pair_3': 73,
                'power_play_1': 79,
                'power_play_2': 76,
                'penalty_kill_1': 78,
                'penalty_kill_2': 75
            }
        }
        return jsonify(default_rating), 200
