#!/usr/bin/env python3
"""
Script to view NHL draft results from the Supabase database.
Run this after simulate_draft.py to see the results of the draft simulation.
"""
import os
import sys
import json
import argparse
import pandas as pd
from typing import Dict, List, Any, Optional
from datetime import datetime
import tabulate
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in environment or .env file")
    sys.exit(1)

# Connect to Supabase
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Connected to Supabase successfully!")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    sys.exit(1)

def get_drafts():
    """Get all drafts from the database"""
    try:
        drafts = supabase.table('Draft').select('*').order('year', desc=True).execute()
        return drafts.data
    except Exception as e:
        print(f"Error fetching drafts: {e}")
        return []

def get_draft_by_year(year):
    """Get a draft by year"""
    try:
        draft = supabase.table('Draft').select('*').eq('year', year).execute()
        if draft.data:
            return draft.data[0]
        return None
    except Exception as e:
        print(f"Error fetching draft for year {year}: {e}")
        return None

def get_draft_picks(draft_id):
    """Get all picks for a draft"""
    try:
        # Get picks with player and team information
        picks = supabase.rpc(
            'get_draft_picks_with_details', 
            {'draft_id_param': draft_id}
        ).execute()
        
        if not picks.data:
            # Fallback to regular query if RPC is not available
            picks = supabase.table('DraftPick').select(
                '*,Team(id,name,abbreviation),Player(id,first_name,last_name,position_primary,nationality,overall,potential)'
            ).eq('draft_id', draft_id).order('overall_pick').execute()
        
        return picks.data
    except Exception as e:
        print(f"Error fetching draft picks: {e}")
        
        # Fallback to simple query without joins
        try:
            picks = supabase.table('DraftPick').select('*').eq('draft_id', draft_id).order('overall_pick').execute()
            
            # Enrich with player and team data
            for pick in picks.data:
                if pick.get('player_id'):
                    player = supabase.table('Player').select('*').eq('id', pick['player_id']).execute()
                    if player.data:
                        pick['player'] = player.data[0]
                        
                if pick.get('team_id'):
                    team = supabase.table('Team').select('*').eq('id', pick['team_id']).execute()
                    if team.data:
                        pick['team'] = team.data[0]
            
            return picks.data
        except Exception as e2:
            print(f"Error in fallback query: {e2}")
            return []

def get_team_draft_results(draft_id, team_id=None):
    """Get draft results for a specific team or all teams"""
    try:
        picks_query = supabase.table('DraftPick').select(
            '*,Player(id,first_name,last_name,position_primary,nationality,overall,potential)'
        ).eq('draft_id', draft_id)
        
        if team_id:
            picks_query = picks_query.eq('team_id', team_id)
            
        picks = picks_query.order('round_num', 'pick_num').execute()
        
        return picks.data
    except Exception as e:
        print(f"Error fetching team draft results: {e}")
        return []

def get_player_details(player_id):
    """Get detailed information about a player"""
    try:
        player = supabase.table('Player').select('*').eq('id', player_id).execute()
        if player.data:
            return player.data[0]
        return None
    except Exception as e:
        print(f"Error fetching player details: {e}")
        return None

def get_team_details(team_id):
    """Get detailed information about a team"""
    try:
        team = supabase.table('Team').select('*').eq('id', team_id).execute()
        if team.data:
            return team.data[0]
        return None
    except Exception as e:
        print(f"Error fetching team details: {e}")
        return None

def get_all_teams():
    """Get all teams from the database"""
    try:
        teams = supabase.table('Team').select('*').order('name').execute()
        return teams.data
    except Exception as e:
        print(f"Error fetching teams: {e}")
        return []

