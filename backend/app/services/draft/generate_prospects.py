#!/usr/bin/env python3
"""
Script to generate draft-eligible hockey prospects.
Uses the centralized Supabase endpoint.
"""
import os
import sys
import time
import random
import requests
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import names

# Load environment variables
load_dotenv()

# API base URL
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5001')

# Constants
POSITIONS = ["C", "LW", "RW", "D", "G"]
POSITION_WEIGHTS = [30, 20, 20, 25, 5]  # More centers and defensemen
LEAGUES = {
    "CAN": ["OHL", "QMJHL", "WHL"],
    "USA": ["USHL", "NCAA"],
    "SWE": ["SHL", "Allsvenskan"],
    "FIN": ["Liiga", "Mestis"],
    "RUS": ["KHL", "MHL"],
    "CZE": ["Czech Extraliga"],
    "DEU": ["DEL"],
    "CHE": ["NL"]
}
NATIONALITIES = ["CAN", "USA", "SWE", "FIN", "RUS", "CZE", "DEU", "CHE", "SVK", "NOR", "DNK", "AUT", "LVA", "FRA", "GBR"]
NATIONALITY_WEIGHTS = [35, 25, 10, 8, 7, 4, 2, 1, 2, 1, 1, 1, 1, 1, 1]  # More North American players

# Ranges for physical attributes
HEIGHT_RANGES = {
    "C": (70, 77),     # 5'10" to 6'5"
    "LW": (70, 77),    # 5'10" to 6'5"
    "RW": (70, 77),    # 5'10" to 6'5"
    "D": (72, 79),     # 6'0" to 6'7"
    "G": (72, 79)      # 6'0" to 6'7"
}

WEIGHT_RANGES = {
    "C": (175, 220),
    "LW": (175, 220),
    "RW": (175, 220),
    "D": (190, 235),
    "G": (180, 230)
}

# Potential ratings
POTENTIAL_RATINGS = [
    "High Elite", "Elite", "Medium Elite", "Low Elite",
    "High Top 6/4", "Top 6/4", "Medium Top 6/4", "Low Top 6/4",
    "High Top 9/6", "Top 9/6", "Medium Top 9/6", "Low Top 9/6",
    "High Bottom 6/Fringe", "Bottom 6/Fringe", "Medium Bottom 6/Fringe", "Low Bottom 6/Fringe"
]

# Potential distribution: Higher values = higher probability
POTENTIAL_WEIGHTS = [1, 2, 3, 4, 6, 8, 12, 16, 16, 14, 12, 10, 6, 4, 3, 3]

# Helper functions for API interaction
def fetch_data(table_name, filters=None, select=None):
    """Fetch data from the Supabase API endpoint"""
    url = f"{API_BASE_URL}/api/supabase/{table_name}"
    params = {}
    
    if filters:
        params['filters'] = json.dumps(filters)
    if select:
        params['select'] = select
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()['data']
        else:
            print(f"Error fetching data from {table_name}: {response.text}")
            return []
    except Exception as e:
        print(f"Error in API request: {e}")
        return []

def create_data(table_name, data):
    """Create data via the Supabase API endpoint"""
    url = f"{API_BASE_URL}/api/supabase/{table_name}"
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            return response.json()['data']
        else:
            print(f"Error creating data in {table_name}: {response.text}")
            return None
    except Exception as e:
        print(f"Error in API request: {e}")
        return None

def get_potential_for_overall(overall):
    """Determine potential based on overall rating"""
    # Higher overall = higher chance of better potential
    if overall >= 75:
        # Elite prospects
        weights = [8, 14, 20, 25, 15, 10, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0]
    elif overall >= 70:
        # Top 6/4 prospects
        weights = [1, 3, 5, 8, 15, 20, 25, 15, 5, 3, 0, 0, 0, 0, 0, 0]
    elif overall >= 65:
        # Middle-tier prospects
        weights = [0, 0, 1, 2, 5, 8, 15, 20, 20, 15, 10, 5, 0, 0, 0, 0]
    else:
        # Lower-tier prospects
        weights = [0, 0, 0, 0, 0, 2, 5, 8, 10, 15, 20, 15, 10, 8, 5, 2]
    
    return random.choices(POTENTIAL_RATINGS, weights=weights, k=1)[0]

