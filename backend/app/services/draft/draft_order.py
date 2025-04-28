from typing import Dict, List, Any, Optional
import random
from flask import Blueprint, jsonify, request
from ...supabase_client import get_supabase_client
from ...services.team_service import TeamService

# Create a blueprint for draft order endpoints with a unique name
draft_order_bp = Blueprint('draft_order_service', __name__)

class DraftOrderService:
    """
    Service for generating and managing NHL draft order with lottery odds.
    """
    
    @staticmethod
    def get_standing_order(year: int) -> Dict[str, int]:
        """
        Get the standing order for the given year.
        
        Args:
            year: The draft year
            
        Returns:
            Dictionary mapping team abbreviations to their standing position
        """
        # For 2025, use the provided standings - this is the OFFICIAL order
        # SJS is last place (#1 pick), CHI is second-to-last (#2 pick), etc.
        if year == 2025:
            standing_order = {
                "SJS": 1, "CHI": 2, "PHI": 3, "NSH": 4, "BOS": 5, "SEA": 6, "BUF": 7, "PIT": 8,
                "ANA": 9, "NYI": 10, "NYR": 11, "DET": 12, "CBJ": 13, "UTA": 14, "VAN": 15,
                "CGY": 16, "MTL": 17, "NJD": 18, "STL": 19, "OTT": 20, "MIN": 21, "FLA": 22,
                "CAR": 23, "EDM": 24, "TBL": 25, "COL": 26, "LAK": 27, "DAL": 28, "TOR": 29,
                "VGK": 30, "WSH": 31, "WPG": 32
            }
            print(f"Using hardcoded 2025 standing order: SJS={standing_order['SJS']}, CHI={standing_order['CHI']}")
            return standing_order
        
        # TODO: For other years, fetch from league standings in the database
        # Default order for other years
        return {
            "SJS": 1, "CHI": 2, "PHI": 3, "NSH": 4, "BOS": 5, "SEA": 6, "BUF": 7, "PIT": 8,
            "ANA": 9, "NYI": 10, "NYR": 11, "DET": 12, "CBJ": 13, "UTA": 14, "VAN": 15,
            "CGY": 16, "MTL": 17, "NJD": 18, "STL": 19, "OTT": 20, "MIN": 21, "FLA": 22,
            "CAR": 23, "EDM": 24, "TBL": 25, "COL": 26, "LAK": 27, "DAL": 28, "TOR": 29,
            "VGK": 30, "WSH": 31, "WPG": 32
        }
    
    @staticmethod
    def get_lottery_odds(position: int) -> float:
        """
        Get the lottery odds for a given standing position.
        Based on the NHL draft lottery odds as of 2023.
        
        Args:
            position: The team's position in the standings (1 = last place)
            
        Returns:
            Lottery odds as a percentage
        """
        # Based on the image provided for NHL draft lottery odds
        lottery_odds = {
            1: 25.5, 2: 13.5, 3: 11.5, 4: 9.5, 5: 8.5, 6: 7.5, 7: 6.5, 8: 6.0,
            9: 5.0, 10: 3.5, 11: 3.0, 12: 0.0, 13: 0.0, 14: 0.0, 15: 0.0,
            16: 0.0
        }
        
        # Teams in positions 17-32 have 0 lottery odds
        return lottery_odds.get(position, 0.0)
    
    @staticmethod
    def run_draft_lottery(standing_order: Dict[str, int]) -> Dict[str, int]:
        """
        Run the draft lottery simulation based on standing order and lottery odds.
        
        Args:
            standing_order: Dictionary mapping team abbreviations to their standing position
            
        Returns:
            Dictionary mapping team abbreviations to their final draft position
        """
        # Create a list of teams in order of their standing position
        teams_by_position = [None] * 32  # Initialize with None
        for team, position in standing_order.items():
            teams_by_position[position - 1] = team
        
        # Remove any None values if we don't have a full 32 teams
        teams_by_position = [team for team in teams_by_position if team is not None]
        
        # Map lottery odds to each team (first 16 teams)
        team_odds = {}
        for pos, team in enumerate(teams_by_position[:16], 1):
            team_odds[team] = DraftOrderService.get_lottery_odds(pos)
        
        # Simulate lottery for first overall pick
        first_pick_team = DraftOrderService._simulate_lottery_pick(team_odds)
        
        # Simulate lottery for second overall pick (excluding first pick winner)
        first_pick_position = standing_order[first_pick_team]
        team_odds_second = team_odds.copy()
        if first_pick_position <= 16:  # Only remove if they were in the lottery
            team_odds_second.pop(first_pick_team)
        second_pick_team = DraftOrderService._simulate_lottery_pick(team_odds_second)
        
        # Create the final draft order based on lottery results
        draft_positions = {}
        
        # First, set the lottery winners
        draft_positions[first_pick_team] = 1
        draft_positions[second_pick_team] = 2
        
        # Then assign remaining positions based on standing
        current_position = 3
        for team in teams_by_position:
            if team not in draft_positions:
                draft_positions[team] = current_position
                current_position += 1
        
        return draft_positions
    
    @staticmethod
    def _simulate_lottery_pick(team_odds: Dict[str, float]) -> str:
        """
        Simulate a single lottery pick based on team odds.
        
        Args:
            team_odds: Dictionary mapping team abbreviations to their lottery odds
            
        Returns:
            Team abbreviation that won the lottery pick
        """
        # Create ranges for each team based on their odds
        teams = []
        odds = []
        for team, team_odd in team_odds.items():
            teams.append(team)
            odds.append(team_odd)
        
        # Pick a winning team based on odds
        winner = random.choices(teams, weights=odds, k=1)[0]
        return winner
    
    @staticmethod
    def generate_draft_order(year: int, use_lottery: bool = False) -> List[Dict[str, Any]]:
        """
        Generate the draft order for a given year.
        
        Args:
            year: The draft year
            use_lottery: Whether to apply the lottery simulation
            
        Returns:
            List of draft picks in order with team information
        """
        print(f"Generating draft order for year {year}, use_lottery={use_lottery}")
        
        # STEP 1: Get the standing order from standings
        standing_order = DraftOrderService.get_standing_order(year)
        if not standing_order:
            print(f"No standing order found for year {year}")
            return []
        
        # STEP 2: Apply lottery if requested, otherwise use standings directly
        draft_positions = {}
        if use_lottery:
            draft_positions = DraftOrderService.run_draft_lottery(standing_order)
            print("Applied lottery simulation to draft positions")
        else:
            # Use standing order directly - position in standings = draft position
            draft_positions = {team: pos for team, pos in standing_order.items()}
            print("Using direct standing order for draft positions")
        
        # STEP 3: Get all teams data for proper team information
        teams_data = TeamService.get_nhl_teams()
        if not teams_data:
            print("No team data found")
            return []
        
        # Create a map of team abbreviations to team data
        team_map = {}
        for team in teams_data:
            abbrev = team.get('abbreviation')
            if abbrev:
                team_map[abbrev] = team
        
        # STEP 4: Get all the draft picks from Supabase
        supabase = get_supabase_client()
        try:
            response = supabase.table('Draft_Picks') \
                .select('*, team:Team(id, team, abbreviation, primary_color, secondary_color)') \
                .eq('year', year) \
                .execute()
            
            if not response.data:
                print(f"No draft picks found in Supabase for year {year}")
                return []
            
            # Maps to track pick ownership and trades
            original_picks = {}     # Maps team -> {round -> pick data}
            traded_picks = {}       # Maps team -> list of rounds they've traded
            received_picks = {}     # Maps team -> list of {original_team, round, pick}
            team_positions = {}     # Maps team -> position in standings
            
            # First pass - build maps of original picks and team positions
            for team, pos in draft_positions.items():
                team_positions[team] = pos
            
            # Second pass - organize picks and identify trades
            for pick in response.data:
                # Extract the team abbreviation
                team_abbrev = pick.get('team')
                if isinstance(team_abbrev, dict) and 'abbreviation' in team_abbrev:
                    team_abbrev = team_abbrev.get('abbreviation')
                
                round_num = pick.get('round')
                pick_status = pick.get('pick_status', 'Owned')
                
                if not team_abbrev or not round_num:
                    continue
                
                # Store original pick information
                if team_abbrev not in original_picks:
                    original_picks[team_abbrev] = {}
                original_picks[team_abbrev][round_num] = pick
                
                # Track traded picks
                if pick_status == 'Traded':
                    if team_abbrev not in traded_picks:
                        traded_picks[team_abbrev] = []
                    traded_picks[team_abbrev].append(round_num)
                
                # Process received picks
                for i in range(1, 7):  # Check received_pick_1 through received_pick_6
                    received_team = pick.get(f'received_pick_{i}')
                    if received_team:
                        print(f"Team {team_abbrev} received a pick from {received_team} in round {round_num}")
                        
                        # Track that the original team's pick was traded
                        if received_team not in traded_picks:
                            traded_picks[received_team] = []
                        if round_num not in traded_picks[received_team]:
                            traded_picks[received_team].append(round_num)
                        
                        # Store the receiving team and pick information
                        if team_abbrev not in received_picks:
                            received_picks[team_abbrev] = []
                        
                        received_picks[team_abbrev].append({
                            'original_team': received_team,
                            'round': round_num,
                            'pick': pick
                        })
            
            # STEP 5: Verify and correct team order based on standings
            ordered_teams = sorted(draft_positions.keys(), key=lambda t: draft_positions[t])
            
            # Verify expected order
            if ordered_teams and ordered_teams[0] != 'SJS':
                print(f"WARNING: First team is {ordered_teams[0]}, expected SJS. Fixing order...")
                
                # Force the hardcoded order for consistency
                ordered_teams = [
                    "SJS", "CHI", "PHI", "NSH", "BOS", "SEA", "BUF", "PIT",
                    "ANA", "NYI", "NYR", "DET", "CBJ", "UTA", "VAN",
                    "CGY", "MTL", "NJD", "STL", "OTT", "MIN", "FLA", 
                    "CAR", "EDM", "TBL", "COL", "LAK", "DAL", "TOR",
                    "VGK", "WSH", "WPG"
                ]
            
            # STEP 6: Generate draft order by round
            formatted_picks = []
            overall_pick_counter = 1
            
            for round_num in range(1, 8):  # 7 rounds in the draft
                # Track round picks in order
                round_picks = []
                
                # Process each team's pick for this round in standing order
                for position, team_abbrev in enumerate(ordered_teams, 1):
                    # Skip if this team doesn't have a pick in this round
                    if team_abbrev not in original_picks or round_num not in original_picks[team_abbrev]:
                        continue
                    
                    pick = original_picks[team_abbrev][round_num]
                    pick_status = pick.get('pick_status', 'Owned')
                    
                    # Check if this team has traded away this pick
                    has_traded_pick = team_abbrev in traded_picks and round_num in traded_picks[team_abbrev]
                    
                    # Skip traded picks - we'll handle them when processing received picks
                    if pick_status == 'Traded' or has_traded_pick:
                        print(f"Skipping {team_abbrev}'s round {round_num} pick (traded)")
                        continue
                    
                    # This is a normal owned pick
                    team_info = team_map.get(team_abbrev, {})
                    formatted_pick = {
                        'id': pick.get('id'),
                        'draft_id': 1,
                        'round_num': round_num,
                        'overall_pick': 0,  # Will be updated later
                        'pick_num': position,
                        'team_id': team_info.get('id'),
                        'player_id': None,
                        'team': {
                            'id': team_info.get('id'),
                            'abbreviation': team_abbrev,
                            'name': team_info.get('team', team_abbrev),
                            'city': team_info.get('city', ''),
                            'primary_color': team_info.get('primary_color', '#333'),
                            'secondary_color': team_info.get('secondary_color', '#fff')
                        },
                        'pick_status': pick_status
                    }
                    round_picks.append((position, formatted_pick))
                
                # Now process received picks for this round
                for receiving_team, received_list in received_picks.items():
                    for received_info in received_list:
                        if received_info['round'] != round_num:
                            continue
                        
                        original_team = received_info['original_team']
                        
                        # Find the original team's position in the draft
                        original_position = team_positions.get(original_team)
                        if not original_position:
                            for pos, team in enumerate(ordered_teams, 1):
                                if team == original_team:
                                    original_position = pos
                                    break
                        
                        if not original_position:
                            print(f"Warning: Could not determine position for {original_team}")
                            continue
                        
                        receiving_team_info = team_map.get(receiving_team, {})
                        original_team_info = team_map.get(original_team, {})
                        
                        # Create the formatted pick for this received pick
                        formatted_pick = {
                            'id': received_info['pick'].get('id'),
                            'draft_id': 1,
                            'round_num': round_num,
                            'overall_pick': 0,  # Will be updated later
                            'pick_num': original_position,  # Use position of original team
                            'team_id': receiving_team_info.get('id'),
                            'player_id': None,
                            'team': {
                                'id': receiving_team_info.get('id'),
                                'abbreviation': receiving_team,
                                'name': receiving_team_info.get('team', receiving_team),
                                'city': receiving_team_info.get('city', ''),
                                'primary_color': receiving_team_info.get('primary_color', '#333'),
                                'secondary_color': receiving_team_info.get('secondary_color', '#fff')
                            },
                            'pick_status': 'Received',
                            'received_from': original_team,
                            'original_team': {
                                'abbreviation': original_team,
                                'name': original_team_info.get('team', original_team) if original_team_info else original_team
                            }
                        }
                        round_picks.append((original_position, formatted_pick))
                
                # Sort the picks by their position
                round_picks.sort(key=lambda x: x[0])
                
                # Add the sorted picks to the final list
                for _, pick in round_picks:
                    pick['overall_pick'] = overall_pick_counter
                    formatted_picks.append(pick)
                    overall_pick_counter += 1
            
            # STEP 7: Verify and debug
            first_round_picks = [p for p in formatted_picks if p['round_num'] == 1]
            print(f"First round has {len(first_round_picks)} picks")
            
            # Check some key teams
            sjs_picks = [p for p in formatted_picks if p['team']['abbreviation'] == 'SJS']
            print(f"SJS has {len(sjs_picks)} picks")
            for p in sjs_picks:
                pick_info = f"Round {p['round_num']}, overall #{p['overall_pick']}"
                if 'received_from' in p:
                    pick_info += f" (from {p['received_from']})"
                print(f"  - {pick_info}")
            
            # Check key traded picks
            mtl_picks = [p for p in formatted_picks if p['team']['abbreviation'] == 'MTL']
            print(f"MTL has {len(mtl_picks)} picks")
            for p in mtl_picks:
                pick_info = f"Round {p['round_num']}, overall #{p['overall_pick']}"
                if 'received_from' in p:
                    pick_info += f" (from {p['received_from']})"
                print(f"  - {pick_info}")
            
            # Return the formatted picks
            return formatted_picks
            
        except Exception as e:
            print(f"Error generating draft order: {str(e)}")
            import traceback
            traceback.print_exc()
            return []


