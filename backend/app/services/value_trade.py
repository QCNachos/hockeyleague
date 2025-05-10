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


def evaluate_trade(
    team1_players: List[Dict[str, Any]], 
    team2_players: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluate a trade between two teams.
    
    Parameters:
    -----------
    team1_players : List[Dict]
        List of player dictionaries for team 1
    team2_players : List[Dict]
        List of player dictionaries for team 2
    
    Returns:
    --------
    Dict
        Results of trade evaluation including:
        - Raw values for each team
        - Normalized values for each team
        - Trade fairness assessment
        - Value difference between teams
    """
    # Calculate raw values for each team
    team1_values = []
    team2_values = []
    
    for player in team1_players:
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
        team1_values.append({"name": player.get('name', 'Unknown'), "value": value})
    
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
        team2_values.append({"name": player.get('name', 'Unknown'), "value": value})
    
    # Calculate total raw values
    team1_total = sum(player["value"] for player in team1_values)
    team2_total = sum(player["value"] for player in team2_values)
    
    # Apply quality vs. quantity adjustment
    team1_adjusted, team2_adjusted = apply_quality_adjustment(team1_values, team2_values)
    
    # Normalize the values to a 0-100 scale
    max_team_value = max(team1_adjusted, team2_adjusted)
    
    # Avoid division by zero
    if max_team_value == 0:
        team1_normalized = 0
        team2_normalized = 0
    else:
        team1_normalized = (team1_adjusted / max_team_value) * 100
        team2_normalized = (team2_adjusted / max_team_value) * 100
    
    # Calculate value difference
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
    if team1_adjusted > team2_adjusted:
        winner = "Team 2 (receiving more value)"
    elif team2_adjusted > team1_adjusted:
        winner = "Team 1 (receiving more value)"
    else:
        winner = "Equal"
    
    return {
        "team1": {
            "raw_value": round(team1_total, 1),
            "adjusted_value": round(team1_adjusted, 1),
            "normalized_value": round(team1_normalized, 1),
            "players_values": team1_values,
            "num_players": len(team1_values)
        },
        "team2": {
            "raw_value": round(team2_total, 1),
            "adjusted_value": round(team2_adjusted, 1),
            "normalized_value": round(team2_normalized, 1),
            "players_values": team2_values,
            "num_players": len(team2_values)
        },
        "trade_assessment": {
            "raw_difference": round(raw_difference, 1),
            "normalized_difference": round(normalized_difference, 1),
            "fairness": fairness,
            "better_deal_for": winner,
            "quality_adjustment_applied": True
        }
    }


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
