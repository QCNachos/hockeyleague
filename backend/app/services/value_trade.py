from typing import List, Dict, Any, Tuple, Optional
import math


def calculate_age_modifier(age: int) -> float:
    """Calculate the age modifier for trade value calculation."""
    if age < 21:
        return 0.3  # Very young players have higher value
    elif 21 <= age < 23:
        return 0.25  
    elif 23 <= age < 25:
        return 0.15
    elif 25 <= age < 27:
        return 0.1
    elif 27 <= age <= 30:
        return 0.0  # Prime years
    elif 30 < age <= 32:
        return -0.2  # Early decline
    elif 32 < age <= 35:
        return -0.45  # Significant decline
    else:  # age > 35
        return -0.7  # Severe decline


def calculate_potential_modifier(potential: str, certainty: float, volatility: float) -> float:
    """
    Calculate the potential modifier for trade value calculation.
    
    Parameters:
    -----------
    potential : str
        Player's potential level (Top6, Elite, Franchise, Generational, etc.)
    certainty : float
        How certain the potential projection is (0-1)
    volatility : float
        How volatile the player's development might be (0-1)
    
    Returns:
    --------
    float
        Potential modifier value
    """
    # Base potential value with increased values for high-end prospects
    potential_map = {
        "ahl": -0.2,
        "4th": -0.1,
        "bottom6": 0.0,
        "top9": 0.15,
        "top6": 0.4,
        "elite": 0.7,
        "franchise": 1.25,
        "generational": 3
    }
    
    # Default to bottom6 if not found
    base_potential = potential_map.get(potential.lower(), 0.0)
    
    # Adjust for certainty (less certain = lower value)
    certainty_factor = min(max(float(certainty), 0.0), 1.0)
    
    # Adjust for volatility (more volatile = lower value), but with less impact
    volatility_factor = 1.0 - min(max(float(volatility), 0.0), 1.0) * 0.45  # Reduced volatility impact from 0.6 to 0.45
    
    # Combined potential modifier
    return base_potential * certainty_factor * volatility_factor


def calculate_contract_modifier(
    contract_type: str,
    term_years: int,
    aav_millions: float,
    age: int
) -> float:
    """
    Calculate the contract modifier for trade value calculation.
    
    Parameters:
    -----------
    contract_type : str
        Type of contract (Unsigned, 2Way, RFA, UFA)
    term_years : int
        Contract term in years
    aav_millions : float
        Annual Average Value in millions
    age : int
        Player's age in years
    
    Returns:
    --------
    float
        Contract modifier value
    """
    # Base modifier based on contract type
    contract_type_mod = 0.0
    
    contract_type = contract_type.lower()
    if contract_type == "unsigned":
        # Unsigned prospects have higher value
        contract_type_mod = 0.3
    elif "2way" in contract_type:
        # Two-way contracts are more flexible
        contract_type_mod = 0.2
    elif "rfa" in contract_type:
        # RFA contracts provide more team control
        contract_type_mod = 0.1
    elif "ufa" in contract_type:
        # UFA contracts have least team control
        contract_type_mod = 0.0
    
    # Term modifier considering player age
    term_modifier = 0.0
    
    if age < 27:
        # Young players with longer terms are valuable (bridge or long term)
        if term_years >= 6:
            term_modifier = 0.3
        elif term_years >= 4:
            term_modifier = 0.2
        elif term_years >= 2:
            term_modifier = 0.1
        else:
            term_modifier = 0.0
    elif 27 <= age <= 32:
        # Prime players with medium terms are optimal
        if term_years >= 6:
            term_modifier = 0.0  # Long terms for prime players can be risky
        elif term_years >= 4:
            term_modifier = 0.2
        elif term_years >= 2:
            term_modifier = 0.1
        else:
            term_modifier = -0.1
    else:  # age > 32
        # Older players with shorter terms are better
        if term_years >= 4:
            term_modifier = -0.3  # Long terms for aging players are very risky
        elif term_years >= 2:
            term_modifier = -0.1
        else:
            term_modifier = 0.1
    
    # AAV modifier considering player age
    aav_modifier = 0.0
    
    # For young players
    if age < 27:
        if aav_millions < 4.0:
            aav_modifier = 0.3  # Great value
        elif aav_millions < 7.0:
            aav_modifier = 0.2
        elif aav_millions < 10.0:
            aav_modifier = 0.1
        else:
            aav_modifier = 0.0
    # For prime players
    elif 27 <= age <= 32:
        if aav_millions < 6.0:
            aav_modifier = 0.3  # Great value
        elif aav_millions < 9.0:
            aav_modifier = 0.2
        elif aav_millions < 12.0:
            aav_modifier = 0.0
        else:
            aav_modifier = -0.1
    # For older players
    else:  # age > 32
        if aav_millions < 4.0:
            aav_modifier = 0.2
        elif aav_millions < 7.0:
            aav_modifier = 0.0
        elif aav_millions < 10.0:
            aav_modifier = -0.2
        else:
            aav_modifier = -0.3
    
    # Combined modifier (weighted average)
    return 0.4 * contract_type_mod + 0.3 * term_modifier + 0.3 * aav_modifier


def calculate_position_modifier(position: str) -> float:
    """Calculate the position modifier for trade value calculation."""
    position = position.lower()
    if "center" in position or position == "c":
        return 0.25
    elif "defense" in position or position in ["d", "ld", "rd"]:
        return 0.15
    elif "goalie" in position or "goaltender" in position or position == "g":
        return 0.0
    else:  # Winger (LW, RW)
        return -0.1


