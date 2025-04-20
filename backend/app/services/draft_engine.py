from typing import Dict, List, Any, Optional
import random
from ..models.player import Player
from ..models.team import Team
from ..models.draft import Draft
from ..extensions import db
import uuid
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

# Create a blueprint for draft endpoints
draft_bp = Blueprint('draft', __name__)

# Define lists of sample names instead of using Faker
FIRST_NAMES = [
    "John", "James", "William", "Michael", "Robert", "David", "Thomas", "Charles", "Joseph", "Richard",
    "Daniel", "Matthew", "Anthony", "Mark", "Steven", "Paul", "Andrew", "Kenneth", "George", "Edward",
    "Joshua", "Kevin", "Brian", "Ronald", "Timothy", "Jason", "Jeffrey", "Gary", "Ryan", "Nicholas",
    "Eric", "Stephen", "Jacob", "Larry", "Frank", "Scott", "Brandon", "Samuel", "Benjamin", "Gregory",
    "Alexander", "Patrick", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Henry", "Douglas", "Peter",
    "Adam", "Nathan", "Zachary", "Walter", "Ethan", "Jeremy", "Harold", "Keith", "Christian", "Roger",
    "Noah", "Gerald", "Carl", "Terry", "Sean", "Austin", "Arthur", "Lawrence", "Jesse", "Dylan",
    "Bryan", "Ralph", "Gabriel", "Kyle", "Jordan", "Tony", "Curtis", "Howard", "Shawn", "Corey"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
    "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
    "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King",
    "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter",
    "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins",
    "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey",
    "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez",
    "James", "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross"
]

COUNTRIES = [
    "Canada", "USA", "Sweden", "Finland", "Russia", "Czech Republic", "Slovakia", "Germany", "Switzerland", 
    "Latvia", "Belarus", "Norway", "Denmark", "France", "Austria", "Italy", "Kazakhstan", "Ukraine", "Slovenia"
]

def generate_random_name():
    """Generate a random first and last name from predefined lists."""
    return random.choice(FIRST_NAMES), random.choice(LAST_NAMES)

def generate_random_country():
    """Generate a random country from predefined list."""
    return random.choice(COUNTRIES)