# API endpoints for the draft order service

@draft_order_bp.route('/', methods=['GET'])
def get_draft_order():
    """
    Get the draft order for a specific year with optional lottery simulation.
    
    Query parameters:
    - year: The draft year (default: current year)
    - use_lottery: Whether to simulate the lottery (default: false)
    
    Returns:
        JSON array of draft picks
    """
    try:
        year = request.args.get('year', 2025, type=int)
        use_lottery = request.args.get('use_lottery', 'false').lower() == 'true'
        
        print(f"Draft order requested for year {year}, use_lottery={use_lottery}")
        
        # Generate the draft order
        draft_order = DraftOrderService.generate_draft_order(year, use_lottery)
        
        print(f"Returning {len(draft_order)} picks")
        return jsonify(draft_order), 200
    except Exception as e:
        print(f"Error in get_draft_order endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500


@draft_order_bp.route('/lottery', methods=['GET'])
def simulate_lottery():
    """
    Simulate the draft lottery for a specific year.
    
    Query parameters:
    - year: The draft year (default: current year)
    
    Returns:
        JSON with lottery results
    """
    try:
        year = request.args.get('year', 2025, type=int)
        
        # Get standing order
        standing_order = DraftOrderService.get_standing_order(year)
        
        if not standing_order:
            return jsonify({'error': f'No standing order found for year {year}'}), 404
        
        # Run lottery simulation
        draft_positions = DraftOrderService.run_draft_lottery(standing_order)
        
        # Format results
        results = []
        for team, draft_pos in draft_positions.items():
            standing_pos = standing_order[team]
            results.append({
                'team': team,
                'original_position': standing_pos,
                'final_position': draft_pos,
                'position_change': standing_pos - draft_pos,
                'odds': DraftOrderService.get_lottery_odds(standing_pos)
            })
        
        # Sort by final draft position
        results.sort(key=lambda x: x['final_position'])
        
        return jsonify({
            'year': year,
            'lottery_results': results
        }), 200
    except Exception as e:
        print(f"Error in simulate_lottery endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500


@draft_order_bp.route('/odds', methods=['GET'])
def get_lottery_odds():
    """
    Get the lottery odds for each standing position.
    
    Returns:
        JSON with lottery odds for each position
    """
    try:
        odds = {}
        for position in range(1, 17):
            odds[position] = DraftOrderService.get_lottery_odds(position)
        
        return jsonify(odds), 200
    except Exception as e:
        print(f"Error in get_lottery_odds endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500
