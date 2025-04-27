from typing import Dict, List, Any, Optional, Tuple
import random
import re
from flask import Blueprint, jsonify, request
from ...extensions import db
from datetime import datetime
from ...services.player import Player
from sqlalchemy import text
import pandas as pd
from tabulate import tabulate
import os

# Create a global random seed that stays consistent during app runtime
# This ensures rankings don't change on page refresh but can change when app restarts
RANDOM_SEED = random.randint(1, 10000)
random.seed(RANDOM_SEED)

# Create a blueprint for draft ranking endpoints
draft_ranking_bp = Blueprint('draft_ranking', __name__)

class DraftRankingService:
    """Service for calculating and managing draft prospect rankings"""
    
    # Enable/disable detailed logging
    LOG_ENABLED = False
    
    # Define weight constants for the ranking formula
    WEIGHTS = {
        'overall': 0.35,       # w1
        'potential': 0.3,     # w2
        'height': 0.125,        # w3
        'league': 0.05,        # w4
        'position': 0.125,      # w5
        'country': 0.05,       # w6
    }
    
    # Define position bias values (higher is better)
    POSITION_VALUES = {
        'C': 100,       # Centers most valuable
        'RD': 95.5,       # Right defense next
        'LD': 92.5,       # Left defense
        'RW': 88,       # Wingers
        'LW': 87.5,
        'G': 72.5         # Goalies typically lowest
    }
    
    # Define country risk values (higher is better - lower risk)
    COUNTRY_VALUES = {
        'Canada': 100,
        'Sweden': 100,
        'Finland': 100,
        'United States': 100,
        'Russia': 50,    # Higher risk due to transfer issues
        'Belarus': 50
    }
    
    # Default value for countries not in the list
    DEFAULT_COUNTRY_VALUE = 85
    
    # Define potential mapping to numeric values
    POTENTIAL_VALUES = {
        'Generational': 100,
        'Generational Goalie': 100,
        'Generational Def': 100,
        'Franchise': 90,
        'Franchise Goalie': 90,
        'Franchise Def': 90,
        'Game Breaker': 82,
        'Game Breaker Goalie': 82,
        'Game Breaker Def': 82,
        'Elite': 70,
        'Elite Goalie': 70,
        'Elite Def': 70,
        'Lead Starter': 55,
        'Top Pair': 55,
        'Top Line': 55,
        'Starter': 40,
        'Top 3': 40,
        'Top 6 F': 40,
        'Occasional Starter': 33,
        'Top 4': 33,
        'Middle 6': 33,
        'Backup': 27,
        'Top 6': 27,
        'Bottom 6': 27,
        'Fringe NHLer Goalie': 20,
        'Fringe NHLer Def': 20,
        'Fringe NHLer': 20
    }
    
    # Default value for potential not in the list
    DEFAULT_POTENTIAL_VALUE = 15
    
    # Define volatility mapping to numeric values (higher means less volatile)
    VOLATILITY_VALUES = {
        'minimal': 100,
        'low': 90,
        'medium': 82,
        'high': 60,
        'very high': 50
    }
    
    # Default value for volatility not in the list
    DEFAULT_VOLATILITY_VALUE = 50
    
    # Define potential precision mapping to numeric values (higher means more precise/certain)
    PRECISION_VALUES = {
        'mature': 100,
        'very high': 90,
        'high': 75,
        'medium': 65,
        'low': 50,
        'very low': 35
    }
    
    # Default value for precision not in the list
    DEFAULT_PRECISION_VALUE = 60
    
    @classmethod
    def get_potential_numeric_value(cls, potential: str) -> float:
        """Convert potential string to numeric value"""
        if not potential:
            return cls.DEFAULT_POTENTIAL_VALUE
        
        # Check for direct match
        if potential in cls.POTENTIAL_VALUES:
            return cls.POTENTIAL_VALUES[potential]
        
        # Try to find closest match
        for key in cls.POTENTIAL_VALUES:
            if key.lower() in potential.lower():
                return cls.POTENTIAL_VALUES[key]
        
        return cls.DEFAULT_POTENTIAL_VALUE
    
    @classmethod
    def get_volatility_numeric_value(cls, volatility: str) -> float:
        """Convert volatility string to numeric value"""
        if not volatility:
            return cls.DEFAULT_VOLATILITY_VALUE
            
        volatility = str(volatility).lower()
        
        # Check for direct match
        if volatility in cls.VOLATILITY_VALUES:
            return cls.VOLATILITY_VALUES[volatility]
        
        # Try to find closest match
        for key in cls.VOLATILITY_VALUES:
            if key in volatility:
                return cls.VOLATILITY_VALUES[key]
        
        # If it's a numeric percentage, convert to 0-100 scale
        if volatility.isdigit():
            return float(volatility)
            
        return cls.DEFAULT_VOLATILITY_VALUE
    
    @classmethod
    def get_precision_numeric_value(cls, precision: str) -> float:
        """Convert precision string to numeric value"""
        if not precision:
            return cls.DEFAULT_PRECISION_VALUE
        
        precision = str(precision).lower()
        
        # Check for direct match
        if precision in cls.PRECISION_VALUES:
            return cls.PRECISION_VALUES[precision]
        
        # Try to find closest match
        for key in cls.PRECISION_VALUES:
            if key in precision:
                return cls.PRECISION_VALUES[key]
        
        # If it's a numeric percentage, convert to 0-100 scale
        if precision.isdigit():
            return float(precision)
        
        return cls.DEFAULT_PRECISION_VALUE
    
    @classmethod
    def get_height_value(cls, height: str) -> float:
        """
        Convert height string (like "6'2" or "5'10") to a numeric value
        with clear differentiation between height ranges:
        - 5'8" and under: 0 points
        - 5'9" to 5'10": 30 points
        - 5'11" to 6'1": 50 points
        - 6'2" to 6'4": 75 points
        - 6'5"+: 100 points
        """
        if not height:
            return 50  # Default to average height value
        
        # Try to extract feet and inches using regex
        match = re.search(r"(\d+)'(\d+)", str(height))
        if match:
            feet = int(match.group(1))
            inches = int(match.group(2))
            total_inches = (feet * 12) + inches
            
            # Apply exact height ranges and point values as specified
            if total_inches <= 68:  # 5'8" and under
                return 0
            elif total_inches <= 70:  # 5'9" to 5'10"
                return 30
            elif total_inches <= 73:  # 5'11" to 6'1"
                return 50
            elif total_inches <= 76:  # 6'2" to 6'4"
                return 75
            else:  # 6'5"+
                return 100
        
        # Fallback if format not recognized
        return 50
    
    @classmethod
    def get_position_value(cls, position: str) -> float:
        """Get position bias value"""
        if not position:
            return 80  # Default position value
        
        position = position.upper()
        if position in cls.POSITION_VALUES:
            return cls.POSITION_VALUES[position]
        
        # Handle variations
        if position.startswith('D'):
            return cls.POSITION_VALUES['LD']  # Default to LD if just D
        if position.startswith('G'):
            return cls.POSITION_VALUES['G']
        
        return 80  # Default if position not recognized
    
    @classmethod
    def get_country_value(cls, country: str) -> float:
        """Get country risk value"""
        if not country:
            return cls.DEFAULT_COUNTRY_VALUE
            
        country = str(country).strip()
        
        # Direct match
        if country in cls.COUNTRY_VALUES:
            return cls.COUNTRY_VALUES[country]
        
        # Check for partial matches
        for key in cls.COUNTRY_VALUES:
            if key.lower() in country.lower() or country.lower() in key.lower():
                return cls.COUNTRY_VALUES[key]
        
        return cls.DEFAULT_COUNTRY_VALUE
    
    @classmethod
    def get_league_strength_value(cls, league: str) -> float:
        """
        Get league strength value from the Supabase League table
        with robust error handling and detailed logging
        """
        if not league:
            if cls.LOG_ENABLED:
                print(f"WARNING: Empty league value provided, using default strength (50)")
            return 50  # Default league value if none provided
        
        league = str(league).upper().strip()
        if cls.LOG_ENABLED:
            print(f"Looking up league strength for: '{league}'")
        
        # Always try to fetch from database first
        try:
            from ...supabase_client import get_supabase_client
            supabase = get_supabase_client()
            
            # First try exact match on abbreviation
            if cls.LOG_ENABLED:
                print(f"Attempting exact match on abbreviation: '{league}'")
            response = supabase.table('League') \
                .select('league_strengh, abbreviation, league') \
                .eq('abbreviation', league) \
                .execute()
                
            if response.data and len(response.data) > 0:
                if cls.LOG_ENABLED:
                    print(f"Found match for '{league}': {response.data[0]}")
                if 'league_strengh' in response.data[0] and response.data[0]['league_strengh'] is not None:
                    league_strength = float(response.data[0]['league_strengh'])
                    if cls.LOG_ENABLED:
                        print(f"Successfully extracted league strength: {league_strength}")
                    return league_strength
                else:
                    if cls.LOG_ENABLED:
                        print(f"League entry found but missing league_strengh value")
            else:
                if cls.LOG_ENABLED:
                    print(f"No exact match found for abbreviation: '{league}'")
            
            # If that fails, try a more flexible search with ILIKE
            if cls.LOG_ENABLED:
                print(f"Attempting partial match on abbreviation with ILIKE")
            response = supabase.table('League') \
                .select('league_strengh, abbreviation, league') \
                .ilike('abbreviation', f'%{league}%') \
                .execute()
                
            if response.data and len(response.data) > 0:
                if cls.LOG_ENABLED:
                    print(f"Found partial abbreviation match: {response.data[0]}")
                if 'league_strengh' in response.data[0] and response.data[0]['league_strengh'] is not None:
                    league_strength = float(response.data[0]['league_strengh'])
                    if cls.LOG_ENABLED:
                        print(f"Successfully extracted league strength: {league_strength}")
                    return league_strength
                else:
                    if cls.LOG_ENABLED:
                        print(f"League entry found but missing league_strengh value")
            else:
                if cls.LOG_ENABLED:
                    print(f"No partial abbreviation match found")
                
            # If still not found, try searching by league name
            if cls.LOG_ENABLED:
                print(f"Attempting match on league name")
            response = supabase.table('League') \
                .select('league_strengh, abbreviation, league') \
                .ilike('league', f'%{league}%') \
                .execute()
                
            if response.data and len(response.data) > 0:
                if cls.LOG_ENABLED:
                    print(f"Found match by league name: {response.data[0]}")
                if 'league_strengh' in response.data[0] and response.data[0]['league_strengh'] is not None:
                    league_strength = float(response.data[0]['league_strengh'])
                    if cls.LOG_ENABLED:
                        print(f"Successfully extracted league strength: {league_strength}")
                    return league_strength
                else:
                    if cls.LOG_ENABLED:
                        print(f"League entry found but missing league_strengh value")
            else:
                if cls.LOG_ENABLED:
                    print(f"No league name match found")
            
            # Last attempt - get all leagues and look for any potential matches
            if cls.LOG_ENABLED:
                print(f"Final attempt - retrieving all leagues for manual comparison")
            response = supabase.table('League') \
                .select('league_strengh, abbreviation, league') \
                .execute()
                
            if response.data and len(response.data) > 0:
                if cls.LOG_ENABLED:
                    print(f"Retrieved {len(response.data)} leagues from database")
                # Try to find any match with input string
                for league_entry in response.data:
                    db_abbr = str(league_entry.get('abbreviation', '')).upper()
                    db_name = str(league_entry.get('league', '')).upper()
                    
                    if (league in db_abbr or db_abbr in league or 
                        league in db_name or db_name in league):
                        if cls.LOG_ENABLED:
                            print(f"Found fuzzy match: {league_entry}")
                        if 'league_strengh' in league_entry and league_entry['league_strengh'] is not None:
                            league_strength = float(league_entry['league_strengh'])
                            if cls.LOG_ENABLED:
                                print(f"Successfully extracted league strength: {league_strength}")
                            return league_strength
            else:
                if cls.LOG_ENABLED:
                    print(f"No leagues found in database at all")
                
        except Exception as e:
            if cls.LOG_ENABLED:
                import traceback
                print(f"ERROR fetching league strength from database:")
                print(traceback.format_exc())
        
        if cls.LOG_ENABLED:
            print(f"WARNING: Could not find league strength for '{league}', using default value (50)")
        return 50
    
    @classmethod
    def generate_random_factor(cls, player_id: int) -> float:
        """
        Generate consistent random factor for a player
        Uses player_id as seed for consistency between app runs
        Random factor is reduced by half to minimize its impact
        """
        # Create a player-specific random generator
        player_random = random.Random(player_id + RANDOM_SEED)
        
        # Generate random factor between 0.9 and 1.1 (±10%)
        # Then reduce its impact by scaling it closer to 1.0
        raw_factor = 0.9 + (player_random.random() * 0.2)
        reduced_factor = 1.0 + ((raw_factor - 1.0) / 2)  # Makes random impact half as strong
        
        return reduced_factor
    
    @classmethod
    def log_ranking_calculation(cls, player, calculation_details):
        """
        Log detailed breakdown of how a player's ranking was calculated
        
        Args:
            player: Player dictionary
            calculation_details: Dictionary with calculation components
        """
        # Skip logging if disabled
        if not cls.LOG_ENABLED:
            return
        
        player_name = f"{player.get('first_name', '')} {player.get('last_name', '')}"
        player_id = player.get('id', 0)
        
        print("\n" + "="*100)
        print(f"DRAFT RANKING CALCULATION FOR: {player_name} (ID: {player_id})")
        print("="*100)
        
        # Create a table with raw values
        raw_values = pd.DataFrame([{
            'Attribute': 'Overall Rating',
            'Raw Value': calculation_details['overall'],
            'Adjusted Value': f"{calculation_details['overall']} × {calculation_details['volatility_factor']:.2f} × {cls.WEIGHTS['overall']:.2f}",
            'Component Score': calculation_details['overall_component'],
            'Weight': cls.WEIGHTS['overall'],
            'Weighted Contribution': calculation_details['overall_component'],
            'Percentage': f"{(calculation_details['overall_component'] / calculation_details['pre_random_total']) * 100:.1f}%"
        }, {
            'Attribute': 'Potential',
            'Raw Value': calculation_details['potential_value'],
            'Adjusted Value': f"{calculation_details['potential_value']} × {calculation_details['precision_factor']:.2f} × {calculation_details['volatility_factor']:.2f} × {cls.WEIGHTS['potential']:.2f}",
            'Component Score': calculation_details['potential_component'],
            'Weight': cls.WEIGHTS['potential'],
            'Weighted Contribution': calculation_details['potential_component'],
            'Percentage': f"{(calculation_details['potential_component'] / calculation_details['pre_random_total']) * 100:.1f}%"
        }, {
            'Attribute': 'Height',
            'Raw Value': f"{calculation_details['height_str']} ({calculation_details['height_value']})",
            'Adjusted Value': f"{calculation_details['height_value']} × {cls.WEIGHTS['height']:.2f}",
            'Component Score': calculation_details['height_component'],
            'Weight': cls.WEIGHTS['height'],
            'Weighted Contribution': calculation_details['height_component'],
            'Percentage': f"{(calculation_details['height_component'] / calculation_details['pre_random_total']) * 100:.1f}%"
        }, {
            'Attribute': 'League',
            'Raw Value': f"{calculation_details['league']} ({calculation_details['league_value']})",
            'Adjusted Value': f"{calculation_details['league_value']} × {cls.WEIGHTS['league']:.2f}",
            'Component Score': calculation_details['league_component'],
            'Weight': cls.WEIGHTS['league'],
            'Weighted Contribution': calculation_details['league_component'],
            'Percentage': f"{(calculation_details['league_component'] / calculation_details['pre_random_total']) * 100:.1f}%"
        }, {
            'Attribute': 'Position',
            'Raw Value': f"{calculation_details['position']} ({calculation_details['position_value']})",
            'Adjusted Value': f"{calculation_details['position_value']} × {cls.WEIGHTS['position']:.2f}",
            'Component Score': calculation_details['position_component'],
            'Weight': cls.WEIGHTS['position'],
            'Weighted Contribution': calculation_details['position_component'],
            'Percentage': f"{(calculation_details['position_component'] / calculation_details['pre_random_total']) * 100:.1f}%"
        }, {
            'Attribute': 'Country',
            'Raw Value': f"{calculation_details['country']} ({calculation_details['country_value']})",
            'Adjusted Value': f"{calculation_details['country_value']} × {cls.WEIGHTS['country']:.2f}",
            'Component Score': calculation_details['country_component'],
            'Weight': cls.WEIGHTS['country'],
            'Weighted Contribution': calculation_details['country_component'],
            'Percentage': f"{(calculation_details['country_component'] / calculation_details['pre_random_total']) * 100:.1f}%"
        }, {
            'Attribute': 'Random Factor',
            'Raw Value': f"{calculation_details['random_factor']:.3f}",
            'Adjusted Value': f"({calculation_details['pre_random_total']:.2f}) × {calculation_details['random_factor']:.3f}",
            'Component Score': calculation_details['random_impact'],
            'Weight': 'N/A',
            'Weighted Contribution': calculation_details['random_impact'],
            'Percentage': f"{(calculation_details['random_impact'] / calculation_details['final_value']) * 100:.1f}%"
        }, {
            'Attribute': 'TOTAL',
            'Raw Value': '',
            'Adjusted Value': '',
            'Component Score': calculation_details['final_value'],
            'Weight': '',
            'Weighted Contribution': calculation_details['final_value'],
            'Percentage': '100.0%'
        }])
        
        # Print the table
        print(tabulate(raw_values, headers='keys', tablefmt='grid', showindex=False))
        
        # Additional player info
        print("\nPlayer Details:")
        print(f"Position: {player.get('position', 'N/A')}")
        print(f"Age: {player.get('age', 'N/A')}")
        print(f"Potential: {player.get('potential', 'N/A')}")
        print(f"Volatility: {player.get('potential_volatility', 'N/A')}")
        print(f"Precision: {player.get('potential_precision', 'N/A')}")
        print(f"Team: {player.get('team', 'N/A')}")
        print(f"League: {player.get('league', 'N/A')}")
        
        # Save to CSV file
        try:
            log_dir = os.path.join(os.getcwd(), 'logs')
            os.makedirs(log_dir, exist_ok=True)
            
            today = datetime.now().strftime('%Y%m%d')
            log_file = os.path.join(log_dir, f'draft_rankings_{today}.csv')
            
            # Create header if file doesn't exist
            file_exists = os.path.isfile(log_file)
            
            # Prepare data for CSV
            csv_data = {
                'Player ID': player_id,
                'Player Name': player_name,
                'Overall Rating': calculation_details['overall'],
                'Potential Value': calculation_details['potential_value'],
                'Potential String': player.get('potential', 'N/A'),
                'Height': calculation_details['height_str'],
                'Height Value': calculation_details['height_value'],
                'League': calculation_details['league'],
                'League Value': calculation_details['league_value'],
                'Position': calculation_details['position'],
                'Position Value': calculation_details['position_value'],
                'Country': calculation_details['country'],
                'Country Value': calculation_details['country_value'],
                'Volatility': player.get('potential_volatility', 'N/A'),
                'Volatility Factor': calculation_details['volatility_factor'],
                'Precision': player.get('potential_precision', 'medium'),
                'Precision Factor': calculation_details['precision_factor'],
                'Overall Component': calculation_details['overall_component'],
                'Potential Component': calculation_details['potential_component'],
                'Height Component': calculation_details['height_component'],
                'League Component': calculation_details['league_component'],
                'Position Component': calculation_details['position_component'],
                'Country Component': calculation_details['country_component'],
                'Pre-Random Total': calculation_details['pre_random_total'],
                'Random Factor': calculation_details['random_factor'],
                'Final Value': calculation_details['final_value']
            }
            
            # Convert to DataFrame and save
            df = pd.DataFrame([csv_data])
            df.to_csv(log_file, mode='a', header=not file_exists, index=False)
            
            print(f"\nDetailed calculation saved to: {log_file}")
            
        except Exception as e:
            print(f"Error saving calculation to CSV: {str(e)}")
        
        print("="*100)
    
    @classmethod
    def calculate_draft_ranking_value(cls, player: Dict[str, Any]) -> float:
        """
        Calculate the draft ranking value using the updated formula:
        Draft Rankings value = overall × potential_volatility × w1 + 
                              potential × potential_precision × potential_volatility × w2 + 
                              height × w3 + 
                              league_strength × w4 + 
                              position_bias × w5 + 
                              country × w6 + 
                              random
        """
        # Extract player attributes, handling potential missing values
        overall = float(player.get('overall_rating', player.get('overall', 50)))
        
        # Convert potential to numeric value
        potential_str = player.get('potential', '')
        potential_value = cls.get_potential_numeric_value(potential_str)
        
        # Convert volatility to numeric value (higher number = more stable/less volatile)
        volatility_str = player.get('potential_volatility', 'medium')
        volatility_value = cls.get_volatility_numeric_value(volatility_str)
        volatility_factor = volatility_value / 100  # Convert to 0-1 scale
        
        # Convert precision to numeric value (higher number = more precise)
        precision_str = player.get('potential_precision', 'medium')
        precision_value = cls.get_precision_numeric_value(precision_str)
        precision_factor = precision_value / 100  # Convert to 0-1 scale
        
        # Convert height to numeric value
        height_str = player.get('height', '')
        height_value = cls.get_height_value(height_str)
        
        # Get league strength
        league = player.get('league', '')
        league_value = cls.get_league_strength_value(league)
        
        # Get position bias
        position = player.get('position_primary', player.get('position', ''))
        position_value = cls.get_position_value(position)
        
        # Get country risk factor
        country = player.get('nationality', '')
        country_value = cls.get_country_value(country)
        
        # Get player-specific random factor
        player_id = player.get('id', 0)
        random_factor = cls.generate_random_factor(player_id)
        
        # Calculate the components of the ranking
        overall_component = overall * volatility_factor * cls.WEIGHTS['overall']
        potential_component = potential_value * precision_factor * volatility_factor * cls.WEIGHTS['potential']
        height_component = height_value * cls.WEIGHTS['height']
        league_component = league_value * cls.WEIGHTS['league']
        position_component = position_value * cls.WEIGHTS['position']
        country_component = country_value * cls.WEIGHTS['country']
        
        # Calculate pre-random total
        pre_random_total = (
            overall_component +
            potential_component +
            height_component +
            league_component +
            position_component +
            country_component
        )
        
        # Calculate final value with random factor
        ranking_value = pre_random_total * random_factor
        
        # Log detailed calculation if player has name (avoid logging for every calculation)
        if player.get('first_name') and player.get('last_name') and player.get('id'):
            # Store calculation details for logging
            calculation_details = {
                'overall': overall,
                'potential_str': potential_str,
                'potential_value': potential_value,
                'volatility_str': volatility_str,
                'volatility_value': volatility_value,
                'volatility_factor': volatility_factor,
                'precision_str': precision_str,
                'precision_value': precision_value,
                'precision_factor': precision_factor,
                'height_str': height_str,
                'height_value': height_value,
                'league': league,
                'league_value': league_value,
                'position': position,
                'position_value': position_value,
                'country': country,
                'country_value': country_value,
                'random_factor': random_factor,
                'overall_component': overall_component,
                'potential_component': potential_component,
                'height_component': height_component,
                'league_component': league_component,
                'position_component': position_component,
                'country_component': country_component,
                'pre_random_total': pre_random_total,
                'random_impact': ranking_value - pre_random_total,
                'final_value': ranking_value
            }
            
            # Log detailed calculation
            cls.log_ranking_calculation(player, calculation_details)
        
        return ranking_value
    
    @classmethod
    def get_draft_rankings(cls, year: int = None) -> List[Dict[str, Any]]:
        """
        Get draft rankings for a specific year
        
        Args:
            year: Draft year to get rankings for (defaults to current year)
            
        Returns:
            List of player dictionaries with ranking information
        """
        if not year:
            year = datetime.now().year
            
        try:
            # First try to get draft-eligible players from Supabase
            try:
                from ...supabase_client import get_draft_eligible_players
                eligible_players = get_draft_eligible_players()
                
                if eligible_players and len(eligible_players) > 0:
                    # Calculate ranking value for each player
                    for player in eligible_players:
                        player['ranking_value'] = cls.calculate_draft_ranking_value(player)
                    
                    # Sort by ranking value in descending order
                    eligible_players.sort(key=lambda p: p.get('ranking_value', 0), reverse=True)
                    
                    # Add ranking position
                    for i, player in enumerate(eligible_players):
                        player['draft_ranking'] = i + 1
                    
                    return eligible_players
            except Exception as e:
                print(f"Error fetching players from Supabase: {str(e)}")
            
            # Fallback to using SQLAlchemy
            # Get all draft-eligible players (17-year-olds without a draft year)
            players = Player.query.filter(
                Player.age == 17,
                Player.draft_year.is_(None)
            ).all()
            
            player_data = []
            for player in players:
                # Convert to dictionary
                player_dict = player.to_dict()
                
                # Calculate ranking value
                player_dict['ranking_value'] = cls.calculate_draft_ranking_value(player_dict)
                player_data.append(player_dict)
            
            # Sort by ranking value in descending order
            player_data.sort(key=lambda p: p.get('ranking_value', 0), reverse=True)
            
            # Add ranking position
            for i, player in enumerate(player_data):
                player['draft_ranking'] = i + 1
            
            return player_data
        except Exception as e:
            print(f"Error getting draft rankings: {str(e)}")
            return []
    
    @classmethod
    def get_player_ranking(cls, player_id: int) -> Dict[str, Any]:
        """
        Get ranking information for a specific player
        
        Args:
            player_id: ID of the player to get ranking for
            
        Returns:
            Dictionary with ranking information
        """
        try:
            # Try to get player from database
            player = Player.query.get(player_id)
            if not player:
                return {"error": "Player not found"}
            
            # Convert to dictionary
            player_dict = player.to_dict()
            
            # Calculate ranking value
            ranking_value = cls.calculate_draft_ranking_value(player_dict)
            
            # Get all players and their rankings
            all_rankings = cls.get_draft_rankings()
            
            # Find player's rank
            player_rank = None
            for i, p in enumerate(all_rankings):
                if p.get('id') == player_id:
                    player_rank = i + 1
                    break
            
            return {
                "player_id": player_id,
                "ranking_value": ranking_value,
                "draft_ranking": player_rank,
                "total_prospects": len(all_rankings)
            }
        except Exception as e:
            print(f"Error getting player ranking: {str(e)}")
            return {"error": str(e)}


# API Routes for draft rankings

@draft_ranking_bp.route('/', methods=['GET'])
def get_draft_rankings():
    """Get draft rankings for the current year"""
    try:
        # Get year from query params, default to current year
        year = request.args.get('year', datetime.now().year, type=int)
        
        # Get draft rankings
        rankings = DraftRankingService.get_draft_rankings(year)
        
        # Return rankings
        return jsonify(rankings), 200
    except Exception as e:
        print(f"Error in get_draft_rankings route: {str(e)}")
        return jsonify({"error": str(e)}), 500

@draft_ranking_bp.route('/player/<int:player_id>', methods=['GET'])
def get_player_ranking(player_id):
    """Get ranking for a specific player"""
    try:
        # Get player ranking
        ranking = DraftRankingService.get_player_ranking(player_id)
        
        # Return ranking
        return jsonify(ranking), 200
    except Exception as e:
        print(f"Error in get_player_ranking route: {str(e)}")
        return jsonify({"error": str(e)}), 500