class DraftEngine:
    """
    Service for managing and simulating the entry draft.
    """
    
    def __init__(self):
        """Initialize the draft engine."""
        # Current draft year
        self.draft_year = None
        # Draft order (would be determined by team standings in real implementation)
        self.draft_order = []
        # Draft prospects
        self.prospects = []
        
    def initialize_draft(self, year: int) -> Dict[str, Any]:
        """
        Initialize the draft for a specific year.
        
        Args:
            year: The draft year
        
        Returns:
            Draft information as a dictionary
        """
        self.draft_year = year
        
        # For now, just randomize the draft order from a placeholder list of teams
        # In a real implementation, this would use the actual teams from the database
        # and potentially apply draft lottery odds based on team standings
        team_list = ["MTL", "TOR", "BOS", "NYR", "CHI", "LAK", "VAN", "EDM", "CGY", "WPG",
                    "OTT", "BUF", "DET", "PIT", "STL", "ANA", "SJS", "VGK", "FLA", "TBL",
                    "WSH", "PHI", "CAR", "CBJ", "MIN", "NJD", "NSH", "COL", "DAL", "NYI", "ARI", "SEA"]
        
        random.shuffle(team_list)
        self.draft_order = team_list
        
        # Generate prospects for this draft year
        self._generate_prospects()
        
        return {
            "year": self.draft_year,
            "draft_order": self.draft_order,
            "num_prospects": len(self.prospects)
        }
    
    def _generate_prospects(self) -> None:
        """
        Generate draft prospects with random attributes.
        This is a placeholder implementation.
        """
        positions = ["C", "LW", "RW", "D", "G"]
        potential_ratings = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D"]
        
        self.prospects = []
        
        # Generate 100 prospects for the draft
        for i in range(100):
            # Assign random position
            position = random.choice(positions)
            
            # Younger players tend to be drafted higher
            age = random.choices([17, 18, 19, 20, 21, 22], weights=[5, 40, 30, 15, 7, 3])[0]
            
            # Position-specific rating distributions
            if position == "G":
                overall_rating = max(50, min(99, int(random.gauss(65, 8))))
            else:
                overall_rating = max(50, min(99, int(random.gauss(68, 10))))
            
            # Potential tends to be higher for earlier picks
            potential_weight = max(0, 100 - i) / 100
            potential_index = min(9, int(random.betavariate(1.5, 3) * 10) + int(random.random() > potential_weight))
            potential = potential_ratings[potential_index]
            
            # Generate random name and nationality
            first_name, last_name = generate_random_name()
            nationality = generate_random_country()
            
            # Create prospect dict
            prospect = {
                "id": str(uuid.uuid4()),
                "first_name": first_name,
                "last_name": last_name,
                "position": position,
                "age": age,
                "overall_rating": overall_rating,
                "potential": potential,
                "nationality": nationality,
                "height": random.randint(68, 79),  # Height in inches (5'8" to 6'7")
                "weight": random.randint(160, 240),  # Weight in pounds
                "draft_year": self.draft_year,
                "drafted": False,
                "draft_position": None,
                "draft_team": None
            }
            
            self.prospects.append(prospect)
        
        # Sort prospects by overall rating and potential for better distribution
        # This creates a more realistic draft class where better players tend to be picked earlier
        self.prospects.sort(key=lambda p: (
            potential_ratings.index(p["potential"]),
            -p["overall_rating"]
        ))
    
    def get_draft_order(self) -> List[str]:
        """
        Get the current draft order.
        
        Returns:
            List of team abbreviations in draft order
        """
        return self.draft_order
    
    def get_prospects(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get the list of prospects for the current draft.
        
        Args:
            limit: Optional limit on number of prospects to return
            
        Returns:
            List of prospect dictionaries
        """
        if limit:
            return self.prospects[:limit]
        return self.prospects
    
    def simulate_pick(self, team_index: int) -> Dict[str, Any]:
        """
        Simulate a draft pick for the given team index.
        
        Args:
            team_index: The index in the draft order
            
        Returns:
            Dictionary with pick information
        """
        if team_index >= len(self.draft_order):
            return {"error": "Invalid team index"}
            
        if team_index >= len(self.prospects):
            return {"error": "No more prospects available"}
            
        team = self.draft_order[team_index]
        prospect = self.prospects[team_index]  # Take the corresponding prospect
        
        # Update prospect information
        prospect["drafted"] = True
        prospect["draft_position"] = team_index + 1  # 1-indexed draft position
        prospect["draft_team"] = team
        
        return {
            "team": team,
            "pick_number": team_index + 1,
            "prospect": prospect
        }
    
    def simulate_entire_draft(self) -> List[Dict[str, Any]]:
        """
        Simulate all picks in the draft.
        
        Returns:
            List of pick dictionaries
        """
        results = []
        
        for i in range(min(len(self.draft_order), len(self.prospects))):
            pick_result = self.simulate_pick(i)
            results.append(pick_result)
            
        return results


# API endpoints that utilize the draft service

@draft_bp.route('/', methods=['GET'])
def get_draft_info():
    """Get current draft information"""
    # Create a draft engine instance
    draft_engine = DraftEngine()
    
    # Get the current year or from query param
    year = request.args.get('year', 2023, type=int)
    
    # Initialize draft for the given year
    draft_info = draft_engine.initialize_draft(year)
    
    return jsonify(draft_info), 200


@draft_bp.route('/prospects', methods=['GET'])
def get_draft_prospects():
    """Get draft prospects"""
    # Create a draft engine instance
    draft_engine = DraftEngine()
    
    # Get the current year or from query param
    year = request.args.get('year', 2023, type=int)
    limit = request.args.get('limit', 100, type=int)
    
    # Initialize draft for the given year
    draft_engine.initialize_draft(year)
    
    # Get prospects
    prospects = draft_engine.get_prospects(limit)
    
    return jsonify(prospects), 200


@draft_bp.route('/simulate', methods=['POST'])
def simulate_draft():
    """Simulate the entire draft"""
    # Create a draft engine instance
    draft_engine = DraftEngine()
    
    # Get the current year or from request body
    data = request.get_json() or {}
    year = data.get('year', 2023)
    
    # Initialize draft for the given year
    draft_engine.initialize_draft(year)
    
    # Simulate the entire draft
    results = draft_engine.simulate_entire_draft()
    
    return jsonify(results), 200