def get_league_for_nationality(nationality):
    """Get a random league based on nationality"""
    if nationality in LEAGUES:
        return random.choice(LEAGUES[nationality])
    # Default to a North American league if nationality doesn't have specific leagues
    return random.choice(LEAGUES["CAN"])

def get_random_birthdate(age_min=17, age_max=20):
    """Generate a random birthdate for a player of specified age range"""
    today = datetime.now()
    
    # Calculate date range for birthdates
    min_date = today - timedelta(days=age_max*365.25)
    max_date = today - timedelta(days=age_min*365.25)
    
    # Get a random number of days between min and max
    random_days = random.randint(0, (max_date - min_date).days)
    
    # Generate the birthdate
    birthdate = min_date + timedelta(days=random_days)
    
    return birthdate.strftime('%Y-%m-%d')

def generate_skater_ratings():
    """Generate ratings for a skater (non-goalie)"""
    # Base values slightly weighted toward lower ratings
    base_vals = [random.randint(40, 70) for _ in range(15)]
    base_vals.sort()
    
    # Get the core attributes (skating, etc.) from the higher end
    core_attrs = base_vals[-7:]
    remaining_attrs = base_vals[:-7]
    
    # Calculate overall roughly based on average of core attributes
    overall = int(sum(core_attrs) / len(core_attrs)) + random.randint(-5, 5)
    # Ensure overall is reasonable
    overall = max(40, min(80, overall))
    
    # Assign attributes - core ones first
    skating = core_attrs[0]
    shooting_skill = core_attrs[1]
    shooting_accuracy = core_attrs[2]
    puck_handling = core_attrs[3]
    passing = core_attrs[4]
    checking = core_attrs[5]
    defense = core_attrs[6]
    
    # Other attributes from the remaining pool
    mental = remaining_attrs[0]
    faceoff = remaining_attrs[1]
    stamina = remaining_attrs[2]
    durability = remaining_attrs[3]
    fighting = remaining_attrs[4] 
    strength = remaining_attrs[5]
    aggression = remaining_attrs[6]
    leadership = remaining_attrs[7]
    
    return {
        "overall": overall,
        "skating": skating,
        "shooting_skill": shooting_skill,
        "shooting_accuracy": shooting_accuracy,
        "puck_handling": puck_handling,
        "passing": passing,
        "checking": checking,
        "defense": defense,
        "mental": mental,
        "faceoff": faceoff,
        "stamina": stamina,
        "durability": durability,
        "fighting": fighting,
        "strength": strength,
        "aggression": aggression,
        "leadership": leadership
    }

def generate_goalie_ratings():
    """Generate ratings for a goalie"""
    # Base values slightly weighted toward lower ratings
    base_vals = [random.randint(40, 70) for _ in range(10)]
    base_vals.sort()
    
    # Get the core attributes (skating, etc.) from the higher end
    core_attrs = base_vals[-5:]
    remaining_attrs = base_vals[:-5]
    
    # Calculate overall roughly based on average of core attributes
    overall = int(sum(core_attrs) / len(core_attrs)) + random.randint(-5, 5)
    # Ensure overall is reasonable
    overall = max(40, min(80, overall))
    
    # Assign primary goalie attributes
    skating = core_attrs[0]
    positioning = core_attrs[1]
    reflexes = core_attrs[2]
    rebound = core_attrs[3]
    puck_handling = core_attrs[4]
    
    # Secondary attributes
    mental = remaining_attrs[0]
    stamina = remaining_attrs[1]
    durability = remaining_attrs[2]
    strength = remaining_attrs[3]
    leadership = remaining_attrs[4]
    
    # Set zeros for skater-specific attributes
    shooting_skill = 0
    shooting_accuracy = 0
    passing = 0
    checking = 0
    defense = 0
    faceoff = 0
    fighting = 0
    aggression = 0
    
    return {
        "overall": overall,
        "skating": skating,
        "shooting_skill": shooting_skill,
        "shooting_accuracy": shooting_accuracy,
        "puck_handling": puck_handling,
        "passing": passing,
        "checking": checking,
        "defense": defense,
        "mental": mental,
        "faceoff": faceoff,
        "stamina": stamina,
        "durability": durability,
        "fighting": fighting,
        "strength": strength,
        "aggression": aggression,
        "leadership": leadership,
        # Goalie-specific attributes
        "positioning": positioning,
        "reflexes": reflexes,
        "rebound": rebound
    }