def calculate_leadership_modifier(is_captain: bool, is_alternate: bool, stanley_cups: int) -> float:
    """
    Calculate the leadership modifier for trade value calculation,
    incorporating Stanley Cup wins as part of leadership value.
    """
    # Base leadership value from captain/alternate status
    base_leadership = 0.0
    if is_captain:
        base_leadership = 0.2
    elif is_alternate:
        base_leadership = 0.1
    
    # Stanley Cup boost (diminishing returns for multiple cups)
    cup_modifier = min(stanley_cups * 0.05, 0.2)
    
    # Combined leadership value (cup wins enhance leadership value)
    return base_leadership + cup_modifier * (1 + base_leadership * 0.5)


def calculate_intangibles_modifier(has_major_awards: bool) -> float:
    """Calculate the intangibles modifier for trade value calculation."""
    return 0.1 if has_major_awards else 0.0


def calculate_exponential_overall_value(overall: float) -> float:
    """
    Calculate an exponential value for player overall rating that
    increases more dramatically for high overall ratings.
    
    Parameters:
    -----------
    overall : float
        Player's Overall rating (0-100)
    
    Returns:
    --------
    float
        Exponential performance value
    """
    # For ratings below threshold, use a more linear relationship with diminishing returns
    threshold = 80  # Lowered threshold to make exponential curve apply to more players
    
    if overall < threshold:
        # Even lower baseline value for average and below-average players
        return (overall / 100) * 0.5  # Reduced from 0.55 to 0.5
    else:
        # For ratings above threshold, use exponential scaling with distinct tiers
        # Create significant jumps at key thresholds (85, 90, 95)
        
        # Base value at threshold
        base_value = threshold / 100 * 0.5
        
        # Calculate tier impacts with distinct jumps
        if overall >= 95:  # McDavid-level superstar tier
            tier_95_plus = overall - 95
            # 80-90 contribution
            tier_1 = (10 / 100) * 0.5 * (1 + (10 / 14) ** 2.8)
            # 90-95 contribution with major jump
            tier_2 = (5 / 100) * 0.5 * (1 + (5 / 10) ** 3.5) * 1.5  # Added 1.5x multiplier for 90+ tier
            # 95+ contribution with extreme exponent
            tier_3 = (tier_95_plus / 100) * 0.5 * (1 + (tier_95_plus / 5) ** 4.0) * 2.0  # Added 2.0x multiplier for 95+ tier
            return base_value + tier_1 + tier_2 + tier_3
            
        elif overall >= 90:  # All-star tier (90-94)
            tier_90_plus = overall - 90
            # 80-90 contribution
            tier_1 = (10 / 100) * 0.5 * (1 + (10 / 14) ** 2.8)
            # 90+ contribution with major jump
            tier_2 = (tier_90_plus / 100) * 0.5 * (1 + (tier_90_plus / 10) ** 3.5) * 1.5  # Added 1.5x multiplier for 90+ tier
            return base_value + tier_1 + tier_2
            
        elif overall >= 85:  # Star tier (85-89)
            tier_85_plus = overall - 85
            # 80-85 contribution
            tier_1 = (5 / 100) * 0.5 * (1 + (5 / 14) ** 2.8)
            # 85+ contribution with significant jump
            tier_2 = (tier_85_plus / 100) * 0.5 * (1 + (tier_85_plus / 5) ** 3.2) * 1.3  # Added 1.3x multiplier for 85+ tier
            return base_value + tier_1 + tier_2
            
        else:  # Above average tier (80-84)
            excess = overall - threshold
            exponential_factor = 1.0 + (excess / 14) ** 2.8  # Increased power from 2.7 to 2.8
            return base_value + (excess / 100) * 0.5 * exponential_factor


