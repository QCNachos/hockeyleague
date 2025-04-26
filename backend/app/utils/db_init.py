from ..extensions import db
from ..services.league import Conference, Division
from ..services.team_service import Team
from ..services.coach import Coach

def init_nhl_data():
    """Initialize database with NHL conferences, divisions, and teams"""
    # Create conferences
    eastern = Conference(name="Eastern Conference", abbreviation="EC")
    western = Conference(name="Western Conference", abbreviation="WC")
    db.session.add_all([eastern, western])
    db.session.commit()
    
    # Create divisions
    atlantic = Division(name="Atlantic Division", abbreviation="ATL", conference_id=eastern.id)
    metropolitan = Division(name="Metropolitan Division", abbreviation="MET", conference_id=eastern.id)
    central = Division(name="Central Division", abbreviation="CEN", conference_id=western.id)
    pacific = Division(name="Pacific Division", abbreviation="PAC", conference_id=western.id)
    db.session.add_all([atlantic, metropolitan, central, pacific])
    db.session.commit()
    
    # Create teams - Atlantic Division
    atlantic_teams = [
        Team(name="Boston Bruins", city="Boston", abbreviation="BOS", 
             primary_color="#FFB81C", secondary_color="#000000", 
             division_id=atlantic.id, arena_name="TD Garden", arena_capacity=17565, prestige=85),
        Team(name="Buffalo Sabres", city="Buffalo", abbreviation="BUF", 
             primary_color="#002654", secondary_color="#FCB514", 
             division_id=atlantic.id, arena_name="KeyBank Center", arena_capacity=19070, prestige=65),
        Team(name="Detroit Red Wings", city="Detroit", abbreviation="DET", 
             primary_color="#CE1126", secondary_color="#FFFFFF", 
             division_id=atlantic.id, arena_name="Little Caesars Arena", arena_capacity=19515, prestige=75),
        Team(name="Florida Panthers", city="Sunrise", abbreviation="FLA", 
             primary_color="#041E42", secondary_color="#C8102E", 
             division_id=atlantic.id, arena_name="Amerant Bank Arena", arena_capacity=19250, prestige=90),
        Team(name="Montreal Canadiens", city="Montreal", abbreviation="MTL", 
             primary_color="#AF1E2D", secondary_color="#192168", 
             division_id=atlantic.id, arena_name="Bell Centre", arena_capacity=21302, prestige=80),
        Team(name="Ottawa Senators", city="Ottawa", abbreviation="OTT", 
             primary_color="#E31837", secondary_color="#000000", 
             division_id=atlantic.id, arena_name="Canadian Tire Centre", arena_capacity=18652, prestige=70),
        Team(name="Tampa Bay Lightning", city="Tampa Bay", abbreviation="TBL", 
             primary_color="#002868", secondary_color="#FFFFFF", 
             division_id=atlantic.id, arena_name="Amalie Arena", arena_capacity=19092, prestige=85),
        Team(name="Toronto Maple Leafs", city="Toronto", abbreviation="TOR", 
             primary_color="#00205B", secondary_color="#FFFFFF", 
             division_id=atlantic.id, arena_name="Scotiabank Arena", arena_capacity=18819, prestige=85)
    ]
    db.session.add_all(atlantic_teams)
    
    # Create teams - Metropolitan Division
    metropolitan_teams = [
        Team(name="Carolina Hurricanes", city="Raleigh", abbreviation="CAR", 
             primary_color="#CC0000", secondary_color="#000000", 
             division_id=metropolitan.id, arena_name="PNC Arena", arena_capacity=18680, prestige=85),
        Team(name="Columbus Blue Jackets", city="Columbus", abbreviation="CBJ", 
             primary_color="#002654", secondary_color="#CE1126", 
             division_id=metropolitan.id, arena_name="Nationwide Arena", arena_capacity=18500, prestige=65),
        Team(name="New Jersey Devils", city="Newark", abbreviation="NJD", 
             primary_color="#CE1126", secondary_color="#000000", 
             division_id=metropolitan.id, arena_name="Prudential Center", arena_capacity=16514, prestige=80),
        Team(name="New York Islanders", city="Elmont", abbreviation="NYI", 
             primary_color="#00539B", secondary_color="#F47D30", 
             division_id=metropolitan.id, arena_name="UBS Arena", arena_capacity=17250, prestige=75),
        Team(name="New York Rangers", city="New York", abbreviation="NYR", 
             primary_color="#0038A8", secondary_color="#CE1126", 
             division_id=metropolitan.id, arena_name="Madison Square Garden", arena_capacity=18006, prestige=85),
        Team(name="Philadelphia Flyers", city="Philadelphia", abbreviation="PHI", 
             primary_color="#F74902", secondary_color="#000000", 
             division_id=metropolitan.id, arena_name="Wells Fargo Center", arena_capacity=19543, prestige=70),
        Team(name="Pittsburgh Penguins", city="Pittsburgh", abbreviation="PIT", 
             primary_color="#000000", secondary_color="#FCB514", 
             division_id=metropolitan.id, arena_name="PPG Paints Arena", arena_capacity=18387, prestige=80),
        Team(name="Washington Capitals", city="Washington", abbreviation="WSH", 
             primary_color="#041E42", secondary_color="#C8102E", 
             division_id=metropolitan.id, arena_name="Capital One Arena", arena_capacity=18573, prestige=80)
    ]
    db.session.add_all(metropolitan_teams)
    
    # Create teams - Central Division
    central_teams = [
        Team(name="Arizona Coyotes", city="Tempe", abbreviation="ARI", 
             primary_color="#8C2633", secondary_color="#E2D6B5", 
             division_id=central.id, arena_name="Mullett Arena", arena_capacity=4600, prestige=50),
        Team(name="Chicago Blackhawks", city="Chicago", abbreviation="CHI", 
             primary_color="#CF0A2C", secondary_color="#000000", 
             division_id=central.id, arena_name="United Center", arena_capacity=19717, prestige=65),
        Team(name="Colorado Avalanche", city="Denver", abbreviation="COL", 
             primary_color="#6F263D", secondary_color="#236192", 
             division_id=central.id, arena_name="Ball Arena", arena_capacity=18007, prestige=90),
        Team(name="Dallas Stars", city="Dallas", abbreviation="DAL", 
             primary_color="#006847", secondary_color="#8F8F8C", 
             division_id=central.id, arena_name="American Airlines Center", arena_capacity=18532, prestige=80),
        Team(name="Minnesota Wild", city="Saint Paul", abbreviation="MIN", 
             primary_color="#154734", secondary_color="#A6192E", 
             division_id=central.id, arena_name="Xcel Energy Center", arena_capacity=17954, prestige=75),
        Team(name="Nashville Predators", city="Nashville", abbreviation="NSH", 
             primary_color="#FFB81C", secondary_color="#041E42", 
             division_id=central.id, arena_name="Bridgestone Arena", arena_capacity=17159, prestige=75),
        Team(name="St. Louis Blues", city="St. Louis", abbreviation="STL", 
             primary_color="#002F87", secondary_color="#FCB514", 
             division_id=central.id, arena_name="Enterprise Center", arena_capacity=18096, prestige=75),
        Team(name="Winnipeg Jets", city="Winnipeg", abbreviation="WPG", 
             primary_color="#041E42", secondary_color="#004C97", 
             division_id=central.id, arena_name="Canada Life Centre", arena_capacity=15321, prestige=75)
    ]
    db.session.add_all(central_teams)
    
    # Create teams - Pacific Division
    pacific_teams = [
        Team(name="Anaheim Ducks", city="Anaheim", abbreviation="ANA", 
             primary_color="#F47A38", secondary_color="#B9975B", 
             division_id=pacific.id, arena_name="Honda Center", arena_capacity=17174, prestige=60),
        Team(name="Calgary Flames", city="Calgary", abbreviation="CGY", 
             primary_color="#C8102E", secondary_color="#F1BE48", 
             division_id=pacific.id, arena_name="Scotiabank Saddledome", arena_capacity=19289, prestige=75),
        Team(name="Edmonton Oilers", city="Edmonton", abbreviation="EDM", 
             primary_color="#041E42", secondary_color="#FF4C00", 
             division_id=pacific.id, arena_name="Rogers Place", arena_capacity=18347, prestige=85),
        Team(name="Los Angeles Kings", city="Los Angeles", abbreviation="LAK", 
             primary_color="#111111", secondary_color="#A2AAAD", 
             division_id=pacific.id, arena_name="Crypto.com Arena", arena_capacity=18230, prestige=80),
        Team(name="San Jose Sharks", city="San Jose", abbreviation="SJS", 
             primary_color="#006D75", secondary_color="#000000", 
             division_id=pacific.id, arena_name="SAP Center", arena_capacity=17562, prestige=60),
        Team(name="Seattle Kraken", city="Seattle", abbreviation="SEA", 
             primary_color="#001628", secondary_color="#99D9D9", 
             division_id=pacific.id, arena_name="Climate Pledge Arena", arena_capacity=17100, prestige=70),
        Team(name="Vancouver Canucks", city="Vancouver", abbreviation="VAN", 
             primary_color="#00205B", secondary_color="#00843D", 
             division_id=pacific.id, arena_name="Rogers Arena", arena_capacity=18910, prestige=85),
        Team(name="Vegas Golden Knights", city="Las Vegas", abbreviation="VGK", 
             primary_color="#B4975A", secondary_color="#333F42", 
             division_id=pacific.id, arena_name="T-Mobile Arena", arena_capacity=17500, prestige=90)
    ]
    db.session.add_all(pacific_teams)
    db.session.commit()
    
    return {
        "conferences": 2,
        "divisions": 4,
        "teams": 32
    } 