#!/usr/bin/env python3
"""
Script to view draft picks by team from Supabase.
"""
import os
import sys
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from supabase import create_client, Client
import pandas as pd
from tabulate import tabulate
import json

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

def list_drafts() -> None:
    """List all drafts in the database."""
    try:
        # Query all drafts, ordered by year
        response = supabase.table("Draft").select("*").order("year", desc=True).execute()
        
        if not response.data:
            print("No drafts found in the database.")
            return
        
        # Convert to DataFrame for nice display
        df = pd.DataFrame(response.data)
        print("\nAvailable Drafts:")
        print(tabulate(df, headers="keys", tablefmt="pretty", showindex=False))
    except Exception as e:
        print(f"Error listing drafts: {e}")

def list_draft_picks(draft_id: Optional[int] = None, team_id: Optional[int] = None) -> None:
    """
    List draft picks for a specific draft, optionally filtered by team.
    
    Args:
        draft_id: The draft ID to view. If None, shows the most recent draft.
        team_id: The team ID to filter by. If None, shows all teams.
    """
    try:
        # Build query
        query = supabase.table("Draft_Picks").select("*, Team(*), Player(*)")
        
        if draft_id:
            query = query.eq("draft_id", draft_id)
        
        if team_id:
            query = query.eq("team_id", team_id)
        
        # Execute query
        response = query.order("overall_pick").execute()
        
        if not response.data:
            filter_msg = f" for draft ID {draft_id}" if draft_id else ""
            filter_msg += f" and team ID {team_id}" if team_id else ""
            print(f"No draft picks found{filter_msg}.")
            return
        
        # Format data for display
        formatted_picks = []
        for pick in response.data:
            team_name = pick['Team']['team'] if pick.get('Team') else "Unknown Team"
            player_name = f"{pick['Player']['first_name']} {pick['Player']['last_name']}" if pick.get('Player') else "Not Selected"
            position = pick['Player']['position_primary'] if pick.get('Player') else "-"
            overall = pick['Player']['overall_rating'] if pick.get('Player') else "-"
            potential = pick['Player']['potential'] if pick.get('Player') and pick['Player'].get('potential') else "-"
            
            formatted_picks.append({
                "Overall": pick['overall_pick'],
                "Round": pick['round_num'],
                "Pick in Rd": pick['pick_num'],
                "Team": team_name,
                "Player": player_name,
                "Position": position,
                "Rating": overall,
                "Potential": potential
            })
        
        # Convert to DataFrame for nice display
        df = pd.DataFrame(formatted_picks)
        
        # Get draft info
        if draft_id:
            draft_info = supabase.table("Draft").select("*").eq("id", draft_id).execute()
        else:
            # Get the most recent draft
            draft_info = supabase.table("Draft").select("*").order("year", desc=True).limit(1).execute()
        
        if draft_info.data:
            draft = draft_info.data[0]
            print(f"\nDraft Year: {draft['year']} (Status: {draft['status']})")
        
        # Print team name if filtering by team
        if team_id:
            team_info = supabase.table("Team").select("*").eq("id", team_id).execute()
            if team_info.data:
                print(f"Team: {team_info.data[0]['team']}")
        
        print("\nDraft Picks:")
        print(tabulate(df, headers="keys", tablefmt="pretty", showindex=False))
    except Exception as e:
        print(f"Error listing draft picks: {e}")

def list_teams() -> None:
    """List all teams in the database."""
    try:
        response = supabase.table("Team").select("id, team, abbreviation, Division(division)").execute()
        
        if not response.data:
            print("No teams found in the database.")
            return
        
        # Format team data
        team_data = []
        for team in response.data:
            division = team['Division']['division'] if team.get('Division') else "Unknown"
            team_data.append({
                "ID": team['id'],
                "Team": team['team'],
                "Abbr": team['abbreviation'],
                "Division": division
            })
        
        # Display teams
        df = pd.DataFrame(team_data)
        print("\nAvailable Teams:")
        print(tabulate(df, headers="keys", tablefmt="pretty", showindex=False))
    except Exception as e:
        print(f"Error listing teams: {e}")

def main() -> None:
    """Main function to run the script."""
    print("NHL Draft Picks Viewer\n")
    
    while True:
        print("\nOptions:")
        print("1. List all drafts")
        print("2. View all picks for a draft")
        print("3. View picks for a specific team")
        print("4. List all teams")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ")
        
        if choice == "1":
            list_drafts()
        
        elif choice == "2":
            draft_id = input("Enter draft ID (or press Enter for most recent): ")
            draft_id = int(draft_id) if draft_id.strip() else None
            list_draft_picks(draft_id=draft_id)
        
        elif choice == "3":
            list_teams()
            team_id = input("Enter team ID: ")
            try:
                team_id = int(team_id)
                list_draft_picks(team_id=team_id)
            except ValueError:
                print("Invalid team ID. Please enter a number.")
        
        elif choice == "4":
            list_teams()
        
        elif choice == "5":
            print("Exiting program. Goodbye!")
            break
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main() 