def calculate_player_trade_value(
    overall: float,
    age: int,
    position: str,
    contract_type: str = "UFA",
    term_years: int = 0,
    aav_millions: float = 0,
    potential: str = "bottom6",
    potential_certainty: float = 0.5,
    potential_volatility: float = 0.5,
    is_captain: bool = False,
    is_alternate: bool = False,
    stanley_cups: int = 0,
    has_major_awards: bool = False
) -> float:
    """
    Calculate the trade value of an NHL player on a 0-100 scale.
    
    Parameters:
    -----------
    overall : float
        Player's Overall rating (0-100)
    age : int
        Player's age in years
    position : str
        Player position (Center, Winger, Defenseman, Goaltender)
    contract_type : str, optional
        Type of contract (Unsigned, 2Way, RFA, UFA)
    term_years : int, optional
        Contract term in years
    aav_millions : float, optional
        Annual Average Value in millions
    potential : str, optional
        Player's potential level (Top6, Elite, Franchise, Generational, etc.)
    potential_certainty : float, optional
        How certain the potential projection is (0-1)
    potential_volatility : float, optional
        How volatile the player's development might be (0-1)
    is_captain : bool, optional
        Whether the player is a team captain
    is_alternate : bool, optional
        Whether the player is an alternate captain
    stanley_cups : int, optional
        Number of Stanley Cups won
    has_major_awards : bool, optional
        Whether the player has major awards (Hart, Vezina, etc.)
    
    Returns:
    --------
    float
        Trade value on a 0-100 scale
    """
    # Type conversion to ensure correct types
    overall = float(overall)
    age = int(age)
    term_years = int(term_years)
    aav_millions = float(aav_millions)
    
    # Handle potential_certainty as string or float
    if isinstance(potential_certainty, str):
        # Convert string values to float
        certainty_map = {
            'low': 0.25,
            'medium': 0.5,
            'high': 0.75,
            'very low': 0.1,
            'very high': 0.9
        }
        potential_certainty = certainty_map.get(potential_certainty.lower(), 0.5)
    else:
        # Ensure it's a float between 0 and 1
        potential_certainty = float(potential_certainty)
        potential_certainty = max(0.0, min(1.0, potential_certainty))
    
    # Handle potential_volatility as string or float
    if isinstance(potential_volatility, str):
        # Convert string values to float
        volatility_map = {
            'low': 0.25,
            'medium': 0.5,
            'high': 0.75,
            'very low': 0.1,
            'very high': 0.9
        }
        potential_volatility = volatility_map.get(potential_volatility.lower(), 0.5)
    else:
        # Ensure it's a float between 0 and 1
        potential_volatility = float(potential_volatility)
        potential_volatility = max(0.0, min(1.0, potential_volatility))
    
    stanley_cups = int(stanley_cups)
    is_captain = bool(is_captain)
    is_alternate = bool(is_alternate)
    has_major_awards = bool(has_major_awards)
    
    # For high overall players, potential still matters (even at older ages) but volatility matters less
    adjusted_volatility = potential_volatility
    if overall >= 88:
        # High overall players have proven their value, so volatility matters less
        adjusted_volatility = potential_volatility * 0.7
    
    # Calculate modifiers
    age_mod = calculate_age_modifier(age)
    contract_mod = calculate_contract_modifier(contract_type, term_years, aav_millions, age)
    position_mod = calculate_position_modifier(position)
    potential_mod = calculate_potential_modifier(potential, potential_certainty, adjusted_volatility)
    leadership_mod = calculate_leadership_modifier(is_captain, is_alternate, stanley_cups)
    intangibles_mod = calculate_intangibles_modifier(has_major_awards)
    
    # Calculate base value with exponential scaling for high overall ratings
    base_value = calculate_exponential_overall_value(overall)
    
    # Adjust potential impact based on age with a smaller drop-off rate for high overall players
    # Young players benefit more from potential, declining with age
    age_potential_factor = 0.0
    
    if overall >= 88:
        # High overall players retain more of their "potential" value as they age
        if age < 20:
            age_potential_factor = 0.25  # Highest impact for teenagers
        elif 20 <= age < 22:
            age_potential_factor = 0.22  # Less drop-off for proven players
        elif 22 <= age < 24:
            age_potential_factor = 0.18  # Less drop-off for proven players
        elif 24 <= age < 26:
            age_potential_factor = 0.15  # Less drop-off for proven players
        elif 26 <= age < 28: 
            age_potential_factor = 0.1   # Less drop-off for proven players
        elif 28 <= age < 30:
            age_potential_factor = 0.05  # Even players over 28 retain some potential value if they're stars
    else:
        # Standard age-based potential decay for normal players
        if age < 20:
            age_potential_factor = 0.25  # Highest impact for teenagers
        elif 20 <= age < 22:
            age_potential_factor = 0.2
        elif 22 <= age < 24:
            age_potential_factor = 0.15
        elif 24 <= age < 26:
            age_potential_factor = 0.1
        elif 26 <= age < 28: 
            age_potential_factor = 0.05  # Minimal impact for older players
    
    # Calculate multiplier with adjusted weights
    # Increased impact of age for older players
    age_weight = 0.15
    if age > 32:
        age_weight = 0.25  # Increased weight for aging players
    
    # Dynamic potential weight based on age
    potential_weight = 0.2 + age_potential_factor
    
    multiplier = (1 + 
                 age_weight * age_mod + 
                 0.15 * contract_mod + 
                 0.2 * position_mod + 
                 potential_weight * potential_mod +
                 0.05 * leadership_mod +
                 0.05 * intangibles_mod)
    
    # Calculate final value with enhanced scaling for star players
    # Adding tier-based jumps at key overall thresholds
    base_scale = 60  # Base scale for average players
    
    # Apply key tier jumps with more dramatic scaling at thresholds
    if overall >= 95:  # Generational tier (McDavid, etc.)
        tier_jump = 20  # Major jump at 95+ threshold
        star_bonus = tier_jump + (overall - 95) ** 2.5 * 5.0  # Significantly increased exponent and multiplier
        base_scale += star_bonus
    elif overall >= 93:  # Elite superstar tier
        tier_jump = 15  # Major jump at 93+ threshold
        star_bonus = tier_jump + (overall - 93) ** 2.5 * 4.0  # Increased from original
        base_scale += star_bonus
    elif overall >= 90:  # Superstar tier
        tier_jump = 8  # Significant jump at 90+ threshold
        star_bonus = tier_jump + (overall - 90) ** 2.2 * 3.0
        base_scale += star_bonus
    elif overall >= 87:  # Star tier
        tier_jump = 4  # Moderate jump at 87+ threshold
        star_bonus = tier_jump + (overall - 87) ** 1.8 * 1.5
        base_scale += star_bonus
    elif overall >= 85:  # Above-average tier
        star_bonus = (overall - 85) ** 1.5 * 0.8
        base_scale += star_bonus
    
    trade_value = base_scale * base_value * multiplier
    
    # Age-based adjustments for prospects vs veterans
    if age < 22:  # Young prospects
        # Prospects with high potential get a bigger boost
        potential_boost = 0
        
        # Scale based on potential level and prospect age
        # Younger prospects with high potential get more value
        age_factor = (22 - age) / 3
        
        if potential.lower() == "elite":
            potential_boost = 8 * age_factor
        elif potential.lower() == "franchise":
            potential_boost = 12 * age_factor
        elif potential.lower() == "generational":
            potential_boost = 18 * age_factor
        elif potential.lower() == "top6":
            potential_boost = 4 * age_factor
        else:
            potential_boost = max(0, (potential_mod * 8)) * age_factor
        
        # Apply certainty and volatility factors with more weight to volatility
        # Use adjusted volatility for high overall players
        certainty_volatility_factor = potential_certainty * (1 - 0.65 * adjusted_volatility)  # Slightly reduced volatility impact
        potential_boost *= certainty_volatility_factor
        
        trade_value += potential_boost
    
    # Award winners get an extra boost
    if has_major_awards:
        award_boost = 0
        if overall >= 92:  # For top players, awards matter more
            award_boost = 7  # Increased from 6
        elif overall >= 88:
            award_boost = 4  # Increased from 3.5
        else:
            award_boost = 2
        
        trade_value += award_boost
    
    # Cup winners get an extra boost
    if stanley_cups > 0:
        cup_boost = min(stanley_cups * 3, 12)  # Increased from 2.5 to 3, max from 10 to 12
        trade_value += cup_boost
    
    # Severe penalty for aging players with long contracts
    if age > 32 and term_years > 2:
        aging_penalty = (age - 32) * (term_years - 2) * 2.5  # Increased from 2.0
        trade_value -= min(aging_penalty, 25)  # Increased cap from 20 to 25
    
    # Cap at 99
    trade_value = min(trade_value, 99)
    
    # Ensure non-negative value
    trade_value = max(trade_value, 0)
    
    return round(trade_value, 1)


