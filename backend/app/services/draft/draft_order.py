from typing import Dict, List, Any, Optional
import random
from flask import Blueprint, jsonify, request
from ...supabase_client import get_supabase_client
from ...services.team_service import TeamService

# Create a blueprint for draft order endpoints
draft_order_bp = Blueprint('draft_order', __name__)

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
            return {
                "SJS": 1, "CHI": 2, "PHI": 3, "NSH": 4, "BOS": 5, "SEA": 6, "BUF": 7, "PIT": 8,
                "ANA": 9, "NYI": 10, "NYR": 11, "DET": 12, "CBJ": 13, "UTA": 14, "VAN": 15,
                "CGY": 16, "MTL": 17, "NJD": 18, "STL": 19, "OTT": 20, "MIN": 21, "FLA": 22,
                "CAR": 23, "EDM": 24, "TBL": 25, "COL": 26, "LAK": 27, "DAL": 28, "TOR": 29,
                "VGK": 30, "WSH": 31, "WPG": 32
            }
        
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
            
            # Organize picks by team and round
            picks_by_team_round = {}
            for pick in response.data:
                team_abbrev = pick.get('team')
                round_num = pick.get('round')
                if team_abbrev and round_num:
                    if team_abbrev not in picks_by_team_round:
                        picks_by_team_round[team_abbrev] = {}
                    picks_by_team_round[team_abbrev][round_num] = pick
            
            # STEP 5: Order teams by draft position from standings/lottery
            ordered_teams = sorted(draft_positions.keys(), key=lambda t: draft_positions[t])
            print(f"First 5 teams in draft order: {ordered_teams[:5]}")
            
            # STEP 6: Generate the picks in proper order, handling ownership
            formatted_picks = []
            overall_pick_counter = 1
            
            for round_num in range(1, 8):  # 7 rounds
                for pick_position, team_abbrev in enumerate(ordered_teams, 1):
                    # Get the pick record for this team and round
                    pick = picks_by_team_round.get(team_abbrev, {}).get(round_num)
                    
                    if not pick:
                        print(f"Warning: No pick found for {team_abbrev} in round {round_num}")
                        continue
                    
                    # Check pick status to determine ownership
                    pick_status = pick.get('pick_status', 'Owned')
                    team_info = pick.get('team', {})
                    
                    if pick_status == 'Owned':
                        # Regular owned pick - team keeps their own pick
                        formatted_pick = {
                            'id': pick.get('id'),
                            'draft_id': 1,  # Default draft ID
                            'round_num': round_num,
                            'overall_pick': overall_pick_counter,
                            'pick_num': pick_position,
                            'team_id': team_info.get('id'),
                            'player_id': None,  # No player assigned yet
                            'team': team_info,
                            'pick_status': 'Owned'
                        }
                        formatted_picks.append(formatted_pick)
                        overall_pick_counter += 1
                    
                    elif pick_status == 'Traded':
                        # Check which team received this pick
                        receiving_team = None
                        for i in range(1, 7):  # Check received_pick_1 through received_pick_6
                            received_team_abbrev = pick.get(f'received_pick_{i}')
                            if received_team_abbrev:
                                receiving_team = team_map.get(received_team_abbrev)
                                if receiving_team:
                                    # Found the team that received this pick
                                    formatted_pick = {
                                        'id': pick.get('id'),
                                        'draft_id': 1,  # Default draft ID
                                        'round_num': round_num,
                                        'overall_pick': overall_pick_counter,
                                        'pick_num': pick_position,
                                        'team_id': receiving_team.get('id'),
                                        'player_id': None,  # No player assigned yet
                                        'pick_status': 'Traded',
                                        'team': {
                                            'id': receiving_team.get('id'),
                                            'abbreviation': received_team_abbrev,
                                            'name': receiving_team.get('team', received_team_abbrev),
                                            'city': receiving_team.get('city', ''),
                                            'primary_color': receiving_team.get('primary_color', '#333'),
                                            'secondary_color': receiving_team.get('secondary_color', '#fff')
                                        },
                                        'received_from': team_abbrev,
                                        'original_team': {
                                            'abbreviation': team_abbrev,
                                            'name': team_info.get('team', team_abbrev)
                                        }
                                    }
                                    formatted_picks.append(formatted_pick)
                                    overall_pick_counter += 1
                                    break  # Only use the first non-empty received_pick field
                        
                        if not receiving_team:
                            print(f"Warning: Pick for {team_abbrev} in round {round_num} is marked as Traded but no receiving team found")
                    
                    elif pick_status == 'Top10Protected':
                        # Protected pick - check if it's in the top 10
                        if pick_position <= 10:
                            # Keep with original team (protected)
                            formatted_pick = {
                                'id': pick.get('id'),
                                'draft_id': 1,  # Default draft ID
                                'round_num': round_num,
                                'overall_pick': overall_pick_counter,
                                'pick_num': pick_position,
                                'team_id': team_info.get('id'),
                                'player_id': None,  # No player assigned yet
                                'team': team_info,
                                'pick_status': 'Top10Protected',
                                'is_protected': True
                            }
                        else:
                            # Top 10 protection does not apply, transfer to receiving team
                            received_team_abbrev = pick.get(f'received_pick_1')
                            if received_team_abbrev:
                                receiving_team = team_map.get(received_team_abbrev)
                                if receiving_team:
                                    formatted_pick = {
                                        'id': pick.get('id'),
                                        'draft_id': 1,  # Default draft ID
                                        'round_num': round_num,
                                        'overall_pick': overall_pick_counter,
                                        'pick_num': pick_position,
                                        'team_id': receiving_team.get('id'),
                                        'player_id': None,  # No player assigned yet
                                        'pick_status': 'Top10Protected',
                                        'team': {
                                            'id': receiving_team.get('id'),
                                            'abbreviation': received_team_abbrev,
                                            'name': receiving_team.get('team', received_team_abbrev),
                                            'city': receiving_team.get('city', ''),
                                            'primary_color': receiving_team.get('primary_color', '#333'),
                                            'secondary_color': receiving_team.get('secondary_color', '#fff')
                                        },
                                        'received_from': team_abbrev,
                                        'original_team': {
                                            'abbreviation': team_abbrev,
                                            'name': team_info.get('team', team_abbrev)
                                        },
                                        'is_protected': False
                                    }
                                else:
                                    print(f"Warning: Receiving team {received_team_abbrev} not found for protected pick")
                                    formatted_pick = {
                                        'id': pick.get('id'),
                                        'draft_id': 1,  # Default draft ID
                                        'round_num': round_num,
                                        'overall_pick': overall_pick_counter,
                                        'pick_num': pick_position,
                                        'team_id': team_info.get('id'),
                                        'player_id': None,  # No player assigned yet
                                        'team': team_info,
                                        'pick_status': 'Top10Protected',
                                        'is_protected': True  # Keep with original since no receiving team found
                                    }
                            else:
                                print(f"Warning: No receiving team specified for Top10Protected pick")
                                formatted_pick = {
                                    'id': pick.get('id'),
                                    'draft_id': 1,  # Default draft ID
                                    'round_num': round_num,
                                    'overall_pick': overall_pick_counter,
                                    'pick_num': pick_position,
                                    'team_id': team_info.get('id'),
                                    'player_id': None,  # No player assigned yet
                                    'team': team_info,
                                    'pick_status': 'Top10Protected',
                                    'is_protected': True  # Keep with original since no receiving team found
                                }
                        
                        formatted_picks.append(formatted_pick)
                        overall_pick_counter += 1
                    
                    else:
                        print(f"Warning: Unknown pick status '{pick_status}' for {team_abbrev} in round {round_num}")
            
            # Log some debugging information
            if formatted_picks:
                first_pick = formatted_picks[0]
                first_team = first_pick.get('team', {}).get('abbreviation', 'Unknown')
                print(f"First pick (overall #{first_pick.get('overall_pick')}): {first_team}")
                
                # Check for SJS position as a test
                sjs_picks = [p for p in formatted_picks if p.get('team', {}).get('abbreviation') == 'SJS']
                if sjs_picks:
                    print(f"SJS has {len(sjs_picks)} picks, first pick at overall #{sjs_picks[0].get('overall_pick')}")
                else:
                    print("SJS has no picks in the draft")
            
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