def format_pick_data(pick, include_team=True):
    """Format pick data for display"""
    if not pick:
        return ['N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']
    
    player = pick.get('Player', {})
    if not player and pick.get('player'):
        player = pick['player']
        
    team = pick.get('Team', {})
    if not team and pick.get('team'):
        team = pick['team']
    
    # Handle nested player data structure if present
    first_name = player.get('first_name', 'N/A') if player else 'N/A'
    last_name = player.get('last_name', 'N/A') if player else 'N/A'
    position = player.get('position_primary', 'N/A') if player else 'N/A'
    nationality = player.get('nationality', 'N/A') if player else 'N/A'
    overall = player.get('overall', 'N/A') if player else 'N/A'
    potential = player.get('potential', 'N/A') if player else 'N/A'
    
    team_name = team.get('name', 'N/A') if team else 'N/A'
    team_abbr = team.get('abbreviation', 'N/A') if team else 'N/A'
    
    if include_team:
        return [
            f"{pick.get('overall_pick', 'N/A')}",
            f"Round {pick.get('round_num', 'N/A')}, Pick {pick.get('pick_num', 'N/A')}",
            team_abbr,
            f"{first_name} {last_name}",
            position,
            nationality,
            overall,
            potential
        ]
    else:
        return [
            f"{pick.get('overall_pick', 'N/A')}",
            f"Round {pick.get('round_num', 'N/A')}, Pick {pick.get('pick_num', 'N/A')}",
            f"{first_name} {last_name}",
            position,
            nationality,
            overall,
            potential
        ]

def list_drafts():
    """List all drafts in the database"""
    drafts = get_drafts()
    
    if not drafts:
        print("No drafts found in the database.")
        return
    
    print("\nAvailable Drafts:")
    table_data = []
    
    for draft in drafts:
        # Get a sample of picks to determine how many were made
        picks = supabase.table('DraftPick').select('count').eq('draft_id', draft['id']).execute()
        pick_count = picks.count if hasattr(picks, 'count') else len(picks.data)
        
        table_data.append([
            draft['year'],
            draft['status'],
            draft['round_count'],
            pick_count,
            f"Round {draft.get('current_round', 'N/A')}, Pick {draft.get('current_pick', 'N/A')}",
            draft['created_at'][:10] if draft.get('created_at') else 'N/A'
        ])
    
    headers = ["Year", "Status", "Rounds", "Picks", "Current Position", "Created"]
    print(tabulate.tabulate(table_data, headers=headers, tablefmt="grid"))

def display_draft_summary(year=None):
    """Display a summary of a specific draft"""
    if year is None:
        # Get most recent draft if year not specified
        drafts = get_drafts()
        if not drafts:
            print("No drafts found in the database.")
            return
        draft = drafts[0]
    else:
        draft = get_draft_by_year(year)
        if not draft:
            print(f"No draft found for year {year}.")
            return
    
    # Get all picks for this draft
    picks = get_draft_picks(draft['id'])
    
    print(f"\n{draft['year']} NHL Draft Summary")
    print(f"Status: {draft['status']}")
    print(f"Rounds: {draft['round_count']}")
    print(f"Total Picks: {len(picks)}")
    print(f"Current Position: Round {draft.get('current_round', 'N/A')}, Pick {draft.get('current_pick', 'N/A')}")
    
    # Count picks by position
    positions = {}
    for pick in picks:
        player = pick.get('Player', {})
        if not player and pick.get('player'):
            player = pick['player']
        
        if player:
            pos = player.get('position_primary', 'Unknown')
            positions[pos] = positions.get(pos, 0) + 1
    
    print("\nPositions Drafted:")
    for pos, count in sorted(positions.items(), key=lambda x: x[1], reverse=True):
        print(f"{pos}: {count} ({count/len(picks)*100:.1f}%)")
    
    # First round picks
    first_round = [p for p in picks if p.get('round_num') == 1]
    
    print("\nFirst Round Picks:")
    table_data = [format_pick_data(pick) for pick in first_round]
    headers = ["Overall", "Pick", "Team", "Player", "Pos", "Nation", "Overall", "Potential"]
    print(tabulate.tabulate(table_data, headers=headers, tablefmt="grid"))

