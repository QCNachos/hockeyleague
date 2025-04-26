#!/usr/bin/env python3
"""
Script to simulate an NHL draft using the centralized Supabase endpoint.
"""
import os
import sys
import json
import time
import random
import argparse
import requests
from datetime import datetime
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API base URL
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5001')

# Constants
DEFAULT_ROUND_COUNT = 7  # Standard NHL draft is 7 rounds
TEAM_NEEDS = {
    "C": 1.2,    # Center is usually valuable
    "LW": 1.0,
    "RW": 1.0,
    "D": 1.1,    # Defensemen slightly more valuable
    "G": 0.8     # Goalies slightly less valuable
}

# Team draft strategies
STRATEGIES = [
    "BEST_AVAILABLE",  # Pick the best overall player regardless of position
    "POSITION_NEED",   # Prioritize positions the team needs
    "OFFENSIVE",       # Prioritize offensive players
    "DEFENSIVE",       # Prioritize defensive players
    "HIGH_POTENTIAL",  # Prioritize players with high potential over current skill
    "NHL_READY"        # Prioritize players who can play immediately
]

class DraftSimulator:
    def __init__(self, year: int = None, rounds: int = 7, interactive: bool = False):
        self.year = year or datetime.now().year
        self.rounds = rounds
        self.interactive = interactive
        self.team_strategies = {}
        self.draft_id = None
        self.current_round = 1
        self.current_pick = 1
        self.overall_pick = 1
        self.draft_order = []
        self.positions_map = {
            'C': 'Center',
            'LW': 'Left Wing',
            'RW': 'Right Wing',
            'D': 'Defenseman',
            'G': 'Goalie'
        }

    def fetch_data(self, table_name, filters=None, select=None):
        """Fetch data from the Supabase API endpoint"""
        url = f"{API_BASE_URL}/api/supabase/{table_name}"
        params = {}
        
        if filters:
            params['filters'] = json.dumps(filters)
        if select:
            params['select'] = select
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()['data']
        else:
            print(f"Error fetching data from {table_name}: {response.text}")
            return []

    def fetch_item(self, table_name, item_id, id_column='id'):
        """Fetch a single item from the Supabase API endpoint"""
        url = f"{API_BASE_URL}/api/supabase/{table_name}/{item_id}"
        params = {}
        
        if id_column != 'id':
            params['id_column'] = id_column
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()['data']
        else:
            print(f"Error fetching item from {table_name}: {response.text}")
            return None

    def check_prerequisites(self) -> bool:
        """Check if teams and prospects exist in the database."""
        teams = self.fetch_data("Team", select="id")
        if not teams:
            print("Error: No teams found in database")
            return False

        # Count prospects
        year_start = f"{self.year - 18}-01-01"  # 18-year-olds
        year_end = f"{self.year - 17}-12-31"    # 17-year-olds
        
        filters = {
            "team_id": None,
            "birthdate_gte": year_start,
            "birthdate_lte": year_end
        }
        
        prospects = self.fetch_data("Player", filters=filters, select="id")
        
        prospects_count = len(prospects)
        if prospects_count < 32 * self.rounds:  # Minimum needed for a full draft
            print(f"Warning: Only {prospects_count} prospects found, which may not be enough for a full {self.rounds}-round draft with 32 teams")
            return False
        
        print(f"Found {prospects_count} draft-eligible prospects")
        return True

    def assign_team_strategies(self):
        """Assign random draft strategies to teams."""
        teams = self.fetch_data("Team", select="id,name")
        for team in teams:
            self.team_strategies[team['id']] = {
                'strategy': random.choice(STRATEGIES),
                'name': team['name']
            }
            
        print("Assigned draft strategies to teams")
        
    def generate_draft_order(self):
        """Generate draft order based on team prestige."""
        teams = self.fetch_data("Team", select="id,prestige,name")
        
        # Sort teams by prestige (lower prestige gets higher draft pick)
        teams_list = sorted(teams, key=lambda x: x.get('prestige', 50))
        
        # Create draft order
        self.draft_order = []
        for round_num in range(1, self.rounds + 1):
            round_picks = []
            for pick_num, team in enumerate(teams_list, 1):
                round_picks.append({
                    'round': round_num,
                    'pick': pick_num,
                    'team_id': team['id'],
                    'team_name': team['name'],
                    'overall': (round_num - 1) * len(teams_list) + pick_num
                })
            
            # In even rounds, reverse the order (snake draft)
            if round_num % 2 == 0:
                round_picks.reverse()
                
            self.draft_order.extend(round_picks)
            
        print(f"Generated draft order for {self.rounds} rounds")
        return self.draft_order

    def initialize_draft(self):
        """Initialize the draft in the database."""
        # Create draft record
        draft_data = {
            'year': self.year,
            'round_count': self.rounds,
            'status': 'in_progress',
            'current_round': 1,
            'current_pick': 1
        }
        
        draft_response = requests.post(f"{API_BASE_URL}/api/supabase/Draft", json=draft_data)
        
        if not draft_response.json():
            print("Error creating draft")
            return False
            
        self.draft_id = draft_response.json()[0]['id']
        
        # Create draft picks
        picks_data = []
        for pick in self.draft_order:
            picks_data.append({
                'draft_id': self.draft_id,
                'round_num': pick['round'],
                'pick_num': pick['pick'],
                'team_id': pick['team_id'],
                'overall_pick': pick['overall']
            })
            
        if picks_data:
            picks_response = requests.post(f"{API_BASE_URL}/api/supabase/DraftPick", json=picks_data)
            
        print(f"Initialized draft {self.draft_id} for year {self.year}")
        return True

    def get_available_prospects(self):
        """Get all available draft-eligible prospects."""
        year_start = f"{self.year - 18}-01-01"
        year_end = f"{self.year - 17}-12-31"
        
        prospects = self.fetch_data("Player", filters={
            "team_id": None,
            "draft_id": None,
            "birthdate_gte": year_start,
            "birthdate_lte": year_end
        }, select="*")
            
        return prospects

    def calculate_team_needs(self, team_id):
        """Calculate position needs for a team."""
        team_players = self.fetch_data("Player", filters={
            "team_id": team_id,
            "position_primary": True
        }, select="position_primary")
            
        positions = {'C': 0, 'LW': 0, 'RW': 0, 'D': 0, 'G': 0}
        
        # Count current players by position
        for player in team_players:
            pos = player.get('position_primary')
            if pos in positions:
                positions[pos] += 1
                
        # Calculate needs (lower count = higher need)
        total = sum(positions.values())
        if total == 0:
            # New team with no players, needs everything
            return {pos: 1.0 for pos in positions}
            
        # Invert and normalize to get needs (0-1 scale where 1 = highest need)
        max_count = max(positions.values())
        if max_count == 0:
            max_count = 1
            
        needs = {}
        for pos, count in positions.items():
            # Positions with fewer players have higher need
            needs[pos] = 1 - (count / max_count)
            
        return needs

    def evaluate_prospect(self, prospect, team_id, strategy):
        """Evaluate a prospect based on team strategy and needs."""
        # Base score is overall rating
        score = prospect.get('overall', 0)
        
        # Get team needs
        team_needs = self.calculate_team_needs(team_id)
        position = prospect.get('position_primary', 'C')
        
        # Apply strategy adjustments
        if strategy == "BEST_AVAILABLE":
            # No adjustment, just use overall rating
            pass
            
        elif strategy == "POSITION_NEED":
            # Boost score based on team needs for this position
            need_factor = team_needs.get(position, 0.5)
            score = score * (1 + need_factor * 0.5)
            
        elif strategy == "OFFENSIVE":
            # Prioritize offensive positions and skills
            if position in ['C', 'LW', 'RW']:
                score *= 1.2
            # Prioritize offensive attributes
            offensive_rating = (
                prospect.get('shooting_skill', 0) + 
                prospect.get('shooting_accuracy', 0) + 
                prospect.get('stickhandling', 0) + 
                prospect.get('offensive_awareness', 0)
            ) / 4
            score = score * 0.7 + offensive_rating * 0.3
            
        elif strategy == "DEFENSIVE":
            # Prioritize defensive positions and skills
            if position in ['D', 'G']:
                score *= 1.2
            # Prioritize defensive attributes
            defensive_rating = (
                prospect.get('defense', 0) + 
                prospect.get('shotblocking', 0) + 
                prospect.get('defensive_awareness', 0) + 
                prospect.get('strength', 0)
            ) / 4
            score = score * 0.7 + defensive_rating * 0.3
            
        elif strategy == "HIGH_POTENTIAL":
            # Prioritize potential over current skill
            potential_score = 0
            potential = prospect.get('potential', 'Average')
            
            # Map potential to numeric value
            potential_map = {
                "High Elite": 100,
                "Elite": 90,
                "Medium Elite": 85,
                "Low Elite": 80,
                "High Top 6/4": 75,
                "Top 6/4": 70,
                "Medium Top 6/4": 65,
                "Low Top 6/4": 60,
                "High Top 9/6": 55,
                "Top 9/6": 50,
                "Medium Top 9/6": 45,
                "Low Top 9/6": 40,
                "High Bottom 6/Fringe": 35,
                "Bottom 6/Fringe": 30,
                "Medium Bottom 6/Fringe": 25,
                "Low Bottom 6/Fringe": 20,
                "Average": 10
            }
            
            potential_score = potential_map.get(potential, 10)
            score = score * 0.3 + potential_score * 0.7
            
        elif strategy == "NHL_READY":
            # Prioritize older, more developed players
            age = self.year - int(prospect.get('birthdate', '2000-01-01')[:4])
            if age >= 20:
                score *= 1.3
            elif age >= 19:
                score *= 1.2
            elif age >= 18:
                score *= 1.1
                
        # Add some randomness to make draft less predictable
        score += random.uniform(-5, 5)
            
        return score

    def make_pick(self, pick_data):
        """Make a draft pick."""
        team_id = pick_data['team_id']
        team_name = pick_data['team_name']
        strategy = self.team_strategies.get(team_id, {}).get('strategy', 'BEST_AVAILABLE')
        
        # Get available prospects
        prospects = self.get_available_prospects()
        if not prospects:
            print(f"No prospects available for pick {pick_data['overall']}")
            return None
            
        # Evaluate each prospect based on team strategy
        prospect_scores = []
        for prospect in prospects:
            score = self.evaluate_prospect(prospect, team_id, strategy)
            prospect_scores.append((prospect, score))
            
        # Sort by score (highest first)
        prospect_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Select top prospect
        selected_prospect, score = prospect_scores[0]
        
        # Update the draft pick with the selected prospect
        pick_update = {
            'player_id': selected_prospect['id'],
            'prospect_id': selected_prospect['id']
        }
        
        pick_response = requests.put(f"{API_BASE_URL}/api/supabase/DraftPick/{self.draft_id}/{pick_data['round']}/{pick_data['pick']}", json=pick_update)
            
        # Update player with draft information
        player_update = {
            'draft_id': self.draft_id,
            'draft_overall': pick_data['overall'],
            'draft_round': pick_data['round'],
            'draft_year': self.year,
            'rights_owned_by': team_id
        }
        
        player_response = requests.put(f"{API_BASE_URL}/api/supabase/Player/{selected_prospect['id']}", json=player_update)
            
        return {
            'pick': pick_data,
            'prospect': selected_prospect,
            'score': score
        }

    def display_pick(self, pick_result):
        """Display information about a draft pick."""
        if not pick_result:
            return
            
        pick = pick_result['pick']
        prospect = pick_result['prospect']
        
        print("\n" + "=" * 60)
        print(f"Round {pick['round']} | Pick {pick['pick']} | Overall {pick['overall']}")
        print(f"Team: {pick['team_name']}")
        print(f"Strategy: {self.team_strategies.get(pick['team_id'], {}).get('strategy', 'BEST_AVAILABLE')}")
        print("-" * 60)
        print(f"Selected: {prospect.get('first_name', '')} {prospect.get('last_name', '')}")
        print(f"Position: {self.positions_map.get(prospect.get('position_primary', ''), prospect.get('position_primary', ''))}")
        print(f"Age: {self.year - int(prospect.get('birthdate', '2000')[:4])}")
        
        nationality = prospect.get('nationality', '')
        if nationality:
            print(f"Nationality: {nationality}")
            
        overall = prospect.get('overall', 0)
        potential = prospect.get('potential', 'Average')
        print(f"Overall Rating: {overall}")
        print(f"Potential: {potential}")
        
        # Show some key attributes based on position
        position = prospect.get('position_primary', '')
        if position in ['C', 'LW', 'RW']:
            print("\nKey Attributes:")
            print(f"Skating: {prospect.get('skating', 0)}")
            print(f"Shooting: {prospect.get('shooting_skill', 0)}")
            print(f"Puck Control: {prospect.get('stickhandling', 0)}")
            print(f"Offensive Awareness: {prospect.get('offensive_awareness', 0)}")
        elif position == 'D':
            print("\nKey Attributes:")
            print(f"Skating: {prospect.get('skating', 0)}")
            print(f"Shot Blocking: {prospect.get('shotblocking', 0)}")
            print(f"Defensive Awareness: {prospect.get('defensive_awareness', 0)}")
            print(f"Physical: {prospect.get('strength', 0)}")
        elif position == 'G':
            print("\nKey Attributes:")
            print(f"Reflexes: {prospect.get('goalie_reflexes', 0)}")
            print(f"Positioning: {prospect.get('goalie_positioning', 0)}")
            print(f"Rebound Control: {prospect.get('goalie_rebound_control', 0)}")
            
        print("=" * 60)
        
        if self.interactive:
            input("Press Enter to continue to next pick...")

    def update_draft_status(self):
        """Update the current round and pick in the draft record."""
        update_data = {
            'current_round': self.current_round,
            'current_pick': self.current_pick,
            'status': 'in_progress'
        }
        
        if self.overall_pick > len(self.draft_order):
            update_data['status'] = 'completed'
            
        draft_response = requests.put(f"{API_BASE_URL}/api/supabase/Draft/{self.draft_id}", json=update_data)

    def run_draft(self):
        """Run the entire draft simulation."""
        # Check prerequisites
        if not self.check_prerequisites():
            return False
            
        # Assign team strategies
        self.assign_team_strategies()
        
        # Generate draft order
        self.generate_draft_order()
        
        # Initialize draft in database
        if not self.initialize_draft():
            return False
            
        print(f"\nStarting {self.year} NHL Draft Simulation ({self.rounds} rounds)")
        print(f"Total picks: {len(self.draft_order)}")
        
        if self.interactive:
            input("Press Enter to begin the draft...")
            
        # Make picks
        for pick_index, pick in enumerate(self.draft_order):
            self.current_round = pick['round']
            self.current_pick = pick['pick']
            self.overall_pick = pick['overall']
            
            # Update draft status
            self.update_draft_status()
            
            # Make the pick
            pick_result = self.make_pick(pick)
            
            # Display pick information
            self.display_pick(pick_result)
            
            # Small delay between picks if not interactive
            if not self.interactive:
                time.sleep(0.1)
                
        # Update draft as completed
        draft_response = requests.put(f"{API_BASE_URL}/api/supabase/Draft/{self.draft_id}", json={'status': 'completed'})
            
        print(f"\nDraft completed! Draft ID: {self.draft_id}")
        print("You can view the results using the view_draft_results.py script.")
        return True

def parse_arguments():
    parser = argparse.ArgumentParser(description='Simulate an NHL Draft in the Supabase database')
    parser.add_argument('--year', type=int, default=datetime.now().year,
                        help=f'Draft year (default: {datetime.now().year})')
    parser.add_argument('--rounds', type=int, default=DEFAULT_ROUND_COUNT,
                        help=f'Number of draft rounds (default: {DEFAULT_ROUND_COUNT})')
    parser.add_argument('--interactive', action='store_true',
                        help='Interactive mode - pause between rounds')
    
    return parser.parse_args()

def main():
    args = parse_arguments()
    
    simulator = DraftSimulator(
        year=args.year,
        rounds=args.rounds,
        interactive=args.interactive
    )
    
    simulator.run_draft()
    

if __name__ == "__main__":
    main() 