def calculate_draft_pick_value(
    round_num: int,
    pick_num: int = None,
    projected_position: int = None, 
    draft_strength: str = "average",
    context: str = "no_context",
    team_id: str = None,
    year: int = None
) -> float:
    """
    Calculate the trade value of a draft pick on a 0-100 scale.
    
    Parameters:
    -----------
    round_num : int
        The round of the draft pick (1, 2, 3, etc.)
    pick_num : int, optional
        The specific pick number (1 for 1st overall, 2 for 2nd overall, etc.)
    projected_position : int, optional
        Projected draft position when pick_num is not known
    draft_strength : str, optional
        The strength of the draft class ('strong', 'average', 'weak')
    context : str, optional
        The context of the valuation ('no_context', 'in_season', 'franchise')
    team_id : str, optional
        Team ID for projections in 'in_season' or 'franchise' context
    year : int, optional
        Draft year (e.g., 2025, 2026)
    
    Returns:
    --------
    float
        Draft pick value on a 0-100 scale
    """
    # Base values by round - 1st round picks are significantly more valuable
    base_round_values = {
        1: 60,  # 1st round base value
        2: 25,  # 2nd round base value
        3: 10,  # 3rd round base value
        4: 5,   # 4th round base value
        5: 3,   # 5th round base value
        6: 2,   # 6th round base value
        7: 1    # 7th round base value
    }
    
    # Get base value for the round (default to 0.5 for rounds beyond 7)
    base_value = base_round_values.get(round_num, 0.5)
    
    # Position value modifier for 1st round picks
    position_modifier = 1.0
    if round_num == 1:
        if pick_num is not None:
            # Special exponential value for top 3 picks
            if pick_num == 1:  # 1st overall
                position_modifier = 1.6
            elif pick_num == 2:  # 2nd overall
                position_modifier = 1.5
            elif pick_num == 3:  # 3rd overall
                position_modifier = 1.4
            elif pick_num <= 5:  # Top 5
                position_modifier = 1.3
            elif pick_num <= 10:  # Top 10
                position_modifier = 1.2
            elif pick_num <= 15:  # Top 15
                position_modifier = 1.1
            elif pick_num <= 20:  # Top 20
                position_modifier = 1.0
            else:  # 21st-32nd or later
                # Linear decrease in value for late 1st round picks
                position_modifier = max(0.8, 1.1 - (pick_num - 20) * 0.015)
        elif projected_position is not None:
            # Use projected position when specific pick number isn't known
            if projected_position <= 5:  # Projected top 5
                position_modifier = 1.25
            elif projected_position <= 10:  # Projected top 10
                position_modifier = 1.15
            elif projected_position <= 15:  # Projected top 15
                position_modifier = 1.05
            elif projected_position <= 20:  # Projected top 20
                position_modifier = 0.95
            else:  # Projected 21st or later
                position_modifier = 0.85
    elif round_num == 2:
        # Second round picks have smaller position effects
        if pick_num is not None and pick_num <= 5:  # Early 2nd round
            position_modifier = 1.1
    
    # Draft strength modifier
    strength_modifier = 1.0
    if draft_strength.lower() == "strong":
        strength_modifier = 1.2
    elif draft_strength.lower() == "weak":
        strength_modifier = 0.8
    
    # Context modifier (accounts for uncertainty in different contexts)
    context_modifier = 1.0
    if context.lower() == "in_season":
        # In-season projections are somewhat uncertain
        context_modifier = 0.95
    elif context.lower() == "franchise":
        # Long-term franchise projections are more uncertain
        context_modifier = 0.9
    
    # Time value discount for future years (if year is provided)
    time_value_discount = 1.0
    current_year = 2025  # Default reference year
    if year is not None and year > current_year:
        # Each year into the future reduces value by 10%
        time_value_discount = 0.9 ** (year - current_year)
    
    # Calculate final value
    pick_value = base_value * position_modifier * strength_modifier * context_modifier * time_value_discount
    
    # Ensure value stays within 0-100 scale
    return min(round(pick_value, 1), 99)


