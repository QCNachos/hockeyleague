from ..supabase_client import get_supabase
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
import logging

# Create a Blueprint for awards routes
awards_bp = Blueprint('awards', __name__)

def get_all_awards():
    """
    Get all awards from Supabase
    
    Returns:
        List of award dictionaries
    """
    supabase = get_supabase()
    response = supabase.table('Awards').select('*').execute()
    return response.data

def get_awards_by_league(league):
    """
    Get awards for a specific league
    
    Args:
        league: The league abbreviation (e.g., 'NHL', 'NCAA')
    
    Returns:
        List of award dictionaries for the specified league
    """
    supabase = get_supabase()
    response = supabase.table('Awards').select('*').eq('league', league).execute()
    return response.data

def get_awards_by_type(type):
    """
    Get awards by type (Individual or Team)
    
    Args:
        type: The award type ('Individual' or 'Team')
    
    Returns:
        List of award dictionaries of the specified type
    """
    supabase = get_supabase()
    response = supabase.table('Awards').select('*').eq('type', type).execute()
    return response.data

def get_award_winners_by_year(year=None):
    """
    Get award winners for a specific year or all years
    
    Args:
        year: The year to get winners for (optional)
    
    Returns:
        List of award winner dictionaries
    """
    supabase = get_supabase()
    query = supabase.table('Awards_Winners').select('*')
    
    if year:
        query = query.eq('year', year)
        
    response = query.execute()
    return response.data

def get_recent_award_winners(years=6):
    """
    Get winners for the last X years of awards, organized by year
    
    Args:
        years: Number of years of history to retrieve (default: 6)
    
    Returns:
        Dictionary with award winners by year
    """
    supabase = get_supabase()
    current_year = datetime.now().year
    start_year = current_year - years + 1
    
    logging.info(f"Fetching award winners for years {start_year}-{current_year}")
    
    try:
        # Get all awards winners from the database - no year filter initially to ensure we get data
        winners_query = supabase.table('Awards_Winners').select('*').execute()
        logging.info(f"Raw Awards_Winners query result: {winners_query}")
        all_winners = winners_query.data
        
        if not all_winners:
            logging.warning("No award winners found in the database")
            empty_data = {year: [] for year in range(start_year, current_year + 1)}
            return empty_data
        
        logging.info(f"Retrieved {len(all_winners)} total award winners")
        
        # Get all awards
        awards_response = supabase.table('Awards').select('*').execute()
        all_awards = {award['id']: award for award in awards_response.data}
        
        logging.info(f"Retrieved {len(all_awards)} awards from database")
        
        # Get all teams for joining
        teams_response = supabase.table('Team').select('abbreviation, team, location').execute()
        teams_data = {team['abbreviation']: team for team in teams_response.data}
        logging.info(f"Retrieved {len(teams_data)} teams from database")
        
        # Get all players in one query
        player_ids = [w['id_player'] for w in all_winners if w['id_player'] is not None]
        players_data = {}
        if player_ids:
            players_query = supabase.table('Player').select('id, first_name, last_name, team').in_('id', player_ids).execute()
            players_data = {player['id']: player for player in players_query.data}
            logging.info(f"Retrieved {len(players_data)} players")
        
        # Get all coaches in one query
        coach_ids = [w['id_coach'] for w in all_winners if w['id_coach'] is not None]
        coaches_data = {}
        if coach_ids:
            coaches_query = supabase.table('Staff_Coach').select('id, first_name, last_name, team').in_('id', coach_ids).execute()
            coaches_data = {coach['id']: coach for coach in coaches_query.data}
            logging.info(f"Retrieved {len(coaches_data)} coaches")
        
        # Get all GMs in one query
        gm_ids = [w['id_gm'] for w in all_winners if w['id_gm'] is not None]
        gms_data = {}
        if gm_ids:
            gms_query = supabase.table('Staff_Gm').select('id, first_name, last_name, team').in_('id', gm_ids).execute()
            gms_data = {gm['id']: gm for gm in gms_query.data}
            logging.info(f"Retrieved {len(gms_data)} GMs")
        
        # Filter for relevant years
        if years:
            all_years = sorted(set(w['year'] for w in all_winners), reverse=True)
            # Take the most recent 'years' number of years that have data
            relevant_years = set(all_years[:years])
            # Always include current year
            relevant_years.add(current_year)
        else:
            relevant_years = set(w['year'] for w in all_winners)
            relevant_years.add(current_year)
        
        logging.info(f"Relevant years: {relevant_years}")
        
        # Organize data by year
        awards_history = {year: [] for year in range(start_year, current_year + 1)}
        
        # Process each winner
        for winner in all_winners:
            year = winner['year']
            
            # Skip years outside our range
            if year < start_year:
                continue
                
            award_id = winner['id_award']
            if award_id not in all_awards:
                logging.warning(f"Award ID {award_id} not found in awards table")
                continue
                
            award = all_awards[award_id]
            
            # Set default values
            winner_name = "Data not available"
            team = winner['team'] or "N/A"
            
            if award['type'] == 'Team':
                # For team awards
                if winner['team']:
                    winner_name = winner['team']
                    team = winner['team']
                    
                    # Add team name if available
                    if team in teams_data:
                        team_data = teams_data[team]
                        winner_name = f"{team_data['location']} {team_data['team']}"
            
            elif winner['id_player'] is not None and winner['id_player'] in players_data:
                # Player award
                player = players_data[winner['id_player']]
                winner_name = f"{player['first_name']} {player['last_name']}"
                team = player['team'] or winner['team'] or "N/A"
                
            elif winner['id_coach'] is not None and winner['id_coach'] in coaches_data:
                # Coach award
                coach = coaches_data[winner['id_coach']]
                winner_name = f"{coach['first_name']} {coach['last_name']}"
                team = coach['team'] or winner['team'] or "N/A"
                
            elif winner['id_gm'] is not None and winner['id_gm'] in gms_data:
                # GM award
                gm = gms_data[winner['id_gm']]
                winner_name = f"{gm['first_name']} {gm['last_name']}"
                team = gm['team'] or winner['team'] or "N/A"
            
            award_entry = {
                'award_id': award['id'],
                'award_name': award['award'],
                'league': award['league'],
                'type': award['type'],
                'description': award['description'],
                'year': year,
                'winner': winner_name,
                'team': team,
                'id_player': winner['id_player'],
                'id_coach': winner['id_coach'],
                'id_gm': winner['id_gm']
            }
            
            awards_history[year].append(award_entry)
        
        # Log results for debugging
        logging.info(f"Processed award winners for years: {sorted(y for y, entries in awards_history.items() if entries)}")
        for year, winners in awards_history.items():
            if winners:
                logging.info(f"Year {year}: {len(winners)} winners")
        
        return awards_history
        
    except Exception as e:
        logging.error(f"Error in get_recent_award_winners: {str(e)}")
        logging.exception("Traceback:")
        empty_data = {year: [] for year in range(start_year, current_year + 1)}
        return empty_data

