from typing import Dict, List, Any, Tuple, Optional
import copy
import os
from supabase import create_client, Client
from flask import Blueprint, jsonify, request
import traceback
from ..models.player import Player
from ..models.team import Team
from ..extensions import db
from ..database import create_supabase_client
from .chemistry import ChemistryCalculator
from .coach import CoachStrategy
from .lines import LineOptimizer
from collections import namedtuple

# Create a blueprint for team rating endpoints
team_rating_bp = Blueprint('team_rating', __name__)

# Create a blueprint for game endpoints
game_bp = Blueprint('game', __name__)

class TeamFormation:
    """
    Integrates line optimization, player chemistry, and coach strategies
    to create the most effective team formations.
    """
    
    def __init__(self, team_abbreviation: str, supabase_client=None, debug=False):
        """
        Initialize the team formation service.
        
        Args:
            team_abbreviation: The team abbreviation (e.g. 'TOR', 'MTL')
            supabase_client: The Supabase client to use. If None, one will be created.
            debug: Whether to run in debug mode with additional logging
        """
        self.team_abbreviation = team_abbreviation
        self.supabase_client = supabase_client or create_supabase_client()
        self.chemistry_calculator = ChemistryCalculator()
        self.coach_strategy = CoachStrategy()
        self.roster = []
        self.optimal_lines = None
        self.current_lines = None
        self.team_rating = None
        self.debug = debug
        
        # Initialize component systems
        self.line_optimizer = LineOptimizer(team_abbreviation)
        
        # Cache for calculated chemistry values
        self.chemistry_cache = {}
        
        # Current lines and optimal lines
        self.current_lines = {}
        self.optimal_lines = {}
        
        # Team overall rating cache
        self.team_rating = {}
        
        # Database connection
        self.players = []
        self.team = None
    
    def initialize(self) -> bool:
        """
        Initialize the team formation service.
        
        Returns:
            Boolean indicating success
        """
        try:
            print(f"\n=== INITIALIZING TEAM FORMATION FOR {self.team_abbreviation} ===")
            print(f"Debug mode: {self.debug}")
            
            # Create Supabase client if not provided
            if not self.supabase_client:
                try:
                    print("Creating Supabase client")
                    self.supabase_client = create_supabase_client()
                    print(f"Supabase client created: {bool(self.supabase_client)}")
                except Exception as e:
                    print(f"Error creating Supabase client: {e}")
                    traceback.print_exc()
            
            # Get team data
            self.team_data = self._get_team_by_abbreviation(self.team_abbreviation)
            if not self.team_data:
                print(f"Could not find team with abbreviation: {self.team_abbreviation}")
                return False
                
            # Get team ID
            self.team_id = self.team_data.get('id')
            print(f"Team ID: {self.team_id}")
            
            if not self.team_id:
                print(f"Team data doesn't have an ID field: {self.team_data}")
                # Generate a dummy ID for testing if needed
                self.team_id = 999
                
            # Get coach data
            coach_id = self.team_data.get('coach_id')
            self.coach_data = self._get_coach(coach_id)
            
            # Initialize coach strategy
            if self.coach_data:
                print(f"Coach data: {self.coach_data}")
                self.coach_strategy = CoachStrategy(self.coach_data)
            else:
                print("No coach data found, using default strategy")
                self.coach_strategy = None
            
            # Get team players and sort by position
            print(f"Getting team players for team_id: {self.team_id}")
            self.roster = self._get_team_players(self.team_id)
            
            if self.debug:
                print(f"Roster has {len(self.roster)} players")
                if len(self.roster) > 0:
                    sample_player = self.roster[0]
                    print(f"Sample player: {sample_player}")
                    if isinstance(sample_player, dict):
                        print(f"Sample player fields: {list(sample_player.keys())}")
            
            if not self.roster:
                print("Failed to get team players")
                return False
                
            # Sort the roster into positions
            self.forwards = []
            self.defensemen = []
            self.goalies = []
            
            for player in self.roster:
                if isinstance(player, dict):
                    position = player.get('position_primary', player.get('position', ''))
                else:
                    position = getattr(player, 'position_primary', getattr(player, 'position', ''))
                    
                if position in ['LW', 'C', 'RW']:
                    self.forwards.append(player)
                elif position in ['LD', 'RD']:
                    self.defensemen.append(player)
                elif position in ['G', 'Goalie']:
                    self.goalies.append(player)
            
            # Sort by rating
            self.forwards.sort(key=lambda p: self.get_player_rating(p), reverse=True)
            self.defensemen.sort(key=lambda p: self.get_player_rating(p), reverse=True)
            self.goalies.sort(key=lambda p: self.get_player_rating(p), reverse=True)
            
            if self.debug:
                print(f"Sorted {len(self.forwards)} forwards, {len(self.defensemen)} defensemen, {len(self.goalies)} goalies")
                
                # Print top players from each position with their ratings
                for i, p in enumerate(self.forwards[:3]):
                    name = self._get_player_name(p)
                    position = self._get_player_position(p)
                    rating = self.get_player_rating(p)
                    print(f"Forward #{i+1}: {name} ({position}) - Rating: {rating}")
                
                for i, p in enumerate(self.defensemen[:2]):
                    name = self._get_player_name(p)
                    position = self._get_player_position(p)
                    rating = self.get_player_rating(p)
                    print(f"Defenseman #{i+1}: {name} ({position}) - Rating: {rating}")
                
                for i, p in enumerate(self.goalies[:1]):
                    name = self._get_player_name(p)
                    rating = self.get_player_rating(p)
                    print(f"Goalie #{i+1}: {name} - Rating: {rating}")
            
            # Initialize chemistry calculator
            self.chemistry_calculator = ChemistryCalculator(self.forwards, self.defensemen, self.coach_data)
            
            # Initialize line optimizer
            self.line_optimizer = LineOptimizer(self.team_abbreviation)
            self.line_optimizer.forwards = self.forwards
            self.line_optimizer.defensemen = self.defensemen
            self.line_optimizer.goalies = self.goalies
            
            # Initialize chemistry and team_rating
            self.chemistry = {}
            self.chemistry_cache = {}
            self.team_rating = {}
            
            print(f"Team formation initialization successful for {self.team_abbreviation}\n")
            return True
            
        except Exception as e:
            print(f"Error in TeamFormation.initialize: {e}")
            traceback.print_exc()
            return False

    def _get_team_by_abbreviation(self, abbreviation: str) -> Optional[Dict[str, Any]]:
        """Get team data by abbreviation."""
        try:
            # Using SQLAlchemy to query the database
            team = Team.query.filter_by(abbreviation=abbreviation).first()
            
            if team:
                return team.to_dict()
            else:
                print(f"No team found with abbreviation: {abbreviation}")
                
                # If no team is found via SQLAlchemy, try Supabase directly
                if self.supabase_client:
                    try:
                        print(f"Attempting to fetch team from Supabase for abbreviation: {abbreviation}")
                        response = self.supabase_client.table('Team').select('*').eq('abbreviation', abbreviation).execute()
                        
                        if not response.error and response.data and len(response.data) > 0:
                            print(f"Found team in Supabase: {response.data[0].get('name')}")
                            return response.data[0]
                        else:
                            print(f"Team not found in Supabase either: {abbreviation}")
                    except Exception as supabase_error:
                        print(f"Error fetching team from Supabase: {supabase_error}")
                
                # Return dummy data for testing purposes
                print(f"Creating dummy team for: {abbreviation}")
                return {
                    "id": 1,
                    "name": f"{abbreviation} Team",
                    "abbreviation": abbreviation,
                    "city": "City",
                    "logo_url": "https://example.com/logo.png",
                    "primary_color": "#FF0000",
                    "secondary_color": "#0000FF",
                    "coach_id": None,
                    "overall_rating": 75
                }
        except Exception as e:
            print(f"Error in _get_team_by_abbreviation: {e}")
            traceback.print_exc()
            
            # Return dummy data in case of error
            return {
                "id": 1,
                "name": f"{abbreviation} Team",
                "abbreviation": abbreviation,
                "city": "City",
                "logo_url": "https://example.com/logo.png",
                "primary_color": "#FF0000",
                "secondary_color": "#0000FF",
                "coach_id": None,
                "overall_rating": 75
            }
    
    def _get_team_players(self, team_id: int) -> List[Dict[str, Any]]:
        """Get all players for a team."""
        try:
            # Using SQLAlchemy to query the database
            players = Player.query.filter_by(team_id=team_id).all()
            player_list = [player.to_dict() for player in players]
            
            # If we found players using SQLAlchemy, return them
            if player_list:
                print(f"Found {len(player_list)} players using SQLAlchemy for team_id: {team_id}")
                return player_list
                
            # If no players found via SQLAlchemy, try Supabase directly
            if self.supabase_client:
                try:
                    print(f"Attempting to fetch players from Supabase for team_id: {team_id}")
                    
                    # Try first by team abbreviation as that seems to be how frontend data is structured
                    print(f"Trying to fetch players with team abbreviation: {self.team_abbreviation}")
                    response = self.supabase_client.table('Player').select('*').eq('team', self.team_abbreviation).execute()
                    
                    if not response.error and response.data and len(response.data) > 0:
                        print(f"Found {len(response.data)} players in Supabase using team abbreviation")
                        if self.debug:
                            print(f"First player: {response.data[0]}")
                            print(f"Available fields: {list(response.data[0].keys())}")
                            print(f"Overall rating field value: {response.data[0].get('overall_rating')}")
                        return response.data
                    else:
                        print(f"No players found with team abbreviation '{self.team_abbreviation}'. Trying with team_id")
                        response = self.supabase_client.table('Player').select('*').eq('team_id', team_id).execute()
                        
                        if not response.error and response.data and len(response.data) > 0:
                            print(f"Found {len(response.data)} players in Supabase using team_id")
                            return response.data
                        else:
                            print(f"No players found with team_id {team_id} either")
                            # Try a broad search to see what's available
                            try:
                                sample_response = self.supabase_client.table('Player').select('*').limit(5).execute()
                                if not sample_response.error and sample_response.data:
                                    print(f"Sample of available players in database: {len(sample_response.data)}")
                                    if sample_response.data:
                                        print(f"Sample player: {sample_response.data[0]}")
                                        print(f"Sample player team field: {sample_response.data[0].get('team')}")
                            except Exception as sample_error:
                                print(f"Error in sample player query: {sample_error}")
                            
                except Exception as supabase_error:
                    print(f"Error fetching players from Supabase: {supabase_error}")
                    traceback.print_exc()
            
            # Generate dummy players for testing purposes
            print(f"Generating dummy players for team_id: {team_id}")
            return self._generate_dummy_players(team_id)
            
        except Exception as e:
            print(f"Error in _get_team_players: {e}")
            traceback.print_exc()
            
            # Return dummy players in case of error
            return self._generate_dummy_players(team_id)
    
    def _generate_dummy_players(self, team_id: int) -> List[Dict[str, Any]]:
        """Generate dummy players for testing purposes."""
        import random
        
        dummy_players = []
        
        # Generate forwards (12)
        positions = ['LW', 'C', 'RW'] * 4  # 4 of each position for 4 lines
        for i, position in enumerate(positions):
            player_name = f"{position} Player {i+1}"
            player = {
                'id': 1000 + i,
                'first_name': player_name.split()[0],
                'last_name': f"#{i+1}",
                'full_name': player_name,
                'position': position,
                'position_primary': position,
                'position_secondary': random.choice(['LW', 'C', 'RW']),
                'overall_rating': random.randint(70, 85),
                'potential': random.randint(1, 5),
                'age': random.randint(20, 35),
                'team_id': team_id,
                'team': self.team_abbreviation,
                'shoots': random.choice(['L', 'R']),
                'height': random.randint(68, 78),
                'weight': random.randint(170, 220),
                'player_type': random.choice(['Sniper', 'Playmaker', 'Power Forward', '2 Way Forward']),
                'skating': random.randint(70, 85),
                'shooting': random.randint(70, 85),
                'passing': random.randint(70, 85),
                'defense': random.randint(70, 85),
                'physical': random.randint(70, 85)
            }
            dummy_players.append(player)
        
        # Generate defensemen (6)
        positions = ['LD', 'RD'] * 3  # 3 pairs
        for i, position in enumerate(positions):
            player_name = f"{position} Player {i+1}"
            player = {
                'id': 2000 + i,
                'first_name': player_name.split()[0],
                'last_name': f"#{i+1}",
                'full_name': player_name,
                'position': position,
                'position_primary': position,
                'position_secondary': 'RD' if position == 'LD' else 'LD',
                'overall_rating': random.randint(70, 85),
                'potential': random.randint(1, 5),
                'age': random.randint(20, 35),
                'team_id': team_id,
                'team': self.team_abbreviation,
                'shoots': 'L' if position == 'LD' else 'R',
                'height': random.randint(70, 80),
                'weight': random.randint(185, 230),
                'player_type': random.choice(['Offensive Def.', 'Defensive Def.', '2 Way Def.']),
                'skating': random.randint(70, 85),
                'shooting': random.randint(70, 85),
                'passing': random.randint(70, 85),
                'defense': random.randint(70, 85),
                'physical': random.randint(70, 85)
            }
            dummy_players.append(player)
        
        # Generate goalies (2)
        for i in range(2):
            player_name = f"Goalie {i+1}"
            player = {
                'id': 3000 + i,
                'first_name': player_name.split()[0],
                'last_name': f"#{i+1}",
                'full_name': player_name,
                'position': 'G',
                'position_primary': 'G',
                'position_secondary': 'G',
                'overall_rating': random.randint(75, 88),
                'potential': random.randint(1, 5),
                'age': random.randint(20, 35),
                'team_id': team_id,
                'team': self.team_abbreviation,
                'shoots': random.choice(['L', 'R']),
                'height': random.randint(72, 80),
                'weight': random.randint(180, 220),
                'player_type': 'Goalie',
                'high_shots': random.randint(70, 85),
                'low_shots': random.randint(70, 85),
                'quickness': random.randint(70, 85),
                'positioning': random.randint(70, 85),
                'puck_handling': random.randint(70, 85)
            }
            dummy_players.append(player)
        
        return dummy_players
    
    def _get_coach(self, coach_id: Optional[int]) -> Optional[Dict[str, Any]]:
        """Get coach data."""
        # Using both Supabase and SQLAlchemy, preferring SQLAlchemy if available
        if not coach_id:
            return None
        
        try:
            # First try SQLAlchemy model if it exists
            from ..models.coach import Coach
            coach = Coach.query.filter_by(id=coach_id).first()
            if coach:
                return coach.to_dict()
                
            # Fall back to Supabase if no local model or no result
            if self.supabase_client:
                response = self.supabase_client.table('Coach').select('*').eq('id', coach_id).execute()
                if not response.error and response.data and len(response.data) > 0:
                    return response.data[0]
        except Exception as e:
            print(f"Error fetching coach: {e}")
            
        # Return dummy data if all else fails
        return {
            "id": coach_id,
            "name": "Coach Smith",
            "strategy_type": "Balanced",
            "offensive_style": 70,
            "defensive_style": 60,
            "preferred_formations": ["1-3-1", "2-1-2"]
        }

    def generate_optimal_lines(self) -> Dict[str, Any]:
        """
        Generate optimal line combinations considering chemistry and coach strategy.
        
        Returns:
            Dictionary with optimized line combinations
        """
        try:
            print(f"TeamFormation: Generating optimal lines for {self.team_abbreviation}")
            
            # Clear any cached chemistries
            self.chemistry_cache = {}
            
            # Step 1: Generate base lines using the line optimizer
            print("TeamFormation: Generating base lines with line optimizer")
            base_lines = self.line_optimizer.generate_all_lines()
            
            # Step 2: Apply coach's strategy to adjust lines based on preferences
            if self.coach_strategy:
                print("TeamFormation: Applying coach strategy to adjust lines")
                try:
                    adjusted_lines = self.coach_strategy.adjust_lines_for_strategy(base_lines)
                except Exception as coach_error:
                    print(f"TeamFormation: Error applying coach strategy: {coach_error}")
                    traceback.print_exc()
                    adjusted_lines = base_lines
            else:
                print("TeamFormation: No coach strategy available, using base lines")
                adjusted_lines = base_lines
                
            # Step 3: Refine special teams based on realistic deployment patterns
            print("TeamFormation: Refining special teams")
            try:
                adjusted_lines = self._refine_special_teams(adjusted_lines)
            except Exception as special_teams_error:
                print(f"TeamFormation: Error refining special teams: {special_teams_error}")
                traceback.print_exc()
                # Continue with unrefined lines
                
            # Step 4: Calculate chemistry for each line and pair
            print("TeamFormation: Calculating chemistry")
            try:
                line_chemistry = self._calculate_all_chemistry(adjusted_lines)
            except Exception as chemistry_error:
                print(f"TeamFormation: Error calculating chemistry: {chemistry_error}")
                traceback.print_exc()
                # Create default chemistry values
                line_chemistry = {
                    'forward_lines': [],
                    'defense_pairs': [],
                    'power_play': [],
                    'penalty_kill': [],
                    'overall': 0.0
                }
            
            # Step 5: Optimize lines based on chemistry values
            print("TeamFormation: Optimizing lines based on chemistry")
            try:
                optimized_lines = self._optimize_lines_by_chemistry(adjusted_lines, line_chemistry)
            except Exception as optimize_error:
                print(f"TeamFormation: Error optimizing lines: {optimize_error}")
                traceback.print_exc()
                optimized_lines = adjusted_lines
            
            # Step 6: Calculate final team ratings
            print("TeamFormation: Calculating team ratings")
            try:
                self.team_rating = self._calculate_team_rating(optimized_lines)
            except Exception as rating_error:
                print(f"TeamFormation: Error calculating team rating: {rating_error}")
                traceback.print_exc()
                # Create default rating values
                self.team_rating = {
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
            
            # Store the resulting optimized lines
            self.optimal_lines = optimized_lines
            
            print(f"TeamFormation: Successfully generated optimal lines for {self.team_abbreviation}")
            
            return {
                'lines': optimized_lines,
                'chemistry': line_chemistry,
                'team_rating': self.team_rating
            }
        except Exception as e:
            print(f"TeamFormation: Error in generate_optimal_lines: {e}")
            traceback.print_exc()
            
            # Return default values in case of error
            return {
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
    
    def _refine_special_teams(self, lines: Dict[str, Any]) -> Dict[str, Any]:
        """
        Refine special teams based on realistic NHL deployment patterns.
        This ensures players are placed in appropriate roles based on their 
        skills, positions, and shooting sides.
        
        Args:
            lines: Dictionary with line combinations
            
        Returns:
            Dictionary with refined special teams
        """
        refined_lines = copy.deepcopy(lines)
        
        # Get all players from regular lines for identification
        all_forwards = []
        all_defensemen = []
        
        # Extract players from forward lines
        for line in refined_lines.get('forward_lines', []):
            if line.get('LW') and line.get('LW') != 'Empty':
                all_forwards.append(line.get('LW'))
            if line.get('C') and line.get('C') != 'Empty':
                all_forwards.append(line.get('C'))
            if line.get('RW') and line.get('RW') != 'Empty':
                all_forwards.append(line.get('RW'))
        
        # Extract players from defense pairs
        for pair in refined_lines.get('defense_pairs', []):
            if pair.get('LD') and pair.get('LD') != 'Empty':
                all_defensemen.append(pair.get('LD'))
            if pair.get('RD') and pair.get('RD') != 'Empty':
                all_defensemen.append(pair.get('RD'))
        
        # Refine power play units
        refined_lines = self._refine_power_play_units(refined_lines, all_forwards, all_defensemen)
        
        # Refine penalty kill units
        refined_lines = self._refine_penalty_kill_units(refined_lines, all_forwards, all_defensemen)
        
        return refined_lines
    
    def _refine_power_play_units(self, lines: Dict[str, Any], all_forwards: List[Dict], all_defensemen: List[Dict]) -> Dict[str, Any]:
        """
        Refine power play units based on realistic NHL deployment.
        
        Args:
            lines: Dictionary with line combinations
            all_forwards: List of all forwards
            all_defensemen: List of all defensemen
            
        Returns:
            Dictionary with refined power play units
        """
        refined_lines = copy.deepcopy(lines)
        
        # Get players by specialties
        snipers = [p for p in all_forwards if p.get('player_type') == 'Sniper']
        playmakers = [p for p in all_forwards if p.get('player_type') == 'Playmaker']
        power_forwards = [p for p in all_forwards if p.get('player_type') == 'Power Forward']
        two_way_forwards = [p for p in all_forwards if p.get('player_type') in ['2 Way', '2 Way Forward']]
        offensive_dmen = [p for p in all_defensemen if p.get('player_type') == 'Offensive Def.']
        
        # Sort each group by overall rating
        snipers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        playmakers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        power_forwards.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        offensive_dmen.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Group players by position for position-specific selection
        left_wings = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) == 'LW']
        centers = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) == 'C']
        right_wings = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) == 'RW']
        
        left_wings.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        centers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        right_wings.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # FIRST POWER PLAY UNIT
        pp1_forwards = []
        pp1_defense = []
        
        # Use 4F-1D by default (most common in NHL)
        
        # Assign best offensive defenseman to quarterback PP1
        if offensive_dmen:
            pp1_defense.append(offensive_dmen[0])
        elif all_defensemen:
            # If no offensive defensemen, use best overall
            best_dman = sorted(all_defensemen, key=lambda p: p.get('overall_rating', 0), reverse=True)[0]
            pp1_defense.append(best_dman)
        
        # Try to place shooters on their off-wing for one-timers
        # Right-handed snipers often play left side, left-handed snipers on right side
        for sniper in snipers[:2]:  # Get top 2 snipers
            shooting_hand = sniper.get('shoots', 'L')
            already_in_pp1 = sniper in pp1_forwards
            
            if not already_in_pp1:
                if shooting_hand == 'R' and len([p for p in pp1_forwards if p.get('position_primary') == 'LW']) == 0:
                    # Right-hand shot to LW for one-timers
                    sniper_copy = copy.deepcopy(sniper)
                    sniper_copy['pp_position'] = 'LW'
                    pp1_forwards.append(sniper_copy)
                elif shooting_hand == 'L' and len([p for p in pp1_forwards if p.get('position_primary') == 'RW']) == 0:
                    # Left-hand shot to RW for one-timers
                    sniper_copy = copy.deepcopy(sniper)
                    sniper_copy['pp_position'] = 'RW'
                    pp1_forwards.append(sniper_copy)
        
        # Add best playmaker at C position
        if playmakers and len([p for p in pp1_forwards if p.get('pp_position') == 'C']) == 0:
            for playmaker in playmakers:
                if playmaker not in pp1_forwards:
                    playmaker_copy = copy.deepcopy(playmaker)
                    playmaker_copy['pp_position'] = 'C'
                    pp1_forwards.append(playmaker_copy)
                    break
        
        # Fill remaining positions for balance
        slots_needed = 4 - len(pp1_forwards)  # 4 forwards for 4F-1D
        
        # Check which positions we need to fill
        has_lw = any(p.get('pp_position') == 'LW' for p in pp1_forwards)
        has_c = any(p.get('pp_position') == 'C' for p in pp1_forwards)
        has_rw = any(p.get('pp_position') == 'RW' for p in pp1_forwards)
        
        # Add best available forwards by position
        all_forwards_by_rating = sorted(all_forwards, key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # First fill essential positions
        if not has_c and centers:
            for center in centers:
                if center not in pp1_forwards:
                    center_copy = copy.deepcopy(center)
                    center_copy['pp_position'] = 'C'
                    pp1_forwards.append(center_copy)
                    slots_needed -= 1
                    has_c = True
                    break
        
        if not has_lw and left_wings and slots_needed > 0:
            for lw in left_wings:
                if lw not in pp1_forwards:
                    lw_copy = copy.deepcopy(lw)
                    lw_copy['pp_position'] = 'LW'
                    pp1_forwards.append(lw_copy)
                    slots_needed -= 1
                    has_lw = True
                    break
        
        if not has_rw and right_wings and slots_needed > 0:
            for rw in right_wings:
                if rw not in pp1_forwards:
                    rw_copy = copy.deepcopy(rw)
                    rw_copy['pp_position'] = 'RW'
                    pp1_forwards.append(rw_copy)
                    slots_needed -= 1
                    has_rw = True
                    break
        
        # Fill any remaining slots with best available forwards
        for forward in all_forwards_by_rating:
            if forward not in pp1_forwards and slots_needed > 0:
                # Determine best position for them
                if not has_lw:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'LW'
                    pp1_forwards.append(forward_copy)
                    has_lw = True
                elif not has_c:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'C'
                    pp1_forwards.append(forward_copy)
                    has_c = True
                elif not has_rw:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'RW'
                    pp1_forwards.append(forward_copy)
                    has_rw = True
                else:
                    # Add as bumper/net-front (typically marked as C)
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'C'
                    pp1_forwards.append(forward_copy)
                
                slots_needed -= 1
                
            if slots_needed == 0:
                break
        
        # SECOND POWER PLAY UNIT
        pp2_forwards = []
        pp2_defense = []
        
        # Get players used in PP1
        pp1_ids = [p.get('id') for p in pp1_forwards + pp1_defense if p.get('id')]
        
        # Use 3F-2D format for PP2 (common in NHL)
        
        # Add defensemen
        remaining_offensive_dmen = [d for d in offensive_dmen if d.get('id') not in pp1_ids]
        remaining_defensemen = [d for d in all_defensemen if d.get('id') not in pp1_ids]
        
        # Add one or two defensemen depending on remaining talent
        if len(remaining_offensive_dmen) >= 2:
            pp2_defense = remaining_offensive_dmen[:2]
        elif remaining_offensive_dmen:
            pp2_defense.append(remaining_offensive_dmen[0])
            if remaining_defensemen:
                pp2_defense.append(remaining_defensemen[0])
        elif len(remaining_defensemen) >= 2:
            pp2_defense = remaining_defensemen[:2]
        elif remaining_defensemen:
            pp2_defense.append(remaining_defensemen[0])
        
        # Get remaining players not used in PP1
        remaining_snipers = [p for p in snipers if p.get('id') not in pp1_ids]
        remaining_playmakers = [p for p in playmakers if p.get('id') not in pp1_ids]
        remaining_forwards = [p for p in all_forwards if p.get('id') not in pp1_ids]
        
        # Again, place shooters on off-wings when possible
        for sniper in remaining_snipers[:1]:  # Get top remaining sniper
            shooting_hand = sniper.get('shoots', 'L')
            if shooting_hand == 'R':
                # Right-hand shot to LW for one-timers
                sniper_copy = copy.deepcopy(sniper)
                sniper_copy['pp_position'] = 'LW'
                pp2_forwards.append(sniper_copy)
            elif shooting_hand == 'L':
                # Left-hand shot to RW for one-timers
                sniper_copy = copy.deepcopy(sniper)
                sniper_copy['pp_position'] = 'RW'
                pp2_forwards.append(sniper_copy)
        
        # Add best remaining playmaker at C
        if remaining_playmakers and len([p for p in pp2_forwards if p.get('pp_position') == 'C']) == 0:
            playmaker_copy = copy.deepcopy(remaining_playmakers[0])
            playmaker_copy['pp_position'] = 'C'
            pp2_forwards.append(playmaker_copy)
        
        # Fill positions similar to PP1
        slots_needed = 3 - len(pp2_forwards)  # 3 forwards for 3F-2D
        
        # Check which positions we need to fill
        has_lw = any(p.get('pp_position') == 'LW' for p in pp2_forwards)
        has_c = any(p.get('pp_position') == 'C' for p in pp2_forwards)
        has_rw = any(p.get('pp_position') == 'RW' for p in pp2_forwards)
        
        # Add best available remaining forwards by position
        remaining_forwards_by_rating = sorted(remaining_forwards, key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Fill remaining positions
        for forward in remaining_forwards_by_rating:
            if forward not in pp2_forwards and slots_needed > 0:
                pp2_ids = [p.get('id') for p in pp2_forwards if p.get('id')]
                if forward.get('id') in pp2_ids:
                    continue
                    
                if not has_c:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'C'
                    pp2_forwards.append(forward_copy)
                    has_c = True
                elif not has_lw:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'LW'
                    pp2_forwards.append(forward_copy)
                    has_lw = True
                elif not has_rw:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'RW'
                    pp2_forwards.append(forward_copy)
                    has_rw = True
                
                slots_needed -= 1
                
            if slots_needed == 0:
                break
        
        # Update power play units in the lines
        refined_lines['power_play_1'] = {
            'forwards': pp1_forwards,
            'defense': pp1_defense
        }
        
        refined_lines['power_play_2'] = {
            'forwards': pp2_forwards,
            'defense': pp2_defense
        }
        
        return refined_lines
    
    def _refine_penalty_kill_units(self, lines: Dict[str, Any], all_forwards: List[Dict], all_defensemen: List[Dict]) -> Dict[str, Any]:
        """
        Refine penalty kill units based on realistic NHL deployment.
        
        Args:
            lines: Dictionary with line combinations
            all_forwards: List of all forwards
            all_defensemen: List of all defensemen
            
        Returns:
            Dictionary with refined penalty kill units
        """
        refined_lines = copy.deepcopy(lines)
        
        # Get players by specialties for PK
        two_way_forwards = [p for p in all_forwards if p.get('player_type') in ['2 Way', '2 Way Forward']]
        defensive_forwards = [p for p in all_forwards if 'defense' in p and p.get('defense', 0) >= 80]
        defensive_dmen = [p for p in all_defensemen if p.get('player_type') in ['Defensive Def.', '2 Way Def.']]
        
        # Group players by position
        centers = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) == 'C']
        wingers = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) in ['LW', 'RW']]
        
        # Sort by defensive ability if available, otherwise by rating
        if any('defense' in p for p in centers):
            pk_centers = sorted(centers, key=lambda p: p.get('defense', p.get('overall_rating', 0)), reverse=True)
        else:
            # Prioritize two-way centers
            pk_centers = [c for c in centers if c.get('player_type') in ['2 Way', '2 Way Forward']]
            pk_centers.extend([c for c in centers if c not in pk_centers])
            pk_centers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        if any('defense' in p for p in wingers):
            pk_wingers = sorted(wingers, key=lambda p: p.get('defense', p.get('overall_rating', 0)), reverse=True)
        else:
            # Prioritize two-way wingers
            pk_wingers = [w for w in wingers if w.get('player_type') in ['2 Way', '2 Way Forward']]
            pk_wingers.extend([w for w in wingers if w not in pk_wingers])
            pk_wingers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Sort defensemen by defensive ability
        if any('defense' in p for p in all_defensemen):
            pk_defensemen = sorted(all_defensemen, key=lambda p: p.get('defense', p.get('overall_rating', 0)), reverse=True)
        else:
            # Prioritize defensive defensemen
            pk_defensemen = defensive_dmen + [d for d in all_defensemen if d not in defensive_dmen]
            pk_defensemen.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # FIRST PENALTY KILL UNIT
        pk1_forwards = []
        pk1_defense = []
        
        # Add best PK center
        if pk_centers:
            center_copy = copy.deepcopy(pk_centers[0])
            center_copy['pk_position'] = 'C'
            pk1_forwards.append(center_copy)
        
        # Add best PK winger
        if pk_wingers:
            winger_copy = copy.deepcopy(pk_wingers[0])
            winger_copy['pk_position'] = 'W'
            pk1_forwards.append(winger_copy)
        
        # Add best defensemen
        pk1_defense = pk_defensemen[:2] if len(pk_defensemen) >= 2 else pk_defensemen
        
        # SECOND PENALTY KILL UNIT
        pk2_forwards = []
        pk2_defense = []
        
        # Get players used in PK1
        pk1_ids = [p.get('id') for p in pk1_forwards + pk1_defense if p.get('id')]
        
        # Add second best PK center
        remaining_centers = [c for c in pk_centers if c.get('id') not in pk1_ids]
        if remaining_centers:
            center_copy = copy.deepcopy(remaining_centers[0])
            center_copy['pk_position'] = 'C'
            pk2_forwards.append(center_copy)
        elif pk_centers:  # Reuse the first center if we don't have enough
            center_copy = copy.deepcopy(pk_centers[0])
            center_copy['pk_position'] = 'C'
            pk2_forwards.append(center_copy)
        
        # Add second best PK winger
        remaining_wingers = [w for w in pk_wingers if w.get('id') not in pk1_ids]
        if remaining_wingers:
            winger_copy = copy.deepcopy(remaining_wingers[0])
            winger_copy['pk_position'] = 'W'
            pk2_forwards.append(winger_copy)
        elif pk_wingers:  # Reuse the first winger if we don't have enough
            winger_copy = copy.deepcopy(pk_wingers[0])
            winger_copy['pk_position'] = 'W'
            pk2_forwards.append(winger_copy)
        
        # For defense, typical NHL approach is either different pairs or mix top with others
        remaining_defensemen = [d for d in pk_defensemen if d.get('id') not in pk1_ids]
        defensive_depth = len(pk_defensemen)
        
        if len(remaining_defensemen) >= 2:
            # Use completely different pair if we have the depth
            pk2_defense = remaining_defensemen[:2]
        elif remaining_defensemen and defensive_depth >= 3:
            # Mix top defenseman with next best
            pk2_defense = [pk_defensemen[0], remaining_defensemen[0]]
        else:
            # Reuse the same top pair if limited options
            pk2_defense = pk_defensemen[:2] if len(pk_defensemen) >= 2 else pk_defensemen
        
        # Update penalty kill units in the lines
        refined_lines['penalty_kill_1'] = {
            'forwards': pk1_forwards,
            'defense': pk1_defense
        }
        
        refined_lines['penalty_kill_2'] = {
            'forwards': pk2_forwards,
            'defense': pk2_defense
        }
        
        return refined_lines
    
    def _calculate_all_chemistry(self, lines: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate chemistry values for all lines and pairs.
        
        Args:
            lines: Dictionary with line combinations
            
        Returns:
            Dictionary with chemistry values for each line/pair
        """
        chemistry = {
            'forward_lines': [],
            'defense_pairs': [],
            'power_play': [],
            'penalty_kill': [],
            'overall': 0.0
        }
        
        # Calculate forward line chemistry
        forward_chemistry_sum = 0
        for i, line in enumerate(lines.get('forward_lines', [])):
            # Skip empty lines
            if 'Empty' in [line.get('LW'), line.get('C'), line.get('RW')]:
                chemistry['forward_lines'].append(0)
                continue
                
            # Get player list in consistent format for calculator
            players = [line.get('LW'), line.get('C'), line.get('RW')]
            
            # Calculate chemistry
            line_chem, factors = self.chemistry_calculator.calculate_forward_line_chemistry(players)
            
            # Store with line number
            chemistry['forward_lines'].append({
                'line': i + 1,
                'chemistry': line_chem,
                'factors': factors
            })
            
            forward_chemistry_sum += line_chem
        
        # Calculate defense pair chemistry
        defense_chemistry_sum = 0
        for i, pair in enumerate(lines.get('defense_pairs', [])):
            # Skip empty pairs
            if 'Empty' in [pair.get('LD'), pair.get('RD')]:
                chemistry['defense_pairs'].append(0)
                continue
                
            # Get player list in consistent format for calculator
            players = [pair.get('LD'), pair.get('RD')]
            
            # Calculate chemistry
            pair_chem, factors = self.chemistry_calculator.calculate_defense_pair_chemistry(players)
            
            # Store with pair number
            chemistry['defense_pairs'].append({
                'pair': i + 1,
                'chemistry': pair_chem,
                'factors': factors
            })
            
            defense_chemistry_sum += pair_chem
            
        # Calculate power play unit chemistry
        pp_chemistry_sum = 0
        for i, unit_name in enumerate(['power_play_1', 'power_play_2']):
            unit = lines.get(unit_name, {})
            
            # Calculate chemistry
            unit_chem, factors = self.chemistry_calculator.calculate_pp_unit_chemistry(unit)
            
            # Store with unit number
            chemistry['power_play'].append({
                'unit': i + 1,
                'chemistry': unit_chem,
                'factors': factors
            })
            
            pp_chemistry_sum += unit_chem
            
        # Calculate penalty kill unit chemistry
        pk_chemistry_sum = 0
        for i, unit_name in enumerate(['penalty_kill_1', 'penalty_kill_2']):
            unit = lines.get(unit_name, {})
            
            # Calculate chemistry
            unit_chem, factors = self.chemistry_calculator.calculate_pk_unit_chemistry(unit)
            
            # Store with unit number
            chemistry['penalty_kill'].append({
                'unit': i + 1,
                'chemistry': unit_chem,
                'factors': factors
            })
            
            pk_chemistry_sum += unit_chem
            
        # Calculate overall team chemistry (weighted average)
        num_forward_lines = len([l for l in chemistry['forward_lines'] if l != 0])
        num_defense_pairs = len([p for p in chemistry['defense_pairs'] if p != 0])
        num_pp_units = len(chemistry['power_play'])
        num_pk_units = len(chemistry['penalty_kill'])
        
        # Weight factors based on importance
        fw_weight = 0.4  # 40% from forward lines
        d_weight = 0.3   # 30% from defense pairs
        pp_weight = 0.15 # 15% from power play
        pk_weight = 0.15 # 15% from penalty kill
        
        # Calculate weighted average, avoiding division by zero
        weighted_sum = 0
        total_weight = 0
        
        if num_forward_lines > 0:
            weighted_sum += (forward_chemistry_sum / num_forward_lines) * fw_weight
            total_weight += fw_weight
            
        if num_defense_pairs > 0:
            weighted_sum += (defense_chemistry_sum / num_defense_pairs) * d_weight
            total_weight += d_weight
            
        if num_pp_units > 0:
            weighted_sum += (pp_chemistry_sum / num_pp_units) * pp_weight
            total_weight += pp_weight
            
        if num_pk_units > 0:
            weighted_sum += (pk_chemistry_sum / num_pk_units) * pk_weight
            total_weight += pk_weight
            
        # Calculate overall chemistry if we have any components
        if total_weight > 0:
            chemistry['overall'] = weighted_sum / total_weight
        
        return chemistry
    
    def _optimize_lines_by_chemistry(self, lines: Dict[str, Any], chemistry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize line combinations based on chemistry values.
        This may rearrange players to maximize chemistry.
        
        Args:
            lines: Current line combinations
            chemistry: Current chemistry values
            
        Returns:
            Optimized line combinations
        """
        # For the initial implementation, we'll make minor adjustments
        # In a more advanced version, this could use combinatorial optimization
        
        # Create a copy to avoid modifying the original
        optimized = copy.deepcopy(lines)
        
        # Example: If a forward line has negative chemistry, try swapping wingers
        for i, line_chem in enumerate(chemistry.get('forward_lines', [])):
            # Skip empty lines or lines with good chemistry
            if isinstance(line_chem, int) or line_chem.get('chemistry', 0) >= 0:
                continue
                
            # Try swapping wingers to improve chemistry
            if i < len(optimized['forward_lines']):
                line = optimized['forward_lines'][i]
                # Swap LW and RW
                line['LW'], line['RW'] = line['RW'], line['LW']
                
                # Check if chemistry improved (would require recalculation)
                # For simplicity, we'll just assume it might help
                
        # More advanced optimization would go here
        # This could involve trying different player combinations
        # and keeping the ones with the best chemistry
        
        return optimized
    
    def _calculate_team_rating(self, lines: Dict[str, Any]) -> Dict[str, float]:
        """
        Calculate team rating based on player attributes, line combinations, and chemistry.
        
        Args:
            lines: Dictionary of line combinations
            
        Returns:
            Dictionary with team rating information
        """
        print("\n=== CALCULATING TEAM RATING ===")
        print(f"Team: {self.team_abbreviation}")
        print(f"Debug mode: {self.debug}")
        
        # Define component weights (must sum to 1.0)
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
        
        print(f"Weight distribution: {weights}")
        print(f"Total weight sum: {sum(weights.values())}")
        
        # Initialize component ratings dictionary
        component_ratings = {}
        
        # Calculate forward line ratings
        print("\n--- FORWARD LINES ---")
        if 'forward_lines' in lines:
            print(f"Number of forward lines: {len(lines['forward_lines'])}")
            for i, line in enumerate(lines['forward_lines']):
                if i < 4:  # Only consider the first 4 lines
                    print(f"\nLine {i+1} configuration:")
                    # Get players in this line
                    lw_player = line.get('LW')
                    c_player = line.get('C')
                    rw_player = line.get('RW')
                    
                    # Print player details
                    print(f"  LW: {self._get_player_name(lw_player) if lw_player and lw_player != 'Empty' else 'Empty'}")
                    print(f"  C: {self._get_player_name(c_player) if c_player and c_player != 'Empty' else 'Empty'}")
                    print(f"  RW: {self._get_player_name(rw_player) if rw_player and rw_player != 'Empty' else 'Empty'}")
                    
                    players = [p for p in [lw_player, c_player, rw_player] if p and p != 'Empty']
                    print(f"  Valid players in line: {len(players)}")
                    
                    # Calculate line rating as average of player ratings
                    if players and len(players) > 0:
                        player_details = []
                        for p in players:
                            rating = self.get_player_rating(p)
                            player_name = self._get_player_name(p)
                            position = self._get_player_position(p)
                            player_details.append(f"{player_name} ({position}): {rating}")
                        
                        ratings = [self.get_player_rating(p) for p in players]
                        valid_ratings = [r for r in ratings if r > 0]
                        
                        print(f"  Player ratings: {', '.join(player_details)}")
                        
                        if valid_ratings and len(valid_ratings) > 0:
                            line_rating = sum(valid_ratings) / len(valid_ratings)
                            component_ratings[f'line_{i+1}'] = round(line_rating, 1)
                            print(f"  Line {i+1} Rating (before chemistry): {line_rating:.1f} (average of {valid_ratings})")
                        else:
                            component_ratings[f'line_{i+1}'] = 0
                            print(f"  Line {i+1} Rating: 0 (no valid ratings)")
                    else:
                        component_ratings[f'line_{i+1}'] = 0
                        print(f"  Line {i+1} Rating: 0 (no valid players)")
        
        # Calculate defense pair ratings
        print("\n--- DEFENSE PAIRS ---")
        if 'defense_pairs' in lines:
            print(f"Number of defense pairs: {len(lines['defense_pairs'])}")
            for i, pair in enumerate(lines['defense_pairs']):
                if i < 3:  # Only consider the first 3 pairs
                    print(f"\nPair {i+1} configuration:")
                    # Get players in this pair
                    ld_player = pair.get('LD')
                    rd_player = pair.get('RD')
                    
                    # Print player details
                    print(f"  LD: {self._get_player_name(ld_player) if ld_player and ld_player != 'Empty' else 'Empty'}")
                    print(f"  RD: {self._get_player_name(rd_player) if rd_player and rd_player != 'Empty' else 'Empty'}")
                    
                    players = [p for p in [ld_player, rd_player] if p and p != 'Empty']
                    print(f"  Valid players in pair: {len(players)}")
                    
                    # Calculate pair rating as average of player ratings
                    if players and len(players) > 0:
                        player_details = []
                        for p in players:
                            rating = self.get_player_rating(p)
                            player_name = self._get_player_name(p)
                            position = self._get_player_position(p)
                            player_details.append(f"{player_name} ({position}): {rating}")
                        
                        ratings = [self.get_player_rating(p) for p in players]
                        valid_ratings = [r for r in ratings if r > 0]
                        
                        print(f"  Player ratings: {', '.join(player_details)}")
                        
                        if valid_ratings and len(valid_ratings) > 0:
                            pair_rating = sum(valid_ratings) / len(valid_ratings)
                            component_ratings[f'pair_{i+1}'] = round(pair_rating, 1)
                            print(f"  Pair {i+1} Rating (before chemistry): {pair_rating:.1f} (average of {valid_ratings})")
                        else:
                            component_ratings[f'pair_{i+1}'] = 0
                            print(f"  Pair {i+1} Rating: 0 (no valid ratings)")
                    else:
                        component_ratings[f'pair_{i+1}'] = 0
                        print(f"  Pair {i+1} Rating: 0 (no valid players)")
        
        # Calculate power play ratings
        print("\n--- POWER PLAY UNITS ---")
        pp_units = ['power_play_1', 'power_play_2']
        for i, unit_name in enumerate(pp_units):
            if unit_name in lines:
                print(f"\nPower Play Unit {i+1}:")
                unit = lines[unit_name]
                forwards = unit.get('forwards', [])
                defense = unit.get('defense', [])
                players = forwards + defense
                
                print(f"  Forwards: {len(forwards)}, Defense: {len(defense)}")
                
                # Calculate unit rating as average of player ratings
                valid_players = [p for p in players if p and p != 'Empty']
                if valid_players and len(valid_players) > 0:
                    player_details = []
                    for p in valid_players:
                        rating = self.get_player_rating(p)
                        player_name = self._get_player_name(p)
                        position = self._get_player_position(p)
                        player_details.append(f"{player_name} ({position}): {rating}")
                    
                    ratings = [self.get_player_rating(p) for p in valid_players]
                    valid_ratings = [r for r in ratings if r > 0]
                    
                    print(f"  Player ratings: {', '.join(player_details)}")
                    
                    if valid_ratings and len(valid_ratings) > 0:
                        unit_rating = sum(valid_ratings) / len(valid_ratings)
                        component_ratings[unit_name] = round(unit_rating, 1)
                        print(f"  PP{i+1} Rating (before chemistry): {unit_rating:.1f} (average of {valid_ratings})")
                    else:
                        component_ratings[unit_name] = 0
                        print(f"  PP{i+1} Rating: 0 (no valid ratings)")
                else:
                    component_ratings[unit_name] = 0
                    print(f"  PP{i+1} Rating: 0 (no valid players)")
        
        # Calculate penalty kill ratings
        print("\n--- PENALTY KILL UNITS ---")
        pk_units = ['penalty_kill_1', 'penalty_kill_2']
        for i, unit_name in enumerate(pk_units):
            if unit_name in lines:
                print(f"\nPenalty Kill Unit {i+1}:")
                unit = lines[unit_name]
                forwards = unit.get('forwards', [])
                defense = unit.get('defense', [])
                players = forwards + defense
                
                print(f"  Forwards: {len(forwards)}, Defense: {len(defense)}")
                
                # Calculate unit rating as average of player ratings
                valid_players = [p for p in players if p and p != 'Empty']
                if valid_players and len(valid_players) > 0:
                    player_details = []
                    for p in valid_players:
                        rating = self.get_player_rating(p)
                        player_name = self._get_player_name(p)
                        position = self._get_player_position(p)
                        player_details.append(f"{player_name} ({position}): {rating}")
                    
                    ratings = [self.get_player_rating(p) for p in valid_players]
                    valid_ratings = [r for r in ratings if r > 0]
                    
                    print(f"  Player ratings: {', '.join(player_details)}")
                    
                    if valid_ratings and len(valid_ratings) > 0:
                        unit_rating = sum(valid_ratings) / len(valid_ratings)
                        component_ratings[unit_name] = round(unit_rating, 1)
                        print(f"  PK{i+1} Rating (before chemistry): {unit_rating:.1f} (average of {valid_ratings})")
                    else:
                        component_ratings[unit_name] = 0
                        print(f"  PK{i+1} Rating: 0 (no valid ratings)")
                else:
                    component_ratings[unit_name] = 0
                    print(f"  PK{i+1} Rating: 0 (no valid players)")
        
        # Calculate other special teams ratings
        print("\n--- OTHER SPECIAL TEAMS ---")
        if 'other_situations' in lines:
            other_situations = lines['other_situations']
            print(f"Other situations: {list(other_situations.keys())}")
            
            # Combined special teams rating (shootout, overtime, etc.)
            all_special_players = []
            
            # Overtime
            if 'overtime' in other_situations:
                overtime = other_situations['overtime']
                ot_forwards = overtime.get('forwards', [])
                ot_defense = overtime.get('defensemen', [])
                ot_players = [p for p in ot_forwards + ot_defense if p and p != 'Empty']
                all_special_players.extend(ot_players)
                
                print(f"  Overtime players: {len(ot_players)}")
                if ot_players:
                    ot_player_details = []
                    for p in ot_players:
                        rating = self.get_player_rating(p)
                        player_name = self._get_player_name(p)
                        position = self._get_player_position(p)
                        ot_player_details.append(f"{player_name} ({position}): {rating}")
                    print(f"  OT player ratings: {', '.join(ot_player_details)}")
            
            # Calculate other special teams rating
            if all_special_players:
                ratings = [self.get_player_rating(p) for p in all_special_players]
                valid_ratings = [r for r in ratings if r > 0]
                
                if valid_ratings:
                    special_rating = sum(valid_ratings) / len(valid_ratings)
                    component_ratings['other_special_teams'] = round(special_rating, 1)
                    print(f"  Other Special Teams Rating: {special_rating:.1f} (average of {valid_ratings})")
                else:
                    component_ratings['other_special_teams'] = 0
                    print(f"  Other Special Teams Rating: 0 (no valid ratings)")
            else:
                component_ratings['other_special_teams'] = 0
                print(f"  Other Special Teams Rating: 0 (no players)")
        else:
            component_ratings['other_special_teams'] = 0
            print(f"  Other Special Teams Rating: 0 (no other situations defined)")
        
        # Calculate shootout rating
        print("\n--- SHOOTOUT ---")
        if 'other_situations' in lines and 'shootout' in lines['other_situations']:
            shootout = lines['other_situations']['shootout']
            shootout_players = shootout.get('players', [])
            valid_shootout_players = [p for p in shootout_players if p and p != 'Empty']
            
            print(f"  Shootout players: {len(valid_shootout_players)}")
            
            if valid_shootout_players:
                player_details = []
                for p in valid_shootout_players:
                    rating = self.get_player_rating(p)
                    player_name = self._get_player_name(p)
                    position = self._get_player_position(p)
                    player_details.append(f"{player_name} ({position}): {rating}")
                
                print(f"  Player ratings: {', '.join(player_details)}")
                
                ratings = [self.get_player_rating(p) for p in valid_shootout_players]
                valid_ratings = [r for r in ratings if r > 0]
                
                if valid_ratings:
                    shootout_rating = sum(valid_ratings) / len(valid_ratings)
                    component_ratings['shootout'] = round(shootout_rating, 1)
                    print(f"  Shootout Rating: {shootout_rating:.1f} (average of {valid_ratings})")
                else:
                    component_ratings['shootout'] = 0
                    print(f"  Shootout Rating: 0 (no valid ratings)")
            else:
                component_ratings['shootout'] = 0
                print(f"  Shootout Rating: 0 (no valid players)")
        else:
            component_ratings['shootout'] = 0
            print(f"  Shootout Rating: 0 (no shootout defined)")
        
        # Calculate goaltending rating
        print("\n--- GOALTENDING ---")
        if 'goalies' in lines:
            goalies = lines['goalies']
            valid_goalies = [g for g in goalies if g and g != 'Empty']
            
            print(f"  Goalies: {len(valid_goalies)}")
            
            if valid_goalies:
                player_details = []
                for g in valid_goalies:
                    rating = self.get_player_rating(g)
                    player_name = self._get_player_name(g)
                    is_starter = g.get('is_starter', False) if isinstance(g, dict) else getattr(g, 'is_starter', False)
                    player_details.append(f"{player_name}: {rating} {'(Starter)' if is_starter else ''}")
                
                print(f"  Goalie ratings: {', '.join(player_details)}")
                
                # Weight starter higher if defined
                starter_goalies = [g for g in valid_goalies if (isinstance(g, dict) and g.get('is_starter', False)) or 
                                  (not isinstance(g, dict) and getattr(g, 'is_starter', False))]
                
                if starter_goalies:
                    # Prioritize starter for goaltending rating
                    starter_ratings = [self.get_player_rating(g) for g in starter_goalies]
                    valid_starter_ratings = [r for r in starter_ratings if r > 0]
                    
                    if valid_starter_ratings:
                        goaltending_rating = sum(valid_starter_ratings) / len(valid_starter_ratings)
                        component_ratings['goaltending'] = round(goaltending_rating, 1)
                        print(f"  Goaltending Rating (starter-weighted): {goaltending_rating:.1f}")
                    else:
                        # Fallback to all goalies
                        all_ratings = [self.get_player_rating(g) for g in valid_goalies]
                        valid_all_ratings = [r for r in all_ratings if r > 0]
                        
                        if valid_all_ratings:
                            goaltending_rating = sum(valid_all_ratings) / len(valid_all_ratings)
                            component_ratings['goaltending'] = round(goaltending_rating, 1)
                            print(f"  Goaltending Rating (all goalies): {goaltending_rating:.1f}")
                        else:
                            component_ratings['goaltending'] = 0
                            print(f"  Goaltending Rating: 0 (no valid ratings)")
                else:
                    # If no starter defined, use all goalies
                    all_ratings = [self.get_player_rating(g) for g in valid_goalies]
                    valid_all_ratings = [r for r in all_ratings if r > 0]
                    
                    if valid_all_ratings:
                        goaltending_rating = sum(valid_all_ratings) / len(valid_all_ratings)
                        component_ratings['goaltending'] = round(goaltending_rating, 1)
                        print(f"  Goaltending Rating (all goalies): {goaltending_rating:.1f}")
                    else:
                        component_ratings['goaltending'] = 0
                        print(f"  Goaltending Rating: 0 (no valid ratings)")
            else:
                component_ratings['goaltending'] = 0
                print(f"  Goaltending Rating: 0 (no valid goalies)")
        else:
            component_ratings['goaltending'] = 0
            print(f"  Goaltending Rating: 0 (no goalies defined)")
        
        # Print raw component ratings before chemistry/coach effects
        print("\n--- RAW COMPONENT RATINGS BEFORE ADJUSTMENTS ---")
        for component, rating in sorted(component_ratings.items()):
            print(f"  {component}: {rating}")
        
        # Apply chemistry effects to the component ratings
        print("\n--- APPLYING CHEMISTRY EFFECTS ---")
        pre_chemistry_components = component_ratings.copy()
        component_ratings = self._apply_chemistry_to_components(component_ratings)
        
        # Print component rating changes due to chemistry
        for component in sorted(component_ratings.keys()):
            old_rating = pre_chemistry_components.get(component, 0)
            new_rating = component_ratings.get(component, 0)
            change = new_rating - old_rating
            print(f"  {component}: {old_rating} → {new_rating} (change: {change:+.1f})")
        
        # Calculate overall rating using weighted components (before coach effects)
        weighted_sum = 0
        total_weight_applied = 0
        
        for component, weight in weights.items():
            if component in component_ratings and component_ratings[component] > 0:
                weighted_sum += component_ratings[component] * weight
                total_weight_applied += weight
        
        pre_coach_overall = 0
        if total_weight_applied > 0:
            pre_coach_overall = weighted_sum / total_weight_applied
        
        print(f"\nPre-coach overall rating calculation:")
        print(f"  Weighted sum: {weighted_sum:.1f}")
        print(f"  Total weight applied: {total_weight_applied:.2f}")
        print(f"  Pre-coach overall rating: {pre_coach_overall:.1f}")
        
        # Apply coach effects to the overall rating
        print("\n--- APPLYING COACH EFFECTS ---")
        pre_coach_overall_rounded = round(pre_coach_overall)
        overall_rating = self._apply_coach_overall_bonus(pre_coach_overall)
        
        coach_effect = overall_rating - pre_coach_overall_rounded
        print(f"  Coach effect: {pre_coach_overall_rounded} → {overall_rating} (change: {coach_effect:+.1f})")
        
        # Ensure overall is within 0-99 range and round for display
        overall_rating = min(99, max(0, round(overall_rating)))
        
        # Calculate main category ratings using the adjusted component ratings
        offense_rating = 0
        offense_components = ['line_1', 'line_2', 'line_3', 'line_4', 'power_play_1', 'power_play_2']
        offense_weights = {c: weights[c] for c in offense_components}
        offense_weighted_sum = 0
        offense_total_weight = 0
        
        for c, w in offense_weights.items():
            if c in component_ratings and component_ratings[c] > 0:
                offense_weighted_sum += component_ratings[c] * w
                offense_total_weight += w
        
        if offense_total_weight > 0:
            offense_rating = offense_weighted_sum / offense_total_weight
            offense_rating = min(99, max(0, round(offense_rating)))
        
        print(f"\nOffense rating calculation:")
        print(f"  Weighted sum: {offense_weighted_sum:.1f}")
        print(f"  Total weight: {offense_total_weight:.2f}")
        print(f"  Offense rating: {offense_rating}")
        
        defense_rating = 0
        defense_components = ['pair_1', 'pair_2', 'pair_3', 'penalty_kill_1', 'penalty_kill_2']
        defense_weights = {c: weights[c] for c in defense_components}
        defense_weighted_sum = 0
        defense_total_weight = 0
        
        for c, w in defense_weights.items():
            if c in component_ratings and component_ratings[c] > 0:
                defense_weighted_sum += component_ratings[c] * w
                defense_total_weight += w
        
        if defense_total_weight > 0:
            defense_rating = defense_weighted_sum / defense_total_weight
            defense_rating = min(99, max(0, round(defense_rating)))
        
        print(f"\nDefense rating calculation:")
        print(f"  Weighted sum: {defense_weighted_sum:.1f}")
        print(f"  Total weight: {defense_total_weight:.2f}")
        print(f"  Defense rating: {defense_rating}")
        
        # Special teams combines PP and PK
        special_teams_rating = 0
        special_teams_components = ['power_play_1', 'power_play_2', 'penalty_kill_1', 'penalty_kill_2', 'other_special_teams']
        special_teams_weights = {c: weights[c] for c in special_teams_components}
        special_teams_weighted_sum = 0
        special_teams_total_weight = 0
        
        for c, w in special_teams_weights.items():
            if c in component_ratings and component_ratings[c] > 0:
                special_teams_weighted_sum += component_ratings[c] * w
                special_teams_total_weight += w
        
        if special_teams_total_weight > 0:
            special_teams_rating = special_teams_weighted_sum / special_teams_total_weight
            special_teams_rating = min(99, max(0, round(special_teams_rating)))
        
        print(f"\nSpecial teams rating calculation:")
        print(f"  Weighted sum: {special_teams_weighted_sum:.1f}")
        print(f"  Total weight: {special_teams_total_weight:.2f}")
        print(f"  Special teams rating: {special_teams_rating}")
        
        # Goaltending is directly from the component rating
        goaltending_rating = component_ratings.get('goaltending', 0)
        print(f"\nGoaltending rating: {goaltending_rating}")
        
        # Final result with all ratings
        team_rating = {
            'overall': overall_rating,
            'offense': offense_rating,
            'defense': defense_rating,
            'special_teams': special_teams_rating,
            'goaltending': goaltending_rating,
            'component_ratings': component_ratings
        }
        
        print("\n--- FINAL TEAM RATINGS ---")
        print(f"  Overall: {team_rating['overall']}")
        print(f"  Offense: {team_rating['offense']}")
        print(f"  Defense: {team_rating['defense']}")
        print(f"  Special Teams: {team_rating['special_teams']}")
        print(f"  Goaltending: {team_rating['goaltending']}")
        
        return team_rating

    def _get_player_name(self, player):
        """Helper to get player name regardless of data structure"""
        if not player or player == 'Empty':
            return 'Empty'
            
        if isinstance(player, dict):
            return player.get('full_name', 
                   player.get('name', 
                   f"{player.get('first_name', '')} {player.get('last_name', '')}"))
        else:
            return getattr(player, 'full_name', 
                   getattr(player, 'name', 
                   f"{getattr(player, 'first_name', '')} {getattr(player, 'last_name', '')}"))
    
    def _get_player_position(self, player):
        """Helper to get player position regardless of data structure"""
        if not player or player == 'Empty':
            return 'N/A'
            
        if isinstance(player, dict):
            return player.get('position_primary', player.get('position', 'Unknown'))
        else:
            return getattr(player, 'position_primary', 
                   getattr(player, 'position', 'Unknown'))
    
    def _apply_chemistry_to_components(self, component_ratings: Dict[str, float]) -> Dict[str, float]:
        """
        Apply chemistry effects to component ratings.
        
        Args:
            component_ratings: Dictionary of component ratings
            
        Returns:
            Adjusted component ratings with chemistry effects
        """
        # If we don't have any chemistry data, return the original ratings
        if not hasattr(self, 'chemistry') or not self.chemistry:
            print("No chemistry data available, skipping chemistry adjustments")
            return component_ratings
            
        print("Applying chemistry effects to component ratings")
        
        # Create a copy of the ratings to modify
        adjusted_ratings = component_ratings.copy()
        
        # Extract chemistry values from the main chemistry data
        chemistry_data = self.chemistry
        
        # Apply forward line chemistry
        if 'forward_lines' in chemistry_data:
            forward_lines = chemistry_data.get('forward_lines', [])
            print(f"Forward line chemistry data: {len(forward_lines)} lines")
            
            for i, line_chem in enumerate(forward_lines):
                line_num = i + 1
                component_key = f'line_{line_num}'
                
                if component_key in adjusted_ratings:
                    # Get chemistry value (scale from -5 to +5)
                    if isinstance(line_chem, dict):
                        chem_value = line_chem.get('chemistry', 0)
                    else:
                        chem_value = line_chem if isinstance(line_chem, (int, float)) else 0
                        
                    # Convert chemistry to a rating adjustment (-2.5 to +2.5)
                    adjustment = chem_value * 0.5
                    print(f"  {component_key} chemistry: {chem_value} → adjustment: {adjustment:+.1f}")
                    
                    # Apply the adjustment
                    base_rating = adjusted_ratings[component_key]
                    adjusted_ratings[component_key] = max(0, min(99, base_rating + adjustment))
        
        # Apply defense pair chemistry            
        if 'defense_pairs' in chemistry_data:
            defense_pairs = chemistry_data.get('defense_pairs', [])
            print(f"Defense pair chemistry data: {len(defense_pairs)} pairs")
            
            for i, pair_chem in enumerate(defense_pairs):
                pair_num = i + 1
                component_key = f'pair_{pair_num}'
                
                if component_key in adjusted_ratings:
                    # Get chemistry value (scale from -5 to +5)
                    if isinstance(pair_chem, dict):
                        chem_value = pair_chem.get('chemistry', 0)
                    else:
                        chem_value = pair_chem if isinstance(pair_chem, (int, float)) else 0
                    
                    # Convert chemistry to a rating adjustment (-2.5 to +2.5)
                    adjustment = chem_value * 0.5
                    print(f"  {component_key} chemistry: {chem_value} → adjustment: {adjustment:+.1f}")
                    
                    # Apply the adjustment
                    base_rating = adjusted_ratings[component_key]
                    adjusted_ratings[component_key] = max(0, min(99, base_rating + adjustment))
        
        # Apply power play chemistry
        if 'power_play' in chemistry_data:
            pp_units = chemistry_data.get('power_play', [])
            print(f"Power play chemistry data: {len(pp_units)} units")
            
            for i, pp_chem in enumerate(pp_units):
                unit_num = i + 1
                component_key = f'power_play_{unit_num}'
                
                if component_key in adjusted_ratings:
                    # Get chemistry value (scale from -5 to +5)
                    if isinstance(pp_chem, dict):
                        chem_value = pp_chem.get('chemistry', 0)
                    else:
                        chem_value = pp_chem if isinstance(pp_chem, (int, float)) else 0
                    
                    # Convert chemistry to a rating adjustment (-2.5 to +2.5)
                    adjustment = chem_value * 0.5
                    print(f"  {component_key} chemistry: {chem_value} → adjustment: {adjustment:+.1f}")
                    
                    # Apply the adjustment
                    base_rating = adjusted_ratings[component_key]
                    adjusted_ratings[component_key] = max(0, min(99, base_rating + adjustment))
        
        # Apply penalty kill chemistry
        if 'penalty_kill' in chemistry_data:
            pk_units = chemistry_data.get('penalty_kill', [])
            print(f"Penalty kill chemistry data: {len(pk_units)} units")
            
            for i, pk_chem in enumerate(pk_units):
                unit_num = i + 1
                component_key = f'penalty_kill_{unit_num}'
                
                if component_key in adjusted_ratings:
                    # Get chemistry value (scale from -5 to +5)
                    if isinstance(pk_chem, dict):
                        chem_value = pk_chem.get('chemistry', 0)
                    else:
                        chem_value = pk_chem if isinstance(pk_chem, (int, float)) else 0
                    
                    # Convert chemistry to a rating adjustment (-2.5 to +2.5)
                    adjustment = chem_value * 0.5
                    print(f"  {component_key} chemistry: {chem_value} → adjustment: {adjustment:+.1f}")
                    
                    # Apply the adjustment
                    base_rating = adjusted_ratings[component_key]
                    adjusted_ratings[component_key] = max(0, min(99, base_rating + adjustment))
        
        # Apply overall chemistry effect to all components
        overall_chemistry = chemistry_data.get('overall', 0)
        if overall_chemistry != 0:
            # Convert to a smaller adjustment factor (-1 to +1)
            overall_adjustment = overall_chemistry * 0.2
            print(f"Overall chemistry: {overall_chemistry} → global adjustment factor: {overall_adjustment:+.1f}")
            
            # Apply a small adjustment to all components
            for component in adjusted_ratings:
                base = adjusted_ratings[component]
                adjusted_ratings[component] = max(0, min(99, base + overall_adjustment))
        
        return adjusted_ratings

    def _apply_coach_overall_bonus(self, overall_rating: float) -> float:
        """
        Apply coach effect to the overall team rating.
        
        Args:
            overall_rating: Base overall rating before coach effect
            
        Returns:
            Adjusted overall rating with coach effect
        """
        if not self.coach_data:
            print("No coach data available, skipping coach adjustments")
            return overall_rating
            
        # Get coach rating and style
        coach_overall = self.coach_data.get('overall', 70)
        coach_style = self.coach_data.get('strategy_type', 'Balanced')
        
        # Calculate coach effect (up to +/- 3 points)
        coach_effect = 0
        
        # Base effect based on coach overall rating
        if coach_overall >= 90:
            coach_effect = 3
        elif coach_overall >= 85:
            coach_effect = 2
        elif coach_overall >= 80:
            coach_effect = 1
        elif coach_overall <= 60:
            coach_effect = -1
        elif coach_overall <= 50:
            coach_effect = -2
            
        print(f"Coach data: {self.coach_data}")
        print(f"Coach overall rating: {coach_overall} → base effect: {coach_effect:+.1f}")
        
        # Style factors - some coach styles may have special effects
        style_effect = 0
        if coach_style == 'Offensive':
            style_effect = 1  # Offensive coaches boost overall slightly
        elif coach_style == 'Defensive':
            style_effect = 0  # Defensive coaches focus on defense, neutral effect on overall
        elif coach_style == 'Players Coach':
            style_effect = 2  # Players coaches boost chemistry and overall
            
        print(f"Coach style: {coach_style} → style effect: {style_effect:+.1f}")
        
        # Final adjustment
        total_effect = coach_effect + style_effect
        print(f"Total coach effect: {total_effect:+.1f}")
        
        # Apply the effect (capped at +/-5)
        total_effect = max(-5, min(5, total_effect))
        
        # Add to the overall rating
        adjusted_rating = overall_rating + total_effect
        
        # Ensure it's within bounds
        adjusted_rating = max(0, min(99, adjusted_rating))
        
        print(f"Final coach adjustment: {overall_rating} + {total_effect:+.1f} = {adjusted_rating}")
        
        return adjusted_rating
    
    def get_optimal_lines(self) -> Dict[str, Any]:
        """
        Get the current optimal lines.
        If none exist, they will be generated.
        
        Returns:
            Dictionary with optimal line combinations
        """
        if not self.optimal_lines:
            return self.generate_optimal_lines()
        return {
            'lines': self.optimal_lines,
            'chemistry': self.chemistry_cache,
            'team_rating': self.team_rating
        }
    
    def update_current_lines(self, lines: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update the current line combinations with user changes.
        
        Args:
            lines: New line combinations
            
        Returns:
            Updated line data with chemistry calculations
        """
        # Store the new lines
        self.current_lines = lines
        
        # Calculate chemistry for the new lines
        line_chemistry = self._calculate_all_chemistry(lines)
        self.chemistry_cache = line_chemistry
        
        # Calculate team rating with the new lines
        self.team_rating = self._calculate_team_rating(lines)
        
        return {
            'lines': self.current_lines,
            'chemistry': line_chemistry,
            'team_rating': self.team_rating
        }
    
    def simulate_game_effects(self, minutes_played: Dict[str, float]) -> None:
        """
        Simulate the effects of playing a game on chemistry.
        Updates the time played together for the current lines.
        
        Args:
            minutes_played: Dictionary with minutes played for each line/pair
        """
        # Update time played for forward lines
        for i, line in enumerate(self.current_lines.get('forward_lines', [])):
            line_key = f'line{i+1}'
            if line_key in minutes_played:
                players = [line.get('LW'), line.get('C'), line.get('RW')]
                self.chemistry_calculator.update_time_played(players, minutes_played[line_key])
                
        # Update time played for defense pairs
        for i, pair in enumerate(self.current_lines.get('defense_pairs', [])):
            pair_key = f'pair{i+1}'
            if pair_key in minutes_played:
                players = [pair.get('LD'), pair.get('RD')]
                self.chemistry_calculator.update_time_played(players, minutes_played[pair_key])
                
        # Update special teams units
        for unit_key in ['pp1', 'pp2', 'pk1', 'pk2']:
            if unit_key in minutes_played:
                if unit_key.startswith('pp'):
                    unit_idx = int(unit_key[-1]) - 1
                    if unit_idx < 2:
                        unit_name = f'power_play_{unit_idx+1}'
                        unit = self.current_lines.get(unit_name, {})
                        forwards = unit.get('forwards', [])
                        defense = unit.get('defense', [])
                        self.chemistry_calculator.update_time_played(forwards, minutes_played[unit_key])
                        self.chemistry_calculator.update_time_played(defense, minutes_played[unit_key])
                elif unit_key.startswith('pk'):
                    unit_idx = int(unit_key[-1]) - 1
                    if unit_idx < 2:
                        unit_name = f'penalty_kill_{unit_idx+1}'
                        unit = self.current_lines.get(unit_name, {})
                        forwards = unit.get('forwards', [])
                        defense = unit.get('defense', [])
                        self.chemistry_calculator.update_time_played(forwards, minutes_played[unit_key])
                        self.chemistry_calculator.update_time_played(defense, minutes_played[unit_key])
                        
        # Recalculate chemistry after updating time played
        self.chemistry_cache = self._calculate_all_chemistry(self.current_lines)
        
    def get_line_deployment(self, situation: str, opponent_coach=None) -> Dict[str, float]:
        """
        Get line deployment recommendations based on game situation and coach preferences.
        
        Args:
            situation: Game situation (e.g., 'leading', 'trailing', 'tied')
            opponent_coach: Optional opponent coach for matchup calculations
            
        Returns:
            Dictionary with ice time percentages for each line
        """
        if not self.coach_strategy:
            # Default even deployment if no coach
            return {
                'line1': 0.25, 'line2': 0.25, 'line3': 0.25, 'line4': 0.25,
                'pair1': 0.33, 'pair2': 0.33, 'pair3': 0.33
            }
            
        # Get base line weights from coach preferences
        base_weights = self.coach_strategy.get_line_weights()
        
        # Adjust based on game situation
        situational_adjustments = self.coach_strategy.get_situational_adjustment(situation)
        
        # Apply adjustments to base weights
        deployment = {}
        forward_total = 0
        defense_total = 0
        
        # Apply adjustments to forward lines
        for i in range(1, 5):
            line_key = f'line{i}'
            weight_key = f'first_line' if i == 1 else f'second_line' if i == 2 else f'third_line' if i == 3 else 'fourth_line'
            if weight_key in base_weights and line_key in situational_adjustments:
                deployment[line_key] = base_weights[weight_key] * situational_adjustments[line_key]
                forward_total += deployment[line_key]
                
        # Apply adjustments to defense pairs
        for i in range(1, 4):
            pair_key = f'pair{i}'
            weight_key = f'first_pair' if i == 1 else f'second_pair' if i == 2 else 'third_pair'
            if weight_key in base_weights and pair_key in situational_adjustments:
                deployment[pair_key] = base_weights[weight_key] * situational_adjustments[pair_key]
                defense_total += deployment[pair_key]
        
        # Normalize to ensure percentages sum to 1
        if forward_total > 0:
            for i in range(1, 5):
                line_key = f'line{i}'
                if line_key in deployment:
                    deployment[line_key] /= forward_total
                    
        if defense_total > 0:
            for i in range(1, 4):
                pair_key = f'pair{i}'
                if pair_key in deployment:
                    deployment[pair_key] /= defense_total
                    
        # Include special teams deployment directly from coach weights
        for key in ['pp1', 'pp2', 'pk1', 'pk2']:
            if key in base_weights:
                deployment[key] = base_weights[key]
                
        return deployment
    
    def get_matchup_recommendations(self, opponent_lines: Dict[str, Any], is_home_team: bool) -> Dict[str, Any]:
        """
        Get line matchup recommendations against an opponent's lines.
        
        Args:
            opponent_lines: The opponent's line combinations
            is_home_team: Whether this team is the home team (for last change advantage)
            
        Returns:
            Dictionary with matchup recommendations
        """
        if not self.coach_strategy:
            # Default balanced matchups if no coach
            return {
                'forward_matchups': {},
                'defense_matchups': {}
            }
            
        # Get matchup recommendations from coach strategy
        return self.coach_strategy.optimize_matchups(
            self.current_lines or self.optimal_lines,
            opponent_lines,
            is_home_team
        )
    
    def save_line_preset(self, preset_name: str = "Default") -> bool:
        """
        Save the current line combinations as a preset.
        
        Args:
            preset_name: Name to give the preset
            
        Returns:
            Boolean indicating success
        """
        return self.line_optimizer.save_line_preset(preset_name)
    
    def load_line_preset(self, preset_name: str = "Default") -> bool:
        """
        Load a saved line preset.
        
        Args:
            preset_name: Name of the preset to load
            
        Returns:
            Boolean indicating success
        """
        success = self.line_optimizer.load_line_preset(preset_name)
        if success:
            # Update current lines with the loaded preset
            self.current_lines = self.line_optimizer.lines
            # Recalculate chemistry
            self.chemistry_cache = self._calculate_all_chemistry(self.current_lines)
            # Recalculate team rating
            self.team_rating = self._calculate_team_rating(self.current_lines)
        return success
        
    def save_team_overall_to_database(self) -> Dict[str, Any]:
        """
        Get the team's overall rating.
        This combines player ratings and chemistry to create team ratings.
        NOTE: This method no longer updates the database - it simply calculates and returns ratings.
        
        Returns:
            Dictionary with team rating information
        """
        try:
            # Get the latest team rating
            if not self.team_rating:
                print(f"\n=== Calculating ratings for {self.team_abbreviation} ===")
                self.team_rating = self._calculate_team_rating(self.current_lines or self.optimal_lines)
            
            # Extract all ratings
            overall_rating = round(self.team_rating.get('overall', 0), 1)
            offense_rating = round(self.team_rating.get('offense', 0), 1)
            defense_rating = round(self.team_rating.get('defense', 0), 1)
            special_teams_rating = round(self.team_rating.get('special_teams', 0), 1)
            goaltending_rating = round(self.team_rating.get('goaltending', 0), 1)
            
            print(f"\n=== TEAM RATINGS ===")
            print(f"Team: {self.team_abbreviation}")
            print(f"Overall: {overall_rating}")
            print(f"Offense: {offense_rating}")
            print(f"Defense: {defense_rating}")
            print(f"Special Teams: {special_teams_rating}")
            print(f"Goaltending: {goaltending_rating}")
            
            print("\nComponent ratings:")
            for comp, rating in sorted(self.team_rating.get('component_ratings', {}).items()):
                print(f"  {comp}: {rating}")
            
            # Skip database update - Team table doesn't have these columns yet
            # Just return the calculated ratings instead
            
            return self.team_rating
            
        except Exception as e:
            print(f"Exception calculating team ratings: {e}")
            traceback.print_exc()
            return self.team_rating

    def get_player_rating(self, player) -> float:
        """
        Extract player rating regardless of data structure.
        This function tries various ways to get a player's overall rating.
        
        Args:
            player: Player object or dictionary
            
        Returns:
            Numerical rating value
        """
        if not player or player == 'Empty':
            return 0
        
        # For debugging purposes
        if self.debug:
            print(f"\n---RATING EXTRACTION DEBUG---")
            if isinstance(player, dict):
                print(f"Player dict keys: {list(player.keys())}")
                print(f"Player type: Dictionary")
                if 'first_name' in player and 'last_name' in player:
                    print(f"Player: {player.get('first_name', '')} {player.get('last_name', '')}")
                elif 'name' in player:
                    print(f"Player: {player.get('name', '')}")
            else:
                print(f"Player type: {type(player)}")
                print(f"Player attributes: {dir(player)}")
            
        # Dictionary player handling
        if isinstance(player, dict):
            # Get name for logging
            player_name = player.get('full_name', 
                          player.get('last_name', 
                          player.get('name', 
                          f"{player.get('first_name', '')} {player.get('last_name', '')}")))
            position = player.get('position_primary', player.get('position', 'Unknown'))
            
            # Check for the most common rating fields
            for field in ['overall_rating', 'overall', 'card_overall', 'rating', 'ovr']:
                if field in player:
                    # Check if field has a valid value
                    if player[field] is not None:
                        try:
                            # Convert to float if it's a string
                            rating_value = float(player[field]) if isinstance(player[field], str) else player[field]
                            if self.debug:
                                print(f"Found rating in '{field}': {rating_value}")
                            
                            # Validate the rating value is reasonable
                            if isinstance(rating_value, (int, float)) and 0 <= rating_value <= 100:
                                return rating_value
                            else:
                                if self.debug:
                                    print(f"Rating value {rating_value} from field '{field}' is out of range (0-100)")
                        except (ValueError, TypeError):
                            if self.debug:
                                print(f"Could not convert '{field}' value: {player[field]} to number")
                    elif self.debug:
                        print(f"Field '{field}' exists but is None")
            
            # If no rating found in primary fields, check all numeric fields as a fallback
            for key, value in player.items():
                if key.lower().find('rating') >= 0 or key.lower().find('overall') >= 0:
                    if value is not None:
                        try:
                            rating_value = float(value) if isinstance(value, str) else value
                            if self.debug:
                                print(f"Found rating in secondary field '{key}': {rating_value}")
                            if isinstance(rating_value, (int, float)) and 0 <= rating_value <= 100:
                                return rating_value
                        except (ValueError, TypeError):
                            pass
            
            # As a last resort, look for any numeric field that might be a rating
            numeric_fields = {}
            for key, value in player.items():
                try:
                    if value is not None and isinstance(value, (int, float)) and 0 <= value <= 100:
                        numeric_fields[key] = value
                except (ValueError, TypeError):
                    pass
            
            if numeric_fields and self.debug:
                print(f"All numeric fields that could be ratings: {numeric_fields}")
                
            # If we have any skill attributes, average them as a last resort
            skill_fields = ['skating', 'shooting', 'passing', 'puck_skills', 'defense', 'physical', 'hands', 'checking']
            skill_values = []
            
            for field in skill_fields:
                if field in player and player[field] is not None:
                    try:
                        value = float(player[field]) if isinstance(player[field], str) else player[field]
                        if isinstance(value, (int, float)) and 0 <= value <= 100:
                            skill_values.append(value)
                    except (ValueError, TypeError):
                        pass
            
            if skill_values:
                avg_rating = sum(skill_values) / len(skill_values)
                if self.debug:
                    print(f"No rating field found, calculated from skill attributes: {avg_rating:.1f}")
                return avg_rating
                
        # Object player handling (SQLAlchemy model)
        else:
            # Try to get player name for better logging
            if hasattr(player, 'full_name'):
                player_name = player.full_name
            elif hasattr(player, 'last_name'):
                player_name = player.last_name
                if hasattr(player, 'first_name'):
                    player_name = f"{player.first_name} {player_name}"
            else:
                player_name = str(player)
                
            if hasattr(player, 'position_primary'):
                position = player.position_primary
            elif hasattr(player, 'position'):
                position = player.position
            else:
                position = 'Unknown'
                
            # Check common rating attributes
            for attr in ['overall_rating', 'overall', 'card_overall', 'rating', 'ovr']:
                if hasattr(player, attr):
                    val = getattr(player, attr)
                    if val is not None:
                        try:
                            rating_value = float(val) if isinstance(val, str) else val
                            if self.debug:
                                print(f"Found rating in attribute '{attr}': {rating_value}")
                            if isinstance(rating_value, (int, float)) and 0 <= rating_value <= 100:
                                return rating_value
                        except (ValueError, TypeError):
                            if self.debug:
                                print(f"Could not convert '{attr}' value to number")
            
            # Check if the object has a to_dict method
            if hasattr(player, 'to_dict') and callable(getattr(player, 'to_dict')):
                try:
                    player_dict = player.to_dict()
                    # Now search through the dictionary
                    for field in ['overall_rating', 'overall', 'card_overall', 'rating', 'ovr']:
                        if field in player_dict and player_dict[field] is not None:
                            try:
                                rating_value = float(player_dict[field]) if isinstance(player_dict[field], str) else player_dict[field]
                                if self.debug:
                                    print(f"Found rating in to_dict() field '{field}': {rating_value}")
                                if isinstance(rating_value, (int, float)) and 0 <= rating_value <= 100:
                                    return rating_value
                            except (ValueError, TypeError):
                                pass
                except Exception as e:
                    if self.debug:
                        print(f"Error calling to_dict(): {e}")
            
            # Try to find any attribute with 'rating' or 'overall' in the name
            for attr_name in dir(player):
                if 'rating' in attr_name.lower() or 'overall' in attr_name.lower():
                    try:
                        val = getattr(player, attr_name)
                        if val is not None:
                            rating_value = float(val) if isinstance(val, str) else val
                            if self.debug:
                                print(f"Found rating in attribute '{attr_name}': {rating_value}")
                            if isinstance(rating_value, (int, float)) and 0 <= rating_value <= 100:
                                return rating_value
                    except (ValueError, TypeError, AttributeError):
                        pass
        
        # If we reach here, we couldn't find a valid rating
        if self.debug:
            if isinstance(player, dict):
                print(f"Could not find rating for player {player_name} ({position})")
                print(f"Player details: {player}")
            else:
                print(f"Could not find rating for player {player_name} ({position})")
                
        # Default rating if nothing found - use 75 as a reasonable mid-range value
        return 75.0

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
        print(f"Team rating: TeamFormation service initialized for {team_abbreviation}")
        
        # Initialize and fetch player and coach data
        init_success = formation.initialize()
        print(f"Team rating: TeamFormation initialization success: {init_success}")
        
        if not init_success:
            print(f"Failed to initialize team data for {team_abbreviation}, returning default ratings")
            # Return default ratings instead of 404 error
            default_rating = {
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
            return jsonify(default_rating), 200
            
        # Generate optimal lines to get team rating
        print(f"Generating optimal lines to get team rating for {team_abbreviation}")
        lines_data = formation.generate_optimal_lines()
        
        # Get team ratings without saving to database
        ratings = formation.save_team_overall_to_database()
        print(f"Successfully calculated team rating for {team_abbreviation}")
        
        return jsonify(lines_data.get('team_rating', {})), 200
    except Exception as e:
        print(f"Error calculating team rating: {e}")
        traceback.print_exc()
        
        # Return default ratings in case of any error
        default_rating = {
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
        return jsonify(default_rating), 200

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
                    
                    # Just get ratings without saving to database
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

@team_rating_bp.route("/update-team-overall/<team_abbreviation>", methods=['GET'])
def update_team_overall_rating(team_abbreviation):
    """Update team overall rating in the database."""
    try:
        # Initialize the team formation service with debug mode enabled
        print(f"\n=== ENDPOINT: update_team_overall_rating for {team_abbreviation} ===")
        formation = TeamFormation(team_abbreviation, debug=True)
        print(f"Created TeamFormation with debug mode enabled")
        
        # Initialize and fetch player and coach data
        init_success = formation.initialize()
        print(f"TeamFormation initialization success: {init_success}")
        
        if not init_success:
            print(f"Failed to initialize team data for {team_abbreviation}, returning default ratings")
            # Return default ratings instead of an error
            # This allows the frontend to still display something
            default_rating = {
                'overall_rating': 75,
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
            
        # Generate optimal lines to get team rating
        print(f"Generating optimal lines to get team rating")
        lines_data = formation.generate_optimal_lines()
        
        # Debug information
        print(f"Team data: {formation.team_data}")
        print(f"Roster size: {len(formation.roster)}")
        print(f"Forward count: {len(formation.forwards)}")
        print(f"Defense count: {len(formation.defensemen)}")
        print(f"Goalie count: {len(formation.goalies)}")
        
        # Get team ratings without saving to database
        ratings = formation.save_team_overall_to_database()
        print(f"Team ratings calculated: {ratings}")
        
        # Format for frontend
        response = {
            'overall_rating': ratings.get('overall', 75),
            'offense': ratings.get('offense', 75),
            'defense': ratings.get('defense', 75),
            'special_teams': ratings.get('special_teams', 75),
            'goaltending': ratings.get('goaltending', 75),
            'component_ratings': ratings.get('component_ratings', {})
        }
        
        return jsonify(response), 200
    except Exception as e:
        print(f"Error updating team overall: {e}")
        traceback.print_exc()
        
        # Return default ratings in case of any error
        default_rating = {
            'overall_rating': 75,
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

@game_bp.route('/team_rating_debug/<string:team_abbreviation>', methods=['GET'])
def debug_team_rating(team_abbreviation):
    """
    Debug endpoint that returns detailed information about team rating calculations
    to help identify discrepancies between frontend and backend.
    """
    try:
        print(f"Debugging team rating for {team_abbreviation}")
        
        # Create the team formation service in debug mode
        formation = TeamFormation(team_abbreviation, debug=True)
        
        # Get the team roster from the database
        formation.get_current_roster()
        
        # Get the current lines
        lines = formation.get_current_lines()
        
        # Calculate the team rating with detailed breakdown
        rating_data = formation.save_team_overall_to_database()
        
        # Add raw player data for debugging
        player_data = []
        for player in formation.roster:
            if player:
                try:
                    # Extract relevant player data for debugging
                    player_info = {
                        'name': f"{player.get('first_name', '')} {player.get('last_name', '')}".strip(),
                        'position': player.get('position_primary', 'Unknown'),
                        'rating': formation.get_player_rating(player),
                        'id': player.get('id', 'Unknown')
                    }
                    player_data.append(player_info)
                except Exception as e:
                    print(f"Error extracting player data: {e}")
        
        # Return all the debug data
        return jsonify({
            'team': team_abbreviation,
            'ratings': rating_data,
            'lines': lines,
            'players': player_data,
            'success': True
        })
    
    except Exception as e:
        print(f"Exception in debug endpoint: {e}")
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@team_rating_bp.route('/debug_player_ratings/<string:team_abbreviation>', methods=['GET'])
def debug_player_ratings(team_abbreviation):
    """
    Debug endpoint specifically for testing player rating extraction.
    This will help identify if the player ratings are being correctly interpreted.
    """
    try:
        print(f"\n==== DEBUG PLAYER RATINGS FOR {team_abbreviation} ====\n")
        
        # Create the team formation service with debug mode enabled
        formation = TeamFormation(team_abbreviation, debug=True)
        
        # Test Supabase connection directly
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        print(f"Supabase URL: {supabase_url}")
        print(f"Supabase Key present: {'Yes' if supabase_key else 'No'}")
        
        debug_data = {
            "team": team_abbreviation,
            "supabase_connection": {
                "url_available": bool(supabase_url),
                "key_available": bool(supabase_key)
            },
            "test_queries": {},
            "players": [],
            "success": True
        }
        
        # Create a client for direct testing
        try:
            client = create_supabase_client()
            print(f"Created Supabase client: {client}")
            debug_data["supabase_connection"]["client_created"] = True
            
            # Direct query test
            print("\nTesting direct Supabase query to Player table:")
            try:
                response = client.table('Player').select('*').limit(3).execute()
                if hasattr(response, 'data'):
                    print(f"  Direct Player query returned {len(response.data)} sample players")
                    debug_data["test_queries"]["sample_query"] = {
                        "success": True,
                        "count": len(response.data)
                    }
                    if response.data:
                        sample = response.data[0]
                        print(f"  Sample player: {sample.get('first_name', '')} {sample.get('last_name', '')}, team: {sample.get('team', '')}")
                        debug_data["test_queries"]["sample_query"]["example"] = {
                            "first_name": sample.get('first_name', ''),
                            "last_name": sample.get('last_name', ''),
                            "team": sample.get('team', ''),
                            "team_id": sample.get('team_id', ''),
                            "overall_rating": sample.get('overall_rating', None),
                            "position": sample.get('position_primary', sample.get('position', '')),
                            "available_fields": list(sample.keys())
                        }
                else:
                    print(f"  Direct Player query response has no data attribute: {response}")
                    debug_data["test_queries"]["sample_query"] = {
                        "success": False,
                        "error": "Response has no data attribute"
                    }
            except Exception as direct_query_error:
                print(f"  Error in direct Player query: {direct_query_error}")
                debug_data["test_queries"]["sample_query"] = {
                    "success": False,
                    "error": str(direct_query_error)
                }
                
            # Test query for the specific team by abbreviation
            print(f"\nTesting direct query for {team_abbreviation} players by team field:")
            try:
                team_response = client.table('Player').select('*').eq('team', team_abbreviation).execute()
                if hasattr(team_response, 'data'):
                    print(f"  Team '{team_abbreviation}' query by team field returned {len(team_response.data)} players")
                    debug_data["test_queries"]["team_abbr_query"] = {
                        "success": True,
                        "count": len(team_response.data)
                    }
                    if team_response.data:
                        # Add these players to our debug output
                        team_players = []
                        print("  Players found by team field:")
                        for player in team_response.data:
                            player_name = f"{player.get('first_name', '')} {player.get('last_name', '')}"
                            print(f"    - {player_name}, position: {player.get('position_primary', '')}, rating: {player.get('overall_rating')}")
                            team_players.append({
                                "name": player_name,
                                "position": player.get('position_primary', player.get('position', '')),
                                "team": player.get('team', ''),
                                "overall_rating": player.get('overall_rating', None)
                            })
                        debug_data["test_queries"]["team_abbr_query"]["players"] = team_players
                        
                        # Save all full players for rating extraction testing
                        debug_data["players"] = team_response.data
                else:
                    print(f"  Team query response has no data attribute: {team_response}")
                    debug_data["test_queries"]["team_abbr_query"] = {
                        "success": False,
                        "error": "Response has no data attribute"
                    }
            except Exception as team_query_error:
                print(f"  Error in team query: {team_query_error}")
                debug_data["test_queries"]["team_abbr_query"] = {
                    "success": False,
                    "error": str(team_query_error)
                }
            
            # Try to get team_id
            team_id = None
            try:
                team_info_response = client.table('Team').select('*').eq('abbreviation', team_abbreviation).execute()
                if hasattr(team_info_response, 'data') and team_info_response.data:
                    team_info = team_info_response.data[0]
                    team_id = team_info.get('id')
                    print(f"  Found team_id {team_id} for {team_abbreviation}")
                    debug_data["team_info"] = {
                        "id": team_id,
                        "name": team_info.get('name'),
                        "city": team_info.get('city')
                    }
                    
                    # Now try querying with team_id
                    if team_id:
                        print(f"\nTesting direct query for {team_abbreviation} players by team_id {team_id}:")
                        try:
                            team_id_response = client.table('Player').select('*').eq('team_id', team_id).execute()
                            if hasattr(team_id_response, 'data'):
                                print(f"  Team '{team_abbreviation}' query by team_id returned {len(team_id_response.data)} players")
                                debug_data["test_queries"]["team_id_query"] = {
                                    "success": True,
                                    "count": len(team_id_response.data)
                                }
                                if team_id_response.data and not debug_data["players"]:
                                    debug_data["players"] = team_id_response.data
                            else:
                                print(f"  Team_id query response has no data attribute: {team_id_response}")
                                debug_data["test_queries"]["team_id_query"] = {
                                    "success": False,
                                    "error": "Response has no data attribute"
                                }
                        except Exception as team_id_query_error:
                            print(f"  Error in team_id query: {team_id_query_error}")
                            debug_data["test_queries"]["team_id_query"] = {
                                "success": False,
                                "error": str(team_id_query_error)
                            }
                else:
                    print(f"  Could not find team_id for {team_abbreviation}")
                    debug_data["team_info"] = {
                        "error": f"Could not find team with abbreviation {team_abbreviation}"
                    }
            except Exception as team_info_error:
                print(f"  Error getting team info: {team_info_error}")
                debug_data["team_info"] = {
                    "error": str(team_info_error)
                }
        except Exception as client_error:
            print(f"Error creating Supabase client: {client_error}")
            traceback.print_exc()
            debug_data["supabase_connection"] = {
                "client_created": False,
                "error": str(client_error)
            }
        
        # If we have players from direct queries, test rating extraction
        if debug_data["players"]:
            print("\nTesting player rating extraction with found players:")
            ratings_test = []
            total_rating = 0
            count = 0
            
            for player in debug_data["players"]:
                if player:
                    rating = formation.get_player_rating(player)
                    name = f"{player.get('first_name', '')} {player.get('last_name', '')}"
                    position = player.get('position_primary', player.get('position', ''))
                    
                    print(f"  {name} ({position}): extracted rating = {rating}")
                    ratings_test.append({
                        "name": name,
                        "position": position,
                        "extracted_rating": rating,
                        "raw_overall_rating": player.get('overall_rating'),
                        "raw_overall": player.get('overall')
                    })
                    
                    if rating > 0:
                        total_rating += rating
                        count += 1
            
            debug_data["rating_extraction"] = {
                "players": ratings_test,
                "average": round(total_rating / count, 1) if count > 0 else 0,
                "count": count
            }
        
        # If the TeamFormation initialization worked, add that info too
        init_success = formation.initialize()
        debug_data["formation_initialized"] = init_success
        if init_success:
            debug_data["formation_player_count"] = len(formation.roster)
        
        return jsonify(debug_data)
        
    except Exception as e:
        print(f"Error in debug_player_ratings: {e}")
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

# Main block for direct execution and testing
if __name__ == "__main__":
    import sys
    import traceback
    from collections import namedtuple
    
    # Create a simple player class
    Player = namedtuple('Player', ['full_name', 'last_name', 'position_primary', 'position', 'overall', 'chemistry_fit', 'is_starter'])
    
    # Get the team abbreviation from the command line or default to "MTL"
    team_abbreviation = sys.argv[1] if len(sys.argv) > 1 else "MTL"
    
    print(f"\n===== TESTING TEAM RATING CALCULATION FOR {team_abbreviation} =====")
    print("Using hardcoded test data - NO DATABASE CONNECTION REQUIRED\n")
    
    try:
        # Create test players for each position
        forwards = [
            Player("Nick Suzuki", "Suzuki", "C", "C", 90, 5, False),
            Player("Cole Caufield", "Caufield", "RW", "RW", 87, 4, False),
            Player("Juraj Slafkovsky", "Slafkovsky", "LW", "LW", 85, 4, False),
            Player("Patrik Laine", "Laine", "LW", "LW", 85, 2, False),
            Player("Brendan Gallagher", "Gallagher", "RW", "RW", 83, 3, False),
            Player("Jake Evans", "Evans", "C", "C", 83, 3, False),
            Player("Emil Heineman", "Heineman", "LW", "LW", 82, 2, False),
            Player("Alex Newhook", "Newhook", "C", "C", 83, 3, False),
            Player("Josh Anderson", "Anderson", "RW", "RW", 83, 4, False),
            Player("Rafael Harvey-Pinard", "Harvey-Pinard", "LW", "LW", 80, 2, False),
            Player("Christian Dvorak", "Dvorak", "C", "C", 82, 1, False),
            Player("Joel Armia", "Armia", "RW", "RW", 81, 1, False)
        ]
        
        defensemen = [
            Player("Mike Matheson", "Matheson", "LD", "LD", 85, 4, False),
            Player("Lane Hutson", "Hutson", "LD", "LD", 87, 5, False),
            Player("Kaiden Guhle", "Guhle", "LD", "LD", 84, 3, False),
            Player("Alexandre Carrier", "Carrier", "RD", "RD", 83, 3, False),
            Player("David Savard", "Savard", "RD", "RD", 80, 2, False),
            Player("Jayden Struble", "Struble", "LD", "LD", 80, 2, False)
        ]
        
        goalies = [
            Player("Samuel Montembeault", "Montembeault", "G", "G", 85, 0, True),
            Player("Cayden Primeau", "Primeau", "G", "G", 81, 0, False)
        ]
        
        # Test the get_player_rating function directly
        print("\n===== TESTING PLAYER RATING EXTRACTION =====")
        
        def get_player_rating(player):
            """Extract player rating regardless of data structure"""
            if not player or player == 'Empty':
                return 0
            
            player_name = ""
            player_position = ""
            player_rating = 0
            
            # Try to get player name for logging
            if isinstance(player, dict):
                player_name = player.get('full_name', player.get('last_name', player.get('name', player.get('first_name', 'Unknown'))))
                player_position = player.get('position_primary', player.get('position', 'Unknown'))
                
                if self.debug:
                    print(f"  PLAYER DICT KEYS: {list(player.keys())}")
                    print(f"  Player: {player_name} ({player_position})")
                
                # Check common rating fields in order of preference
                for field in ['overall_rating', 'overall', 'card_overall', 'rating', 'ovr']:
                    if field in player:
                        if isinstance(player[field], (int, float)):
                            player_rating = player[field]
                            if self.debug:
                                print(f"  Player: {player_name} ({player_position}) - Found rating in field '{field}': {player_rating}")
                            return player_rating
                        elif player[field] is not None:
                            # Try to convert to number if it's a string representation
                            try:
                                player_rating = float(player[field])
                                if self.debug:
                                    print(f"  Player: {player_name} ({player_position}) - Converted '{field}' from {type(player[field])} to number: {player_rating}")
                                return player_rating
                            except (ValueError, TypeError):
                                if self.debug:
                                    print(f"  Player: {player_name} ({player_position}) - Could not convert '{field}' value: {player[field]} to number")
                
            # Handle object-like players (e.g., SQLAlchemy models)
            else:
                if hasattr(player, 'full_name'):
                    player_name = player.full_name
                elif hasattr(player, 'last_name'):
                    player_name = player.last_name
                else:
                    player_name = 'Unknown'
                    
                if hasattr(player, 'position_primary'):
                    player_position = player.position_primary
                elif hasattr(player, 'position'):
                    player_position = player.position
                else:
                    player_position = 'Unknown'
                
                if self.debug:
                    print(f"  Player object: {player_name} ({player_position})")
                
                # Check attributes in order of preference
                for attr in ['overall_rating', 'overall', 'card_overall', 'rating', 'ovr']:
                    if hasattr(player, attr):
                        val = getattr(player, attr)
                        if isinstance(val, (int, float)):
                            player_rating = val
                            if self.debug:
                                print(f"  Player: {player_name} ({player_position}) - Found rating in attribute '{attr}': {player_rating}")
                            return player_rating
                        elif val is not None:
                            # Try to convert to number if it's a string representation
                            try:
                                player_rating = float(val)
                                if self.debug:
                                    print(f"  Player: {player_name} ({player_position}) - Converted '{attr}' from {type(val)} to number: {player_rating}")
                                return player_rating
                            except (ValueError, TypeError):
                                if self.debug:
                                    print(f"  Player: {player_name} ({player_position}) - Could not convert '{attr}' value: {val} to number")
            
            # As a last resort, check for "to_dict" method that might contain rating
            if hasattr(player, 'to_dict') and callable(getattr(player, 'to_dict')):
                try:
                    player_dict = player.to_dict()
                    for field in ['overall_rating', 'overall', 'card_overall', 'rating', 'ovr']:
                        if field in player_dict and isinstance(player_dict[field], (int, float)):
                            player_rating = player_dict[field]
                            if self.debug:
                                print(f"  Player: {player_name} ({player_position}) - Found rating in to_dict() field '{field}': {player_rating}")
                            return player_rating
                except Exception as e:
                    if self.debug:
                        print(f"  Error calling to_dict(): {e}")
            
            # If we get here, we couldn't find a valid rating
            if self.debug:
                print(f"  Player: {player_name} ({player_position}) - Could not find rating, using default 75")
                if isinstance(player, dict):
                    print(f"  PLAYER DICT CONTENTS: {player}")
                else:
                    print(f"  PLAYER OBJECT DIR: {dir(player)}")
            
            # Default to 75 if no rating found (better than 0)
            return 75
        
        # Test with different player formats
        print("\nNamed Tuple Players:")
        for p in forwards[:3] + defensemen[:2] + goalies[:1]:
            get_player_rating(p)
            
        print("\nDictionary Players:")
        dict_players = [
            {"full_name": "Nick Suzuki", "position_primary": "C", "overall": 90},
            {"last_name": "Caufield", "position": "RW", "overall_rating": 87},
            {"full_name": "Slafkovsky", "position_primary": "LW", "card_overall": 85},
            {"last_name": "Harvey-Pinard", "position": "LW", "rating": 80},
            {"full_name": "Mystery Player", "position_primary": "C"}
        ]
        for p in dict_players:
            get_player_rating(p)
            
        print("\n===== MANUALLY CALCULATING LINE RATINGS =====")
        
        # Calculate line 1 rating
        line1_players = [forwards[2], forwards[0], forwards[1]]  # LW, C, RW
        line1_ratings = [get_player_rating(p) for p in line1_players]
        line1_avg = sum(line1_ratings) / len(line1_ratings)
        print(f"\nLine 1 Average: {line1_avg:.1f} from {line1_ratings}")
        
        # Calculate defense pair 1 rating
        pair1_players = [defensemen[1], defensemen[0]]  # LD, RD
        pair1_ratings = [get_player_rating(p) for p in pair1_players]
        pair1_avg = sum(pair1_ratings) / len(pair1_ratings)
        print(f"\nDefense Pair 1 Average: {pair1_avg:.1f} from {pair1_ratings}")
        
        # Calculate goalie rating
        goalie_ratings = [get_player_rating(p) for p in goalies if getattr(p, 'is_starter', False)]
        if goalie_ratings:
            goalie_avg = sum(goalie_ratings) / len(goalie_ratings)
            print(f"\nGoalie Average: {goalie_avg:.1f} from {goalie_ratings}")
        
        print("\n===== CHEMISTRY EFFECTS =====")
        
        # Define some sample chemistry values
        line_chemistry = 5  # +5% boost
        defense_chemistry = 4  # +4% boost
        
        chemistry_line1_modifier = 1.0 + (line_chemistry / 100)
        chemistry_pair1_modifier = 1.0 + (defense_chemistry / 100)
        
        line1_with_chemistry = line1_avg * chemistry_line1_modifier
        pair1_with_chemistry = pair1_avg * chemistry_pair1_modifier
        
        print(f"Line 1 with Chemistry (+{line_chemistry}%): {line1_avg:.1f} → {line1_with_chemistry:.1f}")
        print(f"Pair 1 with Chemistry (+{defense_chemistry}%): {pair1_avg:.1f} → {pair1_with_chemistry:.1f}")
        
        print("\n===== WEIGHTED CALCULATIONS =====")
        
        # Define sample weights for components
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
        
        # Define sample component ratings
        component_ratings = {
            'line_1': line1_with_chemistry,
            'line_2': 83.5,
            'line_3': 82.7,
            'line_4': 81.0,
            'pair_1': pair1_with_chemistry,
            'pair_2': 83.5,
            'pair_3': 80.0,
            'power_play_1': 85.0,
            'power_play_2': 82.0,
            'penalty_kill_1': 83.0,
            'penalty_kill_2': 81.0,
            'other_special_teams': 75.0,
            'shootout': 85.0,
            'goaltending': goalie_avg if 'goalie_avg' in locals() else 85.0
        }
        
        # Calculate weighted average
        weighted_sum = 0
        total_weight = 0
        
        print("Component Weights:")
        for component, weight in sorted(weights.items()):
            if component in component_ratings:
                contribution = component_ratings[component] * weight
                weighted_sum += contribution
                total_weight += weight
                print(f"  {component}: {component_ratings[component]:.1f} × {weight:.2f} = {contribution:.2f}")
        
        overall_rating = weighted_sum / total_weight
        print(f"\nFinal Overall Rating: {overall_rating:.2f} (rounded: {round(overall_rating)})")
        
        # Coach bonus
        coach_bonus = 1.02  # 2% bonus
        with_coach_bonus = overall_rating * coach_bonus
        print(f"With Coach Bonus (2%): {with_coach_bonus:.2f} (rounded: {round(with_coach_bonus)})")
        
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()