def display_team_draft(year=None, team_id=None, team_name=None):
    """Display draft results for a specific team"""
    # Determine year
    if year is None:
        # Get most recent draft if year not specified
        drafts = get_drafts()
        if not drafts:
            print("No drafts found in the database.")
            return
        draft = drafts[0]
        year = draft['year']
    else:
        draft = get_draft_by_year(year)
        if not draft:
            print(f"No draft found for year {year}.")
            return
    
    # Determine team
    if not team_id and team_name:
        # Look up team by name
        teams = supabase.table('Team').select('*').ilike('name', f"%{team_name}%").execute()
        if not teams.data:
            print(f"No team found matching '{team_name}'.")
            
            # Suggest teams
            all_teams = get_all_teams()
            print("\nAvailable teams:")
            for team in all_teams:
                print(f"- {team['name']} ({team['id']})")
            return
        
        team_id = teams.data[0]['id']
        team_name = teams.data[0]['name']
    elif team_id:
        team = get_team_details(team_id)
        if not team:
            print(f"No team found with ID {team_id}.")
            return
        team_name = team['name']
    else:
        # List all team picks
        teams = get_all_teams()
        draft_picks = get_draft_picks(draft['id'])
        
        print(f"\n{year} NHL Draft - All Team Selections:")
        for team in teams:
            team_picks = [p for p in draft_picks if p.get('team_id') == team['id']]
            if team_picks:
                print(f"\n{team['name']} ({len(team_picks)} picks):")
                table_data = [format_pick_data(pick, include_team=False) for pick in team_picks]
                headers = ["Overall", "Pick", "Player", "Pos", "Nation", "Overall", "Potential"]
                print(tabulate.tabulate(table_data, headers=headers, tablefmt="grid"))
        return
    
    # Get team picks
    team_picks = get_team_draft_results(draft['id'], team_id)
    
    print(f"\n{year} NHL Draft - {team_name} Selections:")
    if not team_picks:
        print(f"No picks found for {team_name} in the {year} draft.")
        return
    
    table_data = [format_pick_data(pick, include_team=False) for pick in team_picks]
    headers = ["Overall", "Pick", "Player", "Pos", "Nation", "Overall", "Potential"]
    print(tabulate.tabulate(table_data, headers=headers, tablefmt="grid"))

def display_round(year=None, round_num=1):
    """Display all picks for a specific round"""
    # Determine year
    if year is None:
        # Get most recent draft if year not specified
        drafts = get_drafts()
        if not drafts:
            print("No drafts found in the database.")
            return
        draft = drafts[0]
        year = draft['year']
    else:
        draft = get_draft_by_year(year)
        if not draft:
            print(f"No draft found for year {year}.")
            return
    
    # Get all picks for this draft
    all_picks = get_draft_picks(draft['id'])
    
    # Filter by round
    round_picks = [p for p in all_picks if p.get('round_num') == round_num]
    
    if not round_picks:
        print(f"No picks found for round {round_num} in the {year} draft.")
        return
    
    print(f"\n{year} NHL Draft - Round {round_num}:")
    table_data = [format_pick_data(pick) for pick in round_picks]
    headers = ["Overall", "Pick", "Team", "Player", "Pos", "Nation", "Overall", "Potential"]
    print(tabulate.tabulate(table_data, headers=headers, tablefmt="grid"))

def display_full_draft(year=None):
    """Display the entire draft, all rounds and picks"""
    # Determine year
    if year is None:
        # Get most recent draft if year not specified
        drafts = get_drafts()
        if not drafts:
            print("No drafts found in the database.")
            return
        draft = drafts[0]
        year = draft['year']
    else:
        draft = get_draft_by_year(year)
        if not draft:
            print(f"No draft found for year {year}.")
            return
    
    # Get all picks for this draft
    all_picks = get_draft_picks(draft['id'])
    
    if not all_picks:
        print(f"No picks found for the {year} draft.")
        return
    
    print(f"\n{year} NHL Draft - All Rounds and Picks:")
    
    # Group by round
    for round_num in range(1, draft['round_count'] + 1):
        round_picks = [p for p in all_picks if p.get('round_num') == round_num]
        
        if round_picks:
            print(f"\nRound {round_num}:")
            table_data = [format_pick_data(pick) for pick in round_picks]
            headers = ["Overall", "Pick", "Team", "Player", "Pos", "Nation", "Overall", "Potential"]
            print(tabulate.tabulate(table_data, headers=headers, tablefmt="grid"))