def generate_annual_awards_log():
    """
    Generates a log of all individual and team awards for each year
    """
    logging.info("Generating annual awards log...")
    
    supabase = get_supabase()
    
    # Get all awards
    awards_response = supabase.table('Awards').select('*').execute()
    all_awards = {award['id']: award for award in awards_response.data}
    
    # Get all winners data 
    winners_response = supabase.table('Awards_Winners').select('*').order('year', desc=True).execute()
    winners_data = winners_response.data
    
    # Get player information
    player_ids = [winner['id_player'] for winner in winners_data if winner['id_player'] is not None]
    players_data = {}
    if player_ids:
        players_query = supabase.table('Player').select('id, first_name, last_name').in_('id', player_ids).execute()
        players_data = {player['id']: player for player in players_query.data}
    
    # Get coach information
    coach_ids = [winner['id_coach'] for winner in winners_data if winner['id_coach'] is not None]
    coaches_data = {}
    if coach_ids:
        coaches_query = supabase.table('Staff_Coach').select('id, first_name, last_name').in_('id', coach_ids).execute()
        coaches_data = {coach['id']: coach for coach in coaches_query.data}
    
    # Get GM information
    gm_ids = [winner['id_gm'] for winner in winners_data if winner['id_gm'] is not None]
    gms_data = {}
    if gm_ids:
        gms_query = supabase.table('Staff_Gm').select('id, first_name, last_name').in_('id', gm_ids).execute()
        gms_data = {gm['id']: gm for gm in gms_query.data}
    
    # Organize data by year
    awards_by_year = {}
    for winner in winners_data:
        year = winner['year']
        if year not in awards_by_year:
            awards_by_year[year] = {
                'individual': [],
                'team': []
            }
        
        award_id = winner['id_award']
        if award_id not in all_awards:
            continue
            
        award = all_awards[award_id]
        
        # Determine award winner name
        if award['type'] == 'Team':
            winner_name = winner['team'] or "Unknown"
            award_entry = {
                'award': award['award'],
                'league': award['league'],
                'winner': winner_name
            }
            awards_by_year[year]['team'].append(award_entry)
        elif winner['id_player'] is not None and winner['id_player'] in players_data:
            player = players_data[winner['id_player']]
            winner_name = f"{player['first_name']} {player['last_name']}"
            award_entry = {
                'award': award['award'],
                'league': award['league'],
                'winner': winner_name,
                'team': winner['team']
            }
            awards_by_year[year]['individual'].append(award_entry)
        elif winner['id_coach'] is not None and winner['id_coach'] in coaches_data:
            coach = coaches_data[winner['id_coach']]
            winner_name = f"{coach['first_name']} {coach['last_name']}"
            award_entry = {
                'award': award['award'],
                'league': award['league'],
                'winner': winner_name,
                'team': winner['team'],
                'type': 'Coach'
            }
            awards_by_year[year]['individual'].append(award_entry)
        elif winner['id_gm'] is not None and winner['id_gm'] in gms_data:
            gm = gms_data[winner['id_gm']]
            winner_name = f"{gm['first_name']} {gm['last_name']}"
            award_entry = {
                'award': award['award'],
                'league': award['league'],
                'winner': winner_name,
                'team': winner['team'],
                'type': 'GM'
            }
            awards_by_year[year]['individual'].append(award_entry)
    
    # Generate log entries
    for year in sorted(awards_by_year.keys(), reverse=True):
        year_data = awards_by_year[year]
        
        logging.info(f"\n===== {year} AWARDS =====")
        
        if year_data['individual']:
            logging.info("\nINDIVIDUAL AWARDS:")
            for award in year_data['individual']:
                award_type = award.get('type', 'Player')
                logging.info(f"  {award['league']} {award['award']}: {award['winner']} ({award['team']}) - {award_type}")
        
        if year_data['team']:
            logging.info("\nTEAM AWARDS:")
            for award in year_data['team']:
                logging.info(f"  {award['league']} {award['award']}: {award['winner']}")
    
    logging.info("\nAwards log generation complete.")

