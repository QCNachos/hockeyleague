import requests
import sys

# Base URL
BASE_URL = 'http://localhost:5001'

def test_routes():
    """Test the /api/routes endpoint"""
    response = requests.get(f"{BASE_URL}/api/routes")
    if response.status_code == 200:
        routes = response.json()
        print("\n=== Available Routes ===")
        for route in routes:
            print(f"{route['path']} - {', '.join(route['methods'])}")
        return True
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return False

def test_leagues():
    """Test the leagues endpoint"""
    response = requests.get(f"{BASE_URL}/api/leagues")
    if response.status_code == 200:
        leagues = response.json()
        print("\n=== Leagues ===")
        print(f"Found {len(leagues)} leagues")
        for league in leagues[:5]:  # Show just first 5
            print(f"- {league.get('league', 'Unknown')}: {league.get('league_level', 'Unknown')}")
        return True
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return False

def test_conferences():
    """Test the conferences endpoint"""
    # Try both the direct endpoint and the team endpoint
    endpoints = [
        "/api/leagues/conferences",
        "/api/teams/conferences"
    ]
    
    for endpoint in endpoints:
        print(f"\nTrying: {endpoint}")
        response = requests.get(f"{BASE_URL}{endpoint}")
        if response.status_code == 200:
            conferences = response.json()
            print(f"Found {len(conferences)} conferences")
            for conf in conferences[:5]:  # Show just first 5
                print(f"- {conf.get('name', 'Unknown')}")
            return True
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    
    return False

def test_teams():
    """Test the teams endpoint"""
    # Try both URLs without and with trailing slash
    urls = [f"{BASE_URL}/api/teams", f"{BASE_URL}/api/teams/"]
    
    for url in urls:
        response = requests.get(url)
        if response.status_code == 200:
            teams = response.json()
            print(f"\n=== Teams (from {url}) ===")
            print(f"Found {len(teams)} teams")
            for team in teams[:5]:  # Show just first 5
                print(f"- {team.get('name', 'Unknown')} ({team.get('abbreviation', '???')})")
            return True
    
    # If we get here, both URLs failed
    print("Error: Could not get teams from any URL")
    return False

def test_teams_fields():
    """Test the teams endpoint for required fields"""
    # Try both URLs without and with trailing slash
    urls = [f"{BASE_URL}/api/teams", f"{BASE_URL}/api/teams/"]
    
    for url in urls:
        response = requests.get(url)
        if response.status_code == 200:
            teams = response.json()
            print(f"\n=== Team Field Check (from {url}) ===")
            if teams and len(teams) > 0:
                team = teams[0]
                required_fields = [
                    'id', 'name', 'city', 'abbreviation', 'league',
                    'division_id', 'conference'
                ]
                
                print("Team sample:", team)
                
                # Check for missing required fields
                missing = [field for field in required_fields if field not in team]
                if missing:
                    print(f"WARNING: Missing required fields: {', '.join(missing)}")
                else:
                    print("All required fields present!")
                    
                # Check for fields used in filtering
                if 'league_type' not in team:
                    print("WARNING: 'league_type' field missing - will need to be added from league data")
                
                return True
            else:
                print("No teams found to check fields")
    
    # If we get here, both URLs failed
    print("Error: Could not get teams from any URL")
    return False

if __name__ == "__main__":
    print("Testing API endpoints...")
    
    if len(sys.argv) > 1:
        # Run specific test
        test_name = sys.argv[1]
        if test_name == "routes":
            test_routes()
        elif test_name == "leagues":
            test_leagues()
        elif test_name == "conferences":
            test_conferences()
        elif test_name == "teams":
            test_teams()
        elif test_name == "teams_fields":
            test_teams_fields()
        else:
            print(f"Unknown test: {test_name}")
    else:
        # Run all tests
        test_routes()
        test_leagues()
        test_conferences()
        test_teams()
        test_teams_fields() 