def display_position_picks(year=None, position=None):
    """Display all picks for a specific position"""
    # Determine year
    if year is None:
        # Get most recent draft if year not specified
        drafts = get_drafts()
        if not drafts:
            print("No drafts found in the database.")
            return
        draft = drafts[0]
        year = draft['year']
    else:
        draft = get_draft_by_year(year)
        if not draft:
            print(f"No draft found for year {year}.")
            return
    
    # Validate position
    valid_positions = ['C', 'LW', 'RW', 'D', 'G']
    if position and position not in valid_positions:
        print(f"Invalid position '{position}'. Valid positions are: {', '.join(valid_positions)}")
        return
    
    # Get all picks for this draft
    all_picks = get_draft_picks(draft['id'])
    
    if not all_picks:
        print(f"No picks found for the {year} draft.")
        return
    
    # Filter by position if specified
    if position:
        position_picks = []
        for pick in all_picks:
            player = pick.get('Player', {})
            if not player and pick.get('player'):
                player = pick['player']
            
            if player and player.get('position_primary') == position:
                position_picks.append(pick)
        
        if not position_picks:
            print(f"No {position} players were drafted in the {year} draft.")
            return
        
        print(f"\n{year} NHL Draft - {position} Players Selected:")
        table_data = [format_pick_data(pick) for pick in position_picks]
        headers = ["Overall", "Pick", "Team", "Player", "Pos", "Nation", "Overall", "Potential"]
        print(tabulate.tabulate(table_data, headers=headers, tablefmt="grid"))
    else:
        # Group by position
        positions = {}
        for pick in all_picks:
            player = pick.get('Player', {})
            if not player and pick.get('player'):
                player = pick['player']
            
            if player:
                pos = player.get('position_primary', 'Unknown')
                if pos not in positions:
                    positions[pos] = []
                positions[pos].append(pick)
        
        for pos in sorted(positions.keys()):
            print(f"\n{year} NHL Draft - {pos} Players Selected ({len(positions[pos])}):")
            table_data = [format_pick_data(pick) for pick in positions[pos]]
            headers = ["Overall", "Pick", "Team", "Player", "Pos", "Nation", "Overall", "Potential"]
            print(tabulate.tabulate(table_data, headers=headers, tablefmt="grid"))