def create_sample_award_winners():
    """
    Creates sample award winners data for testing purposes
    """
    supabase = get_supabase()
    current_year = datetime.now().year
    
    # First, get all existing awards
    awards_response = supabase.table('Awards').select('*').execute()
    awards = awards_response.data
    
    if not awards:
        logging.error("No awards found in database. Cannot create sample data.")
        return False
    
    # Clear existing award winners for clean test data
    existing_winners = supabase.table('Awards_Winners').select('*').execute()
    if existing_winners.data:
        for winner in existing_winners.data:
            supabase.table('Awards_Winners').delete().eq('id', winner['id']).execute()
            logging.info(f"Deleted existing award winner record with ID {winner['id']}")
    
    # Create sample data for current year and past years
    sample_winners = []
    
    # Get team data
    teams_response = supabase.table('Team').select('abbreviation').limit(20).execute()
    teams = [team['abbreviation'] for team in teams_response.data] or ['TOR', 'BOS', 'MTL', 'NYR', 'CHI', 'DET']
    
    # Get player data
    players_response = supabase.table('Player').select('id, team, first_name, last_name').limit(20).execute()
    players = players_response.data or []
    
    # Get coach data
    coaches_response = supabase.table('Staff_Coach').select('id, team, first_name, last_name').limit(10).execute()
    coaches = coaches_response.data or []
    
    # Get GM data
    gms_response = supabase.table('Staff_Gm').select('id, team, first_name, last_name').limit(10).execute()
    gms = gms_response.data or []
    
    for award in awards:
        award_id = award['id']
        
        # Create entries for years
        for offset in range(6):  # Create winners for last 6 years
            year = current_year - offset
            
            if award['type'] == 'Team':
                # For team awards
                if teams:
                    team = teams[offset % len(teams)]  # Cycle through teams
                    winner_data = {
                        'id_award': award_id,
                        'year': year,
                        'team': team,
                        'id_player': None,
                        'id_coach': None,
                        'id_gm': None
                    }
                    sample_winners.append(winner_data)
            else:
                # For individual awards
                if award['award'].lower().find('coach') >= 0 and coaches:
                    # Coach award
                    coach = coaches[offset % len(coaches)]
                    winner_data = {
                        'id_award': award_id,
                        'year': year,
                        'team': coach['team'],
                        'id_player': None,
                        'id_coach': coach['id'],
                        'id_gm': None
                    }
                    sample_winners.append(winner_data)
                elif (award['award'].lower().find('gm') >= 0 or award['award'].lower().find('manager') >= 0) and gms:
                    # GM award
                    gm = gms[offset % len(gms)]
                    winner_data = {
                        'id_award': award_id,
                        'year': year,
                        'team': gm['team'],
                        'id_player': None,
                        'id_coach': None,
                        'id_gm': gm['id']
                    }
                    sample_winners.append(winner_data)
                elif players:
                    # Player award
                    player = players[offset % len(players)]
                    winner_data = {
                        'id_award': award_id,
                        'year': year,
                        'team': player['team'],
                        'id_player': player['id'],
                        'id_coach': None,
                        'id_gm': None
                    }
                    sample_winners.append(winner_data)
                else:
                    # Fallback if no real data available
                    winner_data = {
                        'id_award': award_id,
                        'year': year,
                        'team': teams[offset % len(teams)] if teams else 'TOR',
                        'id_player': None,
                        'id_coach': None,
                        'id_gm': None
                    }
                    sample_winners.append(winner_data)
    
    # Insert winners
    for winner in sample_winners:
        insert_result = supabase.table('Awards_Winners').insert(winner).execute()
        logging.info(f"Created sample winner for award {winner['id_award']} in year {winner['year']}")
    
    return True