def generate_prospect():
    """Generate a random hockey prospect"""
    # Pick a position with weighting
    position = random.choices(POSITIONS, weights=POSITION_WEIGHTS, k=1)[0]
    
    # Get basic info
    first_name = names.get_first_name(gender='male')
    last_name = names.get_last_name()
    
    # Get nationality with weighting
    nationality = random.choices(NATIONALITIES, weights=NATIONALITY_WEIGHTS, k=1)[0]
    
    # Generate physical attributes based on position
    height = random.randint(*HEIGHT_RANGES[position])
    weight = random.randint(*WEIGHT_RANGES[position])
    
    # Generate birthdate for 17-18 year olds (draft eligible)
    birthdate = get_random_birthdate(age_min=17, age_max=18)
    
    # Calculate player age
    birth_date_obj = datetime.strptime(birthdate, "%Y-%m-%d")
    today = datetime.now()
    age = today.year - birth_date_obj.year
    if (today.month, today.day) < (birth_date_obj.month, birth_date_obj.day):
        age -= 1
    
    # Generate ratings based on position
    if position == "G":
        ratings = generate_goalie_ratings()
    else:
        ratings = generate_skater_ratings()
        
    # Combine all info
    overall = ratings.pop("overall")
    
    # Get potential based on overall rating
    potential = get_potential_for_overall(overall)
    
    # Generate jersey number
    jersey = random.randint(1, 99)
    
    # Determine the prospect's league
    league = get_league_for_nationality(nationality)
    
    # Create the prospect data
    prospect_data = {
        "first_name": first_name,
        "last_name": last_name,
        "position_primary": position,
        "birthdate": birthdate,
        "age": age,
        "height": height,
        "weight": weight,
        "nationality": nationality,
        "overall_rating": overall,
        "potential": potential,
        "potential_precision": random.randint(1, 100),  # How accurate the potential is
        "potential_volatility": random.randint(1, 100),  # How much it can change
        "jersey": jersey,
        "league": league,
        
        # Team info - set to null for draft-eligible players
        "team_id": None,
        "draft_year": None,
        "draft_round": None,
        "draft_pick": None,
        "draft_overall": None,
        "draft_team_id": None,
        
        # Add skill ratings
        **ratings
    }
    
    # Return the generated prospect
    return prospect_data

def main():
    # Check if we already have prospects
    try:
        prospect_count = fetch_data('Player', filters={'team_id': None}, select='id')
        existing_count = len(prospect_count)
        
        if existing_count and existing_count > 0:
            print(f"Found {existing_count} existing prospects. Do you want to generate more? (y/n)")
            response = input().lower().strip()
            if response != 'y':
                print("Exiting without generating new prospects.")
                sys.exit(0)
    except Exception as e:
        print(f"Error checking for existing prospects: {e}")
        # Create a SQL function to count prospects
        try:
            fetch_data('Player', select='id')
            # If we get here, the query worked but we couldn't count
            print("Will proceed with generating prospects.")
        except:
            print("Error setting up database. Tables might not exist in Supabase.")
            sys.exit(1)
            
    print("How many prospects do you want to generate?")
    try:
        num_prospects = int(input())
    except ValueError:
        print("Invalid number. Using default of 300.")
        num_prospects = 300
        
    prospects_added = 0
    start_time = time.time()
    
    print(f"Generating {num_prospects} prospects...")
    
    for i in range(num_prospects):
        if i > 0 and i % 10 == 0:
            print(f"Generated {i} prospects so far...")
            # Small delay to avoid overwhelming the database
            time.sleep(0.1)
            
        prospect_data = generate_prospect()
        
        try:
            # Insert prospect
            result = create_data('Player', prospect_data)
            prospects_added += 1
            
            # Check for errors
            if not result:
                print(f"Warning: Failed to add prospect {prospect_data['first_name']} {prospect_data['last_name']}")
        except Exception as e:
            print(f"Error adding prospect: {e}")
            
    end_time = time.time()
    duration = end_time - start_time
    
    print(f"Successfully added {prospects_added} prospects in {duration:.2f} seconds.")

if __name__ == "__main__":
    main()

 