def evaluate_trade(
    team1_players: List[Dict[str, Any]], 
    team2_players: List[Dict[str, Any]],
    team3_players: List[Dict[str, Any]] = None,
    is_three_way: bool = False,
    team1_picks: List[Dict[str, Any]] = None,
    team2_picks: List[Dict[str, Any]] = None,
    team3_picks: List[Dict[str, Any]] = None,
    asset_destinations: Dict[str, str] = None,
    draft_context: str = "no_context"
) -> Dict[str, Any]:
    """
    Evaluate a trade between two or three teams.
    
    Parameters:
    -----------
    team1_players : List[Dict]
        List of player dictionaries for team 1
    team2_players : List[Dict]
        List of player dictionaries for team 2
    team3_players : List[Dict], optional
        List of player dictionaries for team 3 (for 3-way trades)
    is_three_way : bool, optional
        Flag indicating if this is a three-way trade
    team1_picks : List[Dict], optional
        List of draft pick dictionaries for team 1
    team2_picks : List[Dict], optional
        List of draft pick dictionaries for team 2
    team3_picks : List[Dict], optional
        List of draft pick dictionaries for team 3
    asset_destinations : Dict[str, str], optional
        Mapping of asset IDs to destination team IDs
    draft_context : str, optional
        Context for draft pick valuation ('no_context', 'in_season', 'franchise')
    
    Returns:
    --------
    Dict
        Results of trade evaluation including:
        - Raw values for each team
        - Normalized values for each team
        - Trade fairness assessment
        - Value difference between teams
    """
    # Initialize lists for assets and their values
    team1_values = []
    team2_values = []
    team3_values = []
    
    # Initialize total incoming/outgoing value by team
    team1_outgoing = 0
    team1_incoming = 0
    team2_outgoing = 0
    team2_incoming = 0
    team3_outgoing = 0
    team3_incoming = 0
    
    # Helper function to determine asset destination
    def get_asset_destination(asset_id, asset_type, source_team_id):
        if not asset_destinations or not is_three_way:
            # In 2-way trades, assets automatically go to the other team
            if source_team_id == "team1":
                return "team2"
            elif source_team_id == "team2":
                return "team1"
            return None
        
        # For 3-way trades with specified destinations
        asset_key = f"{asset_id}-{asset_type}"
        if asset_key in asset_destinations:
            return asset_destinations[asset_key]
            
        # Default destinations if not specified
        if source_team_id == "team1":
            return "team2"  # Default: team1 assets go to team2
        elif source_team_id == "team2":
            return "team3" if is_three_way else "team1"  # Default based on trade type
        elif source_team_id == "team3":
            return "team1"  # Default: team3 assets go to team1
            
        return None
    
    # Process player assets for team1
    for player in team1_players:
        # Calculate the player's trade value
        value = calculate_player_trade_value(
            overall=player.get('overall', 0),
            age=player.get('age', 0),
            position=player.get('position', ''),
            contract_type=player.get('contract_type', 'UFA'),
            term_years=player.get('term_years', 0),
            aav_millions=player.get('aav_millions', 0),
            potential=player.get('potential', 'bottom6'),
            potential_certainty=player.get('potential_certainty', 0.5),
            potential_volatility=player.get('potential_volatility', 0.5),
            is_captain=player.get('is_captain', False),
            is_alternate=player.get('is_alternate', False),
            stanley_cups=player.get('stanley_cups', 0),
            has_major_awards=player.get('has_major_awards', False)
        )
        
        # Add to outgoing value from team1
        team1_outgoing += value
        
        # Determine which team receives this asset
        destination = player.get('destination') or get_asset_destination(player.get('id', ''), 'player', 'team1')
        
        # Update incoming value for the destination team
        if destination == "team2":
            team2_incoming += value
        elif destination == "team3" and is_three_way:
            team3_incoming += value
            
        # Add to team1 value list
        team1_values.append({"name": player.get('name', 'Unknown'), "value": value})
    
    # Process player assets for team2
    for player in team2_players:
        value = calculate_player_trade_value(
            overall=player.get('overall', 0),
            age=player.get('age', 0),
            position=player.get('position', ''),
            contract_type=player.get('contract_type', 'UFA'),
            term_years=player.get('term_years', 0),
            aav_millions=player.get('aav_millions', 0),
            potential=player.get('potential', 'bottom6'),
            potential_certainty=player.get('potential_certainty', 0.5),
            potential_volatility=player.get('potential_volatility', 0.5),
            is_captain=player.get('is_captain', False),
            is_alternate=player.get('is_alternate', False),
            stanley_cups=player.get('stanley_cups', 0),
            has_major_awards=player.get('has_major_awards', False)
        )
        
        # Add to outgoing value from team2
        team2_outgoing += value
        
        # Determine which team receives this asset
        destination = player.get('destination') or get_asset_destination(player.get('id', ''), 'player', 'team2')
        
        # Update incoming value for the destination team
        if destination == "team1":
            team1_incoming += value
        elif destination == "team3" and is_three_way:
            team3_incoming += value
            
        team2_values.append({"name": player.get('name', 'Unknown'), "value": value})
    
    # Process player assets for team3 (if three-way trade)
    if is_three_way and team3_players:
        for player in team3_players:
            value = calculate_player_trade_value(
                overall=player.get('overall', 0),
                age=player.get('age', 0),
                position=player.get('position', ''),
                contract_type=player.get('contract_type', 'UFA'),
                term_years=player.get('term_years', 0),
                aav_millions=player.get('aav_millions', 0),
                potential=player.get('potential', 'bottom6'),
                potential_certainty=player.get('potential_certainty', 0.5),
                potential_volatility=player.get('potential_volatility', 0.5),
                is_captain=player.get('is_captain', False),
                is_alternate=player.get('is_alternate', False),
                stanley_cups=player.get('stanley_cups', 0),
                has_major_awards=player.get('has_major_awards', False)
            )
            
            # Add to outgoing value from team3
            team3_outgoing += value
            
            # Determine which team receives this asset
            destination = player.get('destination') or get_asset_destination(player.get('id', ''), 'player', 'team3')
            
            # Update incoming value for the destination team
            if destination == "team1":
                team1_incoming += value
            elif destination == "team2":
                team2_incoming += value
                
            team3_values.append({"name": player.get('name', 'Unknown'), "value": value})
    
    # Process draft picks for team1 (if provided)
    if team1_picks:
        for pick in team1_picks:
            # Calculate the pick's trade value
            value = calculate_draft_pick_value(
                round_num=pick.get('round', 1),
                pick_num=pick.get('pick_num'),
                projected_position=pick.get('projected_position'),
                draft_strength=pick.get('draft_strength', 'average'),
                context=draft_context,
                team_id=pick.get('team_id'),
                year=pick.get('year')
            )
            
            # Add to outgoing value from team1
            team1_outgoing += value
            
            # Determine which team receives this asset
            destination = pick.get('destination') or get_asset_destination(pick.get('id', ''), 'pick', 'team1')
            
            # Update incoming value for the destination team
            if destination == "team2":
                team2_incoming += value
            elif destination == "team3" and is_three_way:
                team3_incoming += value
                
            # Add to team1 value list
            pick_name = f"{pick.get('year', 'Unknown')} Round {pick.get('round', 'Unknown')} Pick"
            team1_values.append({"name": pick_name, "value": value})
    
    # Process draft picks for team2 (if provided)
    if team2_picks:
        for pick in team2_picks:
            value = calculate_draft_pick_value(
                round_num=pick.get('round', 1),
                pick_num=pick.get('pick_num'),
                projected_position=pick.get('projected_position'),
                draft_strength=pick.get('draft_strength', 'average'),
                context=draft_context,
                team_id=pick.get('team_id'),
                year=pick.get('year')
            )
            
            # Add to outgoing value from team2
            team2_outgoing += value
            
            # Determine which team receives this asset
            destination = pick.get('destination') or get_asset_destination(pick.get('id', ''), 'pick', 'team2')
            
            # Update incoming value for the destination team
            if destination == "team1":
                team1_incoming += value
            elif destination == "team3" and is_three_way:
                team3_incoming += value
                
            # Add to team2 value list
            pick_name = f"{pick.get('year', 'Unknown')} Round {pick.get('round', 'Unknown')} Pick"
            team2_values.append({"name": pick_name, "value": value})
    
    # Process draft picks for team3 (if provided and three-way trade)
    if is_three_way and team3_picks:
        for pick in team3_picks:
            value = calculate_draft_pick_value(
                round_num=pick.get('round', 1),
                pick_num=pick.get('pick_num'),
                projected_position=pick.get('projected_position'),
                draft_strength=pick.get('draft_strength', 'average'),
                context=draft_context,
                team_id=pick.get('team_id'),
                year=pick.get('year')
            )
            
            # Add to outgoing value from team3
            team3_outgoing += value
            
            # Determine which team receives this asset
            destination = pick.get('destination') or get_asset_destination(pick.get('id', ''), 'pick', 'team3')
            
            # Update incoming value for the destination team
            if destination == "team1":
                team1_incoming += value
            elif destination == "team2":
                team2_incoming += value
                
            # Add to team3 value list
            pick_name = f"{pick.get('year', 'Unknown')} Round {pick.get('round', 'Unknown')} Pick"
            team3_values.append({"name": pick_name, "value": value})
    
    # Calculate net values (incoming - outgoing)
    team1_net = team1_incoming - team1_outgoing
    team2_net = team2_incoming - team2_outgoing
    team3_net = team3_incoming - team3_outgoing
    
    # Calculate total raw values (outgoing)
    team1_total = team1_outgoing
    team2_total = team2_outgoing
    team3_total = team3_outgoing if is_three_way else 0
    
    # Apply quality vs. quantity adjustment
    if is_three_way:
        team1_adjusted, team2_adjusted, team3_adjusted = apply_quality_adjustment_three_way(
            team1_values, team2_values, team3_values
        )
    else:
        team1_adjusted, team2_adjusted = apply_quality_adjustment(team1_values, team2_values)
        team3_adjusted = 0
    
    # Normalize the values to a 0-100 scale
    max_team_value = max(team1_adjusted, team2_adjusted, team3_adjusted if is_three_way else 0)
    
    # Avoid division by zero
    if max_team_value == 0:
        team1_normalized = 0
        team2_normalized = 0
        team3_normalized = 0
    else:
        team1_normalized = (team1_adjusted / max_team_value) * 100
        team2_normalized = (team2_adjusted / max_team_value) * 100
        team3_normalized = (team3_adjusted / max_team_value) * 100 if is_three_way else 0
    
    # Calculate value difference
    if is_three_way:
        raw_differences = [
            abs(team1_adjusted - team2_adjusted),
            abs(team1_adjusted - team3_adjusted),
            abs(team2_adjusted - team3_adjusted)
        ]
        normalized_differences = [
            abs(team1_normalized - team2_normalized),
            abs(team1_normalized - team3_normalized),
            abs(team2_normalized - team3_normalized)
        ]
        raw_difference = max(raw_differences)
        normalized_difference = max(normalized_differences)
    else:
        raw_difference = abs(team1_adjusted - team2_adjusted)
        normalized_difference = abs(team1_normalized - team2_normalized)
    
    # Assess trade fairness
    if normalized_difference < 5:
        fairness = "Very Fair"
    elif normalized_difference < 10:
        fairness = "Fair"
    elif normalized_difference < 20:
        fairness = "Slightly Uneven"
    elif normalized_difference < 30:
        fairness = "Uneven"
    else:
        fairness = "Very Uneven"
    
    # Determine which team is getting the better deal
    if is_three_way:
        # In a three-way trade, we determine which team gets the best value
        if team1_net > team2_net and team1_net > team3_net:
            winner = "Team 1 (receiving more value)"
        elif team2_net > team1_net and team2_net > team3_net:
            winner = "Team 2 (receiving more value)"
        elif team3_net > team1_net and team3_net > team2_net:
            winner = "Team 3 (receiving more value)"
        else:
            winner = "Equal"
    else:
        # For a two-team trade
        if team1_net > team2_net:
            winner = "Team 1 (receiving more value)"
        elif team2_net > team1_net:
            winner = "Team 2 (receiving more value)"
        else:
            winner = "Equal"
    
    # Build the result dictionary
    result = {
        "team1": {
            "raw_value": round(team1_total, 1),
            "adjusted_value": round(team1_adjusted, 1),
            "normalized_value": round(team1_normalized, 1),
            "players_values": team1_values,
            "num_players": len(team1_values),
            "incoming_value": round(team1_incoming, 1),
            "outgoing_value": round(team1_outgoing, 1),
            "net_value": round(team1_net, 1)
        },
        "team2": {
            "raw_value": round(team2_total, 1),
            "adjusted_value": round(team2_adjusted, 1),
            "normalized_value": round(team2_normalized, 1),
            "players_values": team2_values,
            "num_players": len(team2_values),
            "incoming_value": round(team2_incoming, 1),
            "outgoing_value": round(team2_outgoing, 1),
            "net_value": round(team2_net, 1)
        },
        "trade_assessment": {
            "raw_difference": round(raw_difference, 1),
            "normalized_difference": round(normalized_difference, 1),
            "fairness": fairness,
            "better_deal_for": winner,
            "quality_adjustment_applied": True,
            "is_three_way": is_three_way
        }
    }
    
    # Add team 3 data if it's a three-way trade
    if is_three_way:
        result["team3"] = {
            "raw_value": round(team3_total, 1),
            "adjusted_value": round(team3_adjusted, 1),
            "normalized_value": round(team3_normalized, 1),
            "players_values": team3_values,
            "num_players": len(team3_values),
            "incoming_value": round(team3_incoming, 1),
            "outgoing_value": round(team3_outgoing, 1),
            "net_value": round(team3_net, 1)
        }
    else:
        # Add empty team3 data for consistent frontend rendering
        result["team3"] = {
            "raw_value": 0,
            "adjusted_value": 0,
            "normalized_value": 0,
            "players_values": [],
            "num_players": 0,
            "incoming_value": 0,
            "outgoing_value": 0,
            "net_value": 0
        }
    
    return result