def get_test_award_winners():
    """
    Returns a static set of test award winner data for frontend testing
    """
    current_year = datetime.now().year
    
    # Create a structure that matches what the frontend expects
    test_data = {}
    
    # Generate data for the past 6 years
    for year in range(current_year - 5, current_year + 1):
        test_data[year] = [
            {
                'award_id': 1,
                'award_name': 'Stanley Cup',
                'league': 'NHL',
                'type': 'Team',
                'description': 'The Stanley Cup is awarded to the National Hockey League playoff champion.',
                'year': year,
                'winner': 'TOR',
                'team': 'TOR',
                'id_player': None,
                'id_coach': None,
                'id_gm': None
            },
            {
                'award_id': 2,
                'award_name': 'Presidents\' Trophy',
                'league': 'NHL',
                'type': 'Team',
                'description': 'Given to the team with the best regular-season record.',
                'year': year,
                'winner': 'BOS',
                'team': 'BOS',
                'id_player': None,
                'id_coach': None,
                'id_gm': None
            },
            {
                'award_id': 3,
                'award_name': 'Hart Memorial Trophy',
                'league': 'NHL',
                'type': 'Individual',
                'description': 'Given to the most valuable player in the league.',
                'year': year,
                'winner': 'Sidney Crosby',
                'team': 'PIT',
                'id_player': 123,
                'id_coach': None,
                'id_gm': None
            }
        ]
    
    return test_data