def display_player_details(player_id):
    """Display detailed information about a drafted player"""
    player = get_player_details(player_id)
    
    if not player:
        print(f"No player found with ID {player_id}.")
        return
    
    # Get player's team if they were drafted
    team = None
    if player.get('team'):
        team = get_team_details(player['team'])
    
    print(f"\nPlayer Details: {player['first_name']} {player['last_name']}")
    print(f"Position: {player.get('position_primary', 'N/A')} (Secondary: {player.get('position_secondary', 'None')})")
    print(f"Nationality: {player.get('nationality', 'N/A')}")
    print(f"Birth Date: {player.get('date_of_birth', 'N/A')}")
    print(f"Height: {player.get('height', 'N/A')} cm")
    print(f"Weight: {player.get('weight', 'N/A')} kg")
    print(f"Overall Rating: {player.get('overall', 'N/A')}")
    print(f"Potential: {player.get('potential', 'N/A')}")
    
    if team:
        print(f"Drafted by: {team['name']} ({team.get('abbreviation', 'N/A')})")
        print(f"Entry Draft: {player.get('entry_draft_year', 'N/A')}, " + 
              f"Round {player.get('entry_draft_round', 'N/A')}, " + 
              f"Pick {player.get('entry_draft_position', 'N/A')}")
    else:
        print("Draft Status: Undrafted")
    
    # Display attribute ratings
    print("\nAttribute Ratings:")
    attributes = [
        ("Skating", player.get('skating', 'N/A')),
        ("Shooting Power", player.get('shooting_power', 'N/A')),
        ("Shooting Accuracy", player.get('shooting_accuracy', 'N/A')),
        ("Shooting Skill", player.get('shooting_skill', 'N/A')),
        ("Stickhandling", player.get('stickhandling', 'N/A')),
        ("Passing", player.get('passing', 'N/A')),
        ("Offensive IQ", player.get('offensive_iq', 'N/A')),
        ("Defensive IQ", player.get('defensive_iq', 'N/A')),
        ("Checking", player.get('checking', 'N/A')),
        ("Defense", player.get('defense', 'N/A')),
        ("Poise", player.get('poise', 'N/A')),
        ("Aggressiveness", player.get('aggressiveness', 'N/A')),
        ("High IQ", player.get('high_iq', 'N/A')),
        ("Competitiveness", player.get('competitiveness', 'N/A')),
    ]
    
    # Goalie attributes
    if player.get('position_primary') == 'G':
        goalie_attributes = [
            ("Reflexes", player.get('goalie_reflexes', 'N/A')),
            ("Positioning", player.get('goalie_positioning', 'N/A')),
            ("Puck Control", player.get('goalie_puck_control', 'N/A')),
        ]
        attributes.extend(goalie_attributes)
    
    # Display in a table
    table_data = [[attr, rating] for attr, rating in attributes]
    print(tabulate.tabulate(table_data, headers=["Attribute", "Rating"], tablefmt="grid"))

def parse_arguments():
    parser = argparse.ArgumentParser(description='View NHL Draft results from the Supabase database')
    
    # Main command options
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # List all drafts
    list_parser = subparsers.add_parser('list', help='List all drafts in the database')
    
    # Display draft summary
    summary_parser = subparsers.add_parser('summary', help='Display a summary of a draft')
    summary_parser.add_argument('--year', type=int, help='Draft year')
    
    # Display team draft results
    team_parser = subparsers.add_parser('team', help='Display draft results for a team')
    team_parser.add_argument('--year', type=int, help='Draft year')
    team_parser.add_argument('--id', type=int, help='Team ID')
    team_parser.add_argument('--name', type=str, help='Team name (partial match)')
    
    # Display round
    round_parser = subparsers.add_parser('round', help='Display all picks for a round')
    round_parser.add_argument('--year', type=int, help='Draft year')
    round_parser.add_argument('--number', type=int, default=1, help='Round number')
    
    # Display full draft
    full_parser = subparsers.add_parser('full', help='Display the entire draft')
    full_parser.add_argument('--year', type=int, help='Draft year')
    
    # Display position picks
    position_parser = subparsers.add_parser('position', help='Display picks by position')
    position_parser.add_argument('--year', type=int, help='Draft year')
    position_parser.add_argument('--position', type=str, help='Position (C, LW, RW, D, G)')
    
    # Display player details
    player_parser = subparsers.add_parser('player', help='Display player details')
    player_parser.add_argument('--id', type=int, required=True, help='Player ID')
    
    # Default is summary of most recent draft if no command given
    return parser.parse_args()

def main():
    args = parse_arguments()
    
    # Default to summary of most recent draft if no command given
    if not args.command:
        display_draft_summary()
        return
    
    # Handle commands
    if args.command == 'list':
        list_drafts()
    
    elif args.command == 'summary':
        display_draft_summary(args.year)
    
    elif args.command == 'team':
        display_team_draft(args.year, args.id, args.name)
    
    elif args.command == 'round':
        display_round(args.year, args.number)
    
    elif args.command == 'full':
        display_full_draft(args.year)
    
    elif args.command == 'position':
        display_position_picks(args.year, args.position)
    
    elif args.command == 'player':
        display_player_details(args.id)

if __name__ == "__main__":
    main() 