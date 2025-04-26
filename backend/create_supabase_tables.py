#!/usr/bin/env python3
"""
DEPRECATED: This script is no longer used for creating tables in Supabase.
Please use the Supabase dashboard or SQL editor to create tables directly.
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client
import time

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
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Connected to Supabase successfully!")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    sys.exit(1)

# Define tables to create
tables = [
    {
        "name": "Conference",
        "sql": """
            CREATE TABLE IF NOT EXISTS "Conference" (
                id SERIAL PRIMARY KEY,
                conference TEXT NOT NULL,
                abbreviation TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """
    },
    {
        "name": "Division",
        "sql": """
            CREATE TABLE IF NOT EXISTS "Division" (
                id SERIAL PRIMARY KEY,
                division TEXT NOT NULL,
                abbreviation TEXT NOT NULL,
                conference INTEGER REFERENCES "Conference"(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """
    },
    {
        "name": "Team",
        "sql": """
            CREATE TABLE IF NOT EXISTS "Team" (
                id SERIAL PRIMARY KEY,
                team TEXT NOT NULL,
                location TEXT,
                abbreviation TEXT NOT NULL,
                division INTEGER REFERENCES "Division"(id),
                league TEXT,
                primary_color TEXT,
                secondary_color TEXT,
                logo TEXT,
                arena TEXT,
                capacity INTEGER,
                prestige INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """
    },
    {
        "name": "Player",
        "sql": """
            CREATE TABLE IF NOT EXISTS "Player" (
                id SERIAL PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                position_primary TEXT NOT NULL,
                position_secondary TEXT,
                birthdate DATE,
                age INTEGER,
                height INTEGER,
                weight INTEGER,
                nationality TEXT,
                overall_rating INTEGER,
                potential TEXT,
                potential_precision INTEGER,
                potential_volatility INTEGER,
                shooting TEXT,
                jersey INTEGER,
                
                -- Skills
                skating INTEGER,
                shooting_skill INTEGER,
                puck_skills INTEGER,
                physical INTEGER,
                defense INTEGER,
                
                -- Goalie skills (if applicable)
                agility INTEGER,
                positioning INTEGER,
                reflexes INTEGER,
                puck_control INTEGER,
                mental INTEGER,
                
                -- Draft information
                draft_year INTEGER,
                draft_round INTEGER,
                draft_pick INTEGER, 
                draft_overall INTEGER,
                draft_team_id INTEGER REFERENCES "Team"(id),
                
                -- Team associations
                team_id INTEGER REFERENCES "Team"(id),
                associated_team_id INTEGER REFERENCES "Team"(id),
                
                injury_status TEXT,
                return_timeline TEXT,
                
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """
    },
    {
        "name": "Draft",
        "sql": """
            CREATE TABLE IF NOT EXISTS "Draft" (
                id SERIAL PRIMARY KEY,
                year INTEGER NOT NULL,
                round_count INTEGER DEFAULT 7,
                status TEXT DEFAULT 'pending',
                current_round INTEGER DEFAULT 1,
                current_pick INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """
    },
    {
        "name": "DraftPick",
        "sql": """
            CREATE TABLE IF NOT EXISTS "DraftPick" (
                id SERIAL PRIMARY KEY,
                draft_id INTEGER NOT NULL REFERENCES "Draft"(id),
                round_num INTEGER NOT NULL,
                pick_num INTEGER NOT NULL,
                team_id INTEGER REFERENCES "Team"(id),
                player_id INTEGER REFERENCES "Player"(id),
                overall_pick INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """
    }
]

# Create tables
for table in tables:
    print(f"Creating table: {table['name']}...")
    try:
        # Execute raw SQL to create table
        result = supabase.query(table['sql']).execute()
        print(f"Table {table['name']} created or already exists.")
    except Exception as e:
        print(f"Error creating table {table['name']}: {e}")
        # Continue with next table
    
    # Slight delay to avoid rate limiting
    time.sleep(0.5)

print("\nTable creation process completed!")
print("Now make sure to fill the tables with data before using the draft feature.")
print("You can use the frontend to create conferences, divisions, teams and players, or import them using SQL.")

# Example data for testing
print("\nDo you want to create example conferences and divisions? (y/n)")
create_examples = input().strip().lower()

if create_examples == 'y':
    try:
        # Check if conferences already exist
        conferences = supabase.table("Conference").select("*").execute()
        if conferences.data and len(conferences.data) > 0:
            print("Conferences already exist, skipping example data creation.")
        else:
            # Add example conferences
            eastern = supabase.table("Conference").insert({
                "conference": "Eastern Conference", 
                "abbreviation": "EAST"
            }).execute()
            
            western = supabase.table("Conference").insert({
                "conference": "Western Conference", 
                "abbreviation": "WEST"
            }).execute()
            
            print("Example conferences created.")
            
            # Add example divisions
            if eastern.data and western.data:
                east_id = eastern.data[0]['id']
                west_id = western.data[0]['id']
                
                divisions = [
                    {"division": "Atlantic Division", "abbreviation": "ATL", "conference": east_id},
                    {"division": "Metropolitan Division", "abbreviation": "MET", "conference": east_id},
                    {"division": "Central Division", "abbreviation": "CEN", "conference": west_id},
                    {"division": "Pacific Division", "abbreviation": "PAC", "conference": west_id}
                ]
                
                for division in divisions:
                    supabase.table("Division").insert(division).execute()
                
                print("Example divisions created.")
    except Exception as e:
        print(f"Error creating example data: {e}")

print("\nSetup complete. You can now use the draft feature with Supabase.")

def warn_deprecated():
    print("="*80)
    print("WARNING: This script is deprecated and should not be used to create tables.")
    print("We should not be creating any tables in Supabase via this application.")
    print("Please use the Supabase dashboard or SQL editor directly for any table creation.")
    print("For data retrieval, use the centralized endpoint at:")
    print("  - GET /api/supabase/<table_name>")
    print("  - GET /api/supabase/<table_name>/<item_id>")
    print("="*80)
    sys.exit(1)

if __name__ == "__main__":
    warn_deprecated() 