def apply_quality_adjustment(
    team1_values: List[Dict[str, float]], 
    team2_values: List[Dict[str, float]]
) -> Tuple[float, float]:
    """
    Apply an adjustment to account for the fact that quality is better than quantity in NHL trades.
    A single star player is worth more than multiple lesser players whose values add up to the same total.
    
    Parameters:
    -----------
    team1_values : List[Dict]
        List of player value dictionaries for team 1
    team2_values : List[Dict]
        List of player value dictionaries for team 2
    
    Returns:
    --------
    Tuple[float, float]
        Adjusted values for team1 and team2
    """
    # Extract player values
    team1_player_values = [player["value"] for player in team1_values]
    team2_player_values = [player["value"] for player in team2_values]
    
    # Calculate raw totals
    team1_raw_total = sum(team1_player_values)
    team2_raw_total = sum(team2_player_values)
    
    # Sort values in descending order
    team1_player_values.sort(reverse=True)
    team2_player_values.sort(reverse=True)
    
    # Apply quality boost to high-value players
    # Players over certain thresholds get extra weight to reflect the NHL premium on star players
    def calculate_quality_adjusted_value(player_values):
        adjusted_total = 0
        
        for i, value in enumerate(player_values):
            # Apply quality tiers with higher premiums for top players
            if value >= 95:  # Generational tier (McDavid, etc.)
                tier_multiplier = 1.25  # Increased from 1.15
            elif value >= 90:  # Superstar tier
                tier_multiplier = 1.18  # Increased from 1.15
            elif value >= 85:  # Star tier
                tier_multiplier = 1.12  # Increased from 1.10
            elif value >= 75:  # Elite tier
                tier_multiplier = 1.05
            elif value >= 65:  # Top tier
                tier_multiplier = 1.02
            else:
                tier_multiplier = 1.0
            
            # Apply quantity diminishing factor - each additional player has less impact
            # First players have highest impact, additional players have steeper diminishing returns
            # Steeper discounts for additional players
            if i == 0:
                position_discount = 0.0  # No discount for primary player
            elif i == 1:
                position_discount = 0.15  # 15% discount for second player (increased from 8%)
            elif i == 2:
                position_discount = 0.25  # 25% discount for third player (increased from 16%)
            else:
                # Steeper discounts for additional players
                position_discount = min(0.25 + (i - 2) * 0.12, 0.7)  # Up to 70% discount (increased from 50%)
            
            player_adjusted = value * tier_multiplier * (1 - position_discount)
            adjusted_total += player_adjusted
        
        return adjusted_total
    
    # Calculate adjusted values
    team1_adjusted = calculate_quality_adjusted_value(team1_player_values)
    team2_adjusted = calculate_quality_adjusted_value(team2_player_values)
    
    # Apply roster spot penalty for teams receiving many players
    # NHL teams value roster spots and consolidating talent
    max_efficient_players = 2  # Reduced from 3 to 2 for stricter roster spot value
    
    if len(team1_player_values) > max_efficient_players:
        # Increased penalty for having too many players in a deal
        roster_penalty = 0.05 * (len(team1_player_values) - max_efficient_players) * team1_raw_total  # Increased from 0.03
        team1_adjusted -= roster_penalty
    
    if len(team2_player_values) > max_efficient_players:
        # Increased penalty for having too many players in a deal
        roster_penalty = 0.05 * (len(team2_player_values) - max_efficient_players) * team2_raw_total  # Increased from 0.03
        team2_adjusted -= roster_penalty
    
    return team1_adjusted, team2_adjusted