def get_award_winners_by_id(award_id):
    """
    Get all winners for a specific award ID
    
    Args:
        award_id: The ID of the award to get winners for
    
    Returns:
        List of award winner dictionaries
    """
    supabase = get_supabase()
    
    try:
        # Get all winners for this award
        response = supabase.table('Awards_Winners').select('*').eq('id_award', award_id).order('year', desc=True).execute()
        winners = response.data
        
        if not winners:
            logging.warning(f"No winners found for award ID {award_id}")
            return []
            
        # Get award details
        award_response = supabase.table('Awards').select('*').eq('id', award_id).execute()
        award = award_response.data[0] if award_response.data else None
        
        if not award:
            logging.warning(f"Award with ID {award_id} not found")
            return []
        
        # Get related data based on award type
        if award['type'] == 'Team':
            # Get team data
            team_abbreviations = [w['team'] for w in winners if w['team']]
            if team_abbreviations:
                teams_response = supabase.table('Team').select('abbreviation, team, location').in_('abbreviation', team_abbreviations).execute()
                teams_data = {team['abbreviation']: team for team in teams_response.data}
                
                # Enhance winners with team info
                for winner in winners:
                    if winner['team'] and winner['team'] in teams_data:
                        team = teams_data[winner['team']]
                        winner['winner'] = f"{team['location']} {team['team']}"
                    else:
                        winner['winner'] = winner['team'] or "Unknown"
        else:
            # Get player, coach, and GM data as needed
            player_ids = [w['id_player'] for w in winners if w['id_player']]
            coach_ids = [w['id_coach'] for w in winners if w['id_coach']]
            gm_ids = [w['id_gm'] for w in winners if w['id_gm']]
            
            # Players
            if player_ids:
                players_response = supabase.table('Player').select('id, first_name, last_name, team').in_('id', player_ids).execute()
                players_data = {p['id']: p for p in players_response.data}
                
            # Coaches
            if coach_ids:
                coaches_response = supabase.table('Staff_Coach').select('id, first_name, last_name, team').in_('id', coach_ids).execute()
                coaches_data = {c['id']: c for c in coaches_response.data}
                
            # GMs
            if gm_ids:
                gms_response = supabase.table('Staff_Gm').select('id, first_name, last_name, team').in_('id', gm_ids).execute()
                gms_data = {g['id']: g for g in gms_response.data}
                
            # Enhance winners with names
            for winner in winners:
                if winner['id_player'] and winner['id_player'] in players_data:
                    player = players_data[winner['id_player']]
                    winner['winner'] = f"{player['first_name']} {player['last_name']}"
                    winner['team'] = player['team'] or winner['team']
                elif winner['id_coach'] and winner['id_coach'] in coaches_data:
                    coach = coaches_data[winner['id_coach']]
                    winner['winner'] = f"{coach['first_name']} {coach['last_name']}"
                    winner['team'] = coach['team'] or winner['team']
                elif winner['id_gm'] and winner['id_gm'] in gms_data:
                    gm = gms_data[winner['id_gm']]
                    winner['winner'] = f"{gm['first_name']} {gm['last_name']}"
                    winner['team'] = gm['team'] or winner['team']
                else:
                    winner['winner'] = "Unknown"
        
        # Add award information to each winner
        for winner in winners:
            winner['award_id'] = award['id']
            winner['award_name'] = award['award']
            winner['league'] = award['league']
            winner['type'] = award['type']
            winner['description'] = award['description']
        
        return winners
        
    except Exception as e:
        logging.error(f"Error fetching winners for award ID {award_id}: {str(e)}")
        logging.exception("Traceback:")
        return []

# API Endpoints
@awards_bp.route('/', methods=['GET'])
def get_awards():
    """API endpoint to get all awards or filter by league/type"""
    try:
        league = request.args.get('league')
        award_type = request.args.get('type')
        
        if league:
            data = get_awards_by_league(league)
        elif award_type:
            data = get_awards_by_type(award_type)
        else:
            data = get_all_awards()
        
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@awards_bp.route('/recent', methods=['GET'])
def get_recent_winners():
    """API endpoint to get recent award winners"""
    try:
        years = request.args.get('years', default=6, type=int)
        data = get_recent_award_winners(years)
        logging.info(f"Returning recent awards winners data for {years} years with {sum(len(winners) for winners in data.values())} total winners")
        return jsonify({"data": data}), 200
    except Exception as e:
        logging.error(f"Error getting recent award winners: {str(e)}")
        return jsonify({"error": str(e)}), 500

@awards_bp.route('/log', methods=['GET'])
def generate_log():
    """API endpoint to generate and return the awards log"""
    try:
        generate_annual_awards_log()
        return jsonify({"message": "Awards log generated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@awards_bp.route('/winners/<int:year>', methods=['GET'])
def get_winners_by_year(year):
    """API endpoint to get award winners for a specific year"""
    try:
        data = get_award_winners_by_year(year)
        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@awards_bp.route('/create-samples', methods=['POST'])
def create_sample_data():
    """API endpoint to create sample awards winners data for testing"""
    try:
        result = create_sample_award_winners()
        if result:
            return jsonify({"message": "Sample award winners created successfully"}), 200
        else:
            return jsonify({"error": "Failed to create sample data"}), 500
    except Exception as e:
        logging.error(f"Error creating sample award winners: {str(e)}")
        return jsonify({"error": str(e)}), 500

@awards_bp.route('/test-data', methods=['GET'])
def get_test_data():
    """API endpoint to get test award winners data"""
    try:
        data = get_test_award_winners()
        return jsonify({"data": data}), 200
    except Exception as e:
        logging.error(f"Error getting test award winners: {str(e)}")
        return jsonify({"error": str(e)}), 500

@awards_bp.route('/winners/all', methods=['GET'])
def get_all_award_winners():
    """API endpoint to get all winners for a specific award"""
    try:
        award_id = request.args.get('award_id', type=int)
        
        if not award_id:
            return jsonify({"error": "Award ID is required"}), 400
            
        data = get_award_winners_by_id(award_id)
        return jsonify({"data": data}), 200
    except Exception as e:
        logging.error(f"Error getting all award winners: {str(e)}")
        return jsonify({"error": str(e)}), 500