def apply_quality_adjustment_three_way(
    team1_values: List[Dict[str, float]], 
    team2_values: List[Dict[str, float]],
    team3_values: List[Dict[str, float]]
) -> Tuple[float, float, float]:
    """
    Apply an adjustment to account for the fact that quality is better than quantity in NHL trades.
    This is an extended version of apply_quality_adjustment that handles three teams.
    
    Parameters:
    -----------
    team1_values : List[Dict]
        List of player value dictionaries for team 1
    team2_values : List[Dict]
        List of player value dictionaries for team 2
    team3_values : List[Dict]
        List of player value dictionaries for team 3
    
    Returns:
    --------
    Tuple[float, float, float]
        Adjusted values for team1, team2, and team3
    """
    # Extract player values
    team1_player_values = [player["value"] for player in team1_values]
    team2_player_values = [player["value"] for player in team2_values]
    team3_player_values = [player["value"] for player in team3_values]
    
    # Calculate raw totals
    team1_raw_total = sum(team1_player_values)
    team2_raw_total = sum(team2_player_values)
    team3_raw_total = sum(team3_player_values)
    
    # Sort values in descending order
    team1_player_values.sort(reverse=True)
    team2_player_values.sort(reverse=True)
    team3_player_values.sort(reverse=True)
    
    # Apply quality boost to high-value players
    # Players over certain thresholds get extra weight to reflect the NHL premium on star players
    def calculate_quality_adjusted_value(player_values):
        adjusted_total = 0
        
        for i, value in enumerate(player_values):
            # Apply quality tiers with higher premiums for top players
            if value >= 95:  # Generational tier (McDavid, etc.)
                tier_multiplier = 1.25  # Increased from 1.15
            elif value >= 90:  # Superstar tier
                tier_multiplier = 1.18  # Increased from 1.15
            elif value >= 85:  # Star tier
                tier_multiplier = 1.12  # Increased from 1.10
            elif value >= 75:  # Elite tier
                tier_multiplier = 1.05
            elif value >= 65:  # Top tier
                tier_multiplier = 1.02
            else:
                tier_multiplier = 1.0
            
            # Apply quantity diminishing factor - each additional player has less impact
            # First players have highest impact, additional players have steeper diminishing returns
            # Steeper discounts for additional players
            if i == 0:
                position_discount = 0.0  # No discount for primary player
            elif i == 1:
                position_discount = 0.15  # 15% discount for second player (increased from 8%)
            elif i == 2:
                position_discount = 0.25  # 25% discount for third player (increased from 16%)
            else:
                # Steeper discounts for additional players
                position_discount = min(0.25 + (i - 2) * 0.12, 0.7)  # Up to 70% discount (increased from 50%)
            
            player_adjusted = value * tier_multiplier * (1 - position_discount)
            adjusted_total += player_adjusted
        
        return adjusted_total
    
    # Calculate adjusted values
    team1_adjusted = calculate_quality_adjusted_value(team1_player_values)
    team2_adjusted = calculate_quality_adjusted_value(team2_player_values)
    team3_adjusted = calculate_quality_adjusted_value(team3_player_values)
    
    # Apply roster spot penalty for teams receiving many players
    # NHL teams value roster spots and consolidating talent
    max_efficient_players = 2  # Reduced from 3 to 2 for stricter roster spot value
    
    if len(team1_player_values) > max_efficient_players:
        # Increased penalty for having too many players in a deal
        roster_penalty = 0.05 * (len(team1_player_values) - max_efficient_players) * team1_raw_total  # Increased from 0.03
        team1_adjusted -= roster_penalty
    
    if len(team2_player_values) > max_efficient_players:
        # Increased penalty for having too many players in a deal
        roster_penalty = 0.05 * (len(team2_player_values) - max_efficient_players) * team2_raw_total  # Increased from 0.03
        team2_adjusted -= roster_penalty
    
    if len(team3_player_values) > max_efficient_players:
        # Increased penalty for having too many players in a deal
        roster_penalty = 0.05 * (len(team3_player_values) - max_efficient_players) * team3_raw_total  # Increased from 0.03
        team3_adjusted -= roster_penalty
    
    return team1_adjusted, team2_adjusted, team3_adjusted


def visualize_trade_balance(
    team1_value: float, 
    team2_value: float
) -> Dict[str, Any]:
    """
    Generate visualization data for the trade balance.
    
    Parameters:
    -----------
    team1_value : float
        Total trade value for team 1
    team2_value : float
        Total trade value for team 2
    
    Returns:
    --------
    Dict
        Visualization data for the trade balance bar
    """
    total_value = team1_value + team2_value
    
    # Avoid division by zero
    if total_value == 0:
        team1_percentage = 50
        team2_percentage = 50
    else:
        team1_percentage = (team1_value / total_value) * 100
        team2_percentage = (team2_value / total_value) * 100
    
    return {
        "team1_percentage": round(team1_percentage, 1),
        "team2_percentage": round(team2_percentage, 1),
        "is_balanced": abs(team1_percentage - team2_percentage) < 10
    }
