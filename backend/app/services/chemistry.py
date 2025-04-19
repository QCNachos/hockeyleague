from typing import Dict, List, Any, Tuple, Optional
import math
import random

class ChemistryCalculator:
    """
    Calculates chemistry between players, lines, and pairs.
    Chemistry directly affects player performance in games.
    """
    
    # Chemistry ratings range from -5 to +5
    MIN_CHEMISTRY = -5.0
    MAX_CHEMISTRY = 5.0
    
    # Player type compatibility matrix
    # This defines how different player types work together
    PLAYER_TYPE_COMPATIBILITY = {
        'Sniper': {
            'Sniper': 0,        # Two snipers might compete for shots
            'Playmaker': 2,     # Playmakers feed snipers for goals
            'Power Forward': 1, # Power forwards create space for snipers
            '2 Way Forward': 0.5, # Neutral pairing
            'Enforcer': -0.5,   # Enforcers don't typically feed snipers
            'Offensive Def.': 1.5, # Offensive D can feed snipers
            'Defensive Def.': -0.5, # Defensive D focus less on feeding forwards
            '2 Way Def.': 0.5    # 2-way D can occasionally feed snipers
        },
        'Playmaker': {
            'Sniper': 2,        # Playmakers love feeding snipers
            'Playmaker': 0,     # Two playmakers might both pass too much
            'Power Forward': 1.5, # Power forwards can finish playmakers' passes
            '2 Way Forward': 1,  # 2-way forwards can finish plays
            'Enforcer': 0,      # Neutral chemistry with enforcers
            'Offensive Def.': 1, # Good movement with offensive D
            'Defensive Def.': 0, # Neutral with defensive D
            '2 Way Def.': 0.5    # Okay with 2-way D
        },
        'Power Forward': {
            'Sniper': 1,        # Create space for snipers
            'Playmaker': 1.5,   # Finish playmakers' passes
            'Power Forward': 0.5, # Two power forwards can work together
            '2 Way Forward': 1,  # Good balance
            'Enforcer': 1,      # Physical presence together
            'Offensive Def.': 0.5, # Decent with offensive D
            'Defensive Def.': 1, # Good with defensive D
            '2 Way Def.': 1      # Good with 2-way D
        },
        '2 Way Forward': {
            'Sniper': 0.5,      # Help cover for snipers' defense
            'Playmaker': 1,     # Help cover for playmakers' defense
            'Power Forward': 1,  # Good balance
            '2 Way Forward': 1.5, # Great defensive coverage together
            'Enforcer': 0.5,    # Decent pairing
            'Offensive Def.': 0, # Neutral
            'Defensive Def.': 1.5, # Great defensive coverage
            '2 Way Def.': 1      # Good balance
        },
        'Enforcer': {
            'Sniper': -0.5,     # Doesn't help snipers much
            'Playmaker': 0,     # Neutral with playmakers
            'Power Forward': 1,  # Physical presence together
            '2 Way Forward': 0.5, # Decent pairing
            'Enforcer': -1,     # Too many enforcers is a problem
            'Offensive Def.': -0.5, # Not great with offensive D
            'Defensive Def.': 1, # Good with defensive D
            '2 Way Def.': 0.5    # Okay with 2-way D
        },
        'Offensive Def.': {
            'Offensive Def.': -0.5, # Two offensive D can leave defensive gaps
            'Defensive Def.': 1.5,  # Perfect complement
            '2 Way Def.': 1,        # Good balance
            'Sniper': 1.5,          # Can feed snipers
            'Playmaker': 1,         # Good movement together
            'Power Forward': 0.5,   # Decent pairing
            '2 Way Forward': 0,     # Neutral
            'Enforcer': -0.5        # Not a great pairing
        },
        'Defensive Def.': {
            'Offensive Def.': 1.5,  # Perfect complement
            'Defensive Def.': -0.5, # Two defensive D may lack offense
            '2 Way Def.': 1,        # Good balance
            'Sniper': -0.5,         # Doesn't help snipers much
            'Playmaker': 0,         # Neutral with playmakers
            'Power Forward': 1,     # Good defensive presence
            '2 Way Forward': 1.5,   # Great defensive coverage
            'Enforcer': 1           # Strong defensive presence
        },
        '2 Way Def.': {
            'Offensive Def.': 1,    # Good balance
            'Defensive Def.': 1,    # Good balance
            '2 Way Def.': 1,        # Solid defensive pairing
            'Sniper': 0.5,          # Can occasionally feed snipers
            'Playmaker': 0.5,       # Okay with playmakers
            'Power Forward': 1,     # Good balance
            '2 Way Forward': 1,     # Good balance
            'Enforcer': 0.5         # Decent pairing
        }
    }
    
    # Size compatibility 
    SIZE_COMPATIBILITY = {
        'Small': {
            'Small': 0.5,    # Small players can have good speed together
            'Medium': 1,     # Good balance
            'Large': 0       # Neutral
        },
        'Medium': {
            'Small': 1,      # Good balance
            'Medium': 1,     # Good overall compatibility
            'Large': 1       # Good balance
        },
        'Large': {
            'Small': 0,      # Neutral
            'Medium': 1,     # Good balance
            'Large': 0.5     # Can dominate physically but might be slow
        }
    }
    
    # Shooting side compatibility (mostly for defense pairs)
    SHOOTING_SIDE_COMPATIBILITY = {
        'L': {
            'L': 0,     # Two left shots on defense isn't ideal
            'R': 1      # Left-right combination is ideal
        },
        'R': {
            'L': 1,     # Right-left combination is ideal
            'R': 0      # Two right shots on defense isn't ideal
        }
    }
    
    def __init__(self):
        """Initialize the chemistry calculator with default parameters."""
        # Dictionary to track time played together between pairs of players
        self.time_played_together = {}
        
    def get_player_size_category(self, weight: float) -> str:
        """
        Determine player size category based on weight.
        
        Args:
            weight: Player weight in pounds
            
        Returns:
            Size category as string: 'Small', 'Medium', or 'Large'
        """
        if weight < 180:
            return 'Small'
        elif weight < 210:
            return 'Medium'
        else:
            return 'Large'
            
    def _calculate_player_compatibility(self, player1: Dict[str, Any], player2: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """
        Calculate compatibility between two players.
        
        Args:
            player1: First player dictionary with attributes
            player2: Second player dictionary with attributes
            
        Returns:
            Tuple of (compatibility score, factors dictionary)
        """
        compatibility_score = 0.0
        factors = {}
        
        # Player type compatibility
        player1_type = player1.get('player_type')
        player2_type = player2.get('player_type')
        
        if player1_type and player2_type and player1_type in self.PLAYER_TYPE_COMPATIBILITY and player2_type in self.PLAYER_TYPE_COMPATIBILITY[player1_type]:
            type_compat = self.PLAYER_TYPE_COMPATIBILITY[player1_type][player2_type]
            compatibility_score += type_compat
            factors['player_type'] = type_compat
        
        # Size compatibility
        player1_weight = player1.get('weight', 190)  # Default to medium if not specified
        player2_weight = player2.get('weight', 190)
        
        player1_size = self.get_player_size_category(player1_weight)
        player2_size = self.get_player_size_category(player2_weight)
        
        if player1_size in self.SIZE_COMPATIBILITY and player2_size in self.SIZE_COMPATIBILITY[player1_size]:
            size_compat = self.SIZE_COMPATIBILITY[player1_size][player2_size]
            compatibility_score += size_compat
            factors['size'] = size_compat
        
        # Shooting side compatibility (mostly for defensemen)
        player1_shoots = player1.get('shoots')
        player2_shoots = player2.get('shoots')
        
        # Position check for defense
        is_defense_pair = (player1.get('position', '').startswith('D') and 
                          player2.get('position', '').startswith('D'))
        
        if is_defense_pair and player1_shoots and player2_shoots:
            if player1_shoots in self.SHOOTING_SIDE_COMPATIBILITY and player2_shoots in self.SHOOTING_SIDE_COMPATIBILITY[player1_shoots]:
                shoot_compat = self.SHOOTING_SIDE_COMPATIBILITY[player1_shoots][player2_shoots]
                compatibility_score += shoot_compat * 2  # Higher weight for defense pairs
                factors['shooting_side'] = shoot_compat * 2
        
        # Time played together factor
        player_pair_key = self._get_player_pair_key(player1, player2)
        time_played = self.time_played_together.get(player_pair_key, 0)
        
        # Chemistry improves with time played together (up to a point)
        time_factor = 0
        if time_played > 0:
            # Calculate time factor: 0.5 at 100 minutes, 1.0 at 300 minutes, 1.5 at 500+ minutes
            time_factor = min(1.5, time_played / 333)
            compatibility_score += time_factor
            factors['time_played'] = time_factor
        
        return compatibility_score, factors
    
    def _get_player_pair_key(self, player1: Dict[str, Any], player2: Dict[str, Any]) -> str:
        """
        Create a consistent key for a pair of players regardless of order.
        
        Args:
            player1: First player dictionary
            player2: Second player dictionary
            
        Returns:
            String key representing the player pair
        """
        id1 = player1.get('id', player1.get('name', ''))
        id2 = player2.get('id', player2.get('name', ''))
        
        # Sort to ensure consistency regardless of player order
        if str(id1) < str(id2):
            return f"{id1}_{id2}"
        else:
            return f"{id2}_{id1}"
    
    def calculate_forward_line_chemistry(self, players: List[Dict[str, Any]]) -> Tuple[float, Dict[str, Any]]:
        """
        Calculate chemistry for a forward line.
        
        Args:
            players: List of 3 forwards [LW, C, RW]
            
        Returns:
            Tuple of (chemistry rating, chemistry factors)
        """
        if len(players) != 3 or any(p is None or p == 'Empty' for p in players):
            return 0, {}
            
        # Calculate pairwise chemistry between all three forwards
        lw_c_score, lw_c_factors = self._calculate_player_compatibility(players[0], players[1])
        c_rw_score, c_rw_factors = self._calculate_player_compatibility(players[1], players[2])
        lw_rw_score, lw_rw_factors = self._calculate_player_compatibility(players[0], players[2])
        
        # Weight center-winger chemistry more heavily than winger-winger
        weighted_score = (lw_c_score * 0.4) + (c_rw_score * 0.4) + (lw_rw_score * 0.2)
        
        # Normalize to our chemistry scale (-5 to +5)
        normalized_score = self._normalize_chemistry_score(weighted_score)
        
        # Round to nearest 0.5
        rounded_score = round(normalized_score * 2) / 2
        
        # Compile factors for explanation
        factors = {
            'lw_c': lw_c_factors,
            'c_rw': c_rw_factors,
            'lw_rw': lw_rw_factors,
            'final_score': rounded_score
        }
        
        return rounded_score, factors
    
    def calculate_defense_pair_chemistry(self, players: List[Dict[str, Any]]) -> Tuple[float, Dict[str, Any]]:
        """
        Calculate chemistry for a defense pair.
        
        Args:
            players: List of 2 defensemen [LD, RD]
            
        Returns:
            Tuple of (chemistry rating, chemistry factors)
        """
        if len(players) != 2 or any(p is None or p == 'Empty' for p in players):
            return 0, {}
            
        # Calculate defensemen pair chemistry
        score, factors = self._calculate_player_compatibility(players[0], players[1])
        
        # For defense pairs, shooting side and player type are more critical
        # We've already weighted shooting side in _calculate_player_compatibility
        
        # Normalize to our chemistry scale (-5 to +5)
        normalized_score = self._normalize_chemistry_score(score)
        
        # Round to nearest 0.5
        rounded_score = round(normalized_score * 2) / 2
        
        # Add final score to factors
        factors['final_score'] = rounded_score
        
        return rounded_score, factors
    
    def calculate_pp_unit_chemistry(self, unit: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """
        Calculate chemistry for a power play unit.
        
        Args:
            unit: Dictionary with 'forwards' and 'defense' lists
            
        Returns:
            Tuple of (chemistry rating, chemistry factors)
        """
        forwards = unit.get('forwards', [])
        defense = unit.get('defense', [])
        
        if not forwards or not defense:
            return 0, {}
            
        # Calculate chemistry between forwards
        forward_scores = []
        forward_factors = {}
        
        # Calculate pairwise chemistry between forwards
        for i in range(len(forwards)):
            for j in range(i + 1, len(forwards)):
                score, factors = self._calculate_player_compatibility(forwards[i], forwards[j])
                forward_scores.append(score)
                key = f"fw{i+1}_fw{j+1}"
                forward_factors[key] = factors
        
        # Calculate chemistry between defensemen if there are multiple
        defense_scores = []
        defense_factors = {}
        
        if len(defense) > 1:
            for i in range(len(defense)):
                for j in range(i + 1, len(defense)):
                    score, factors = self._calculate_player_compatibility(defense[i], defense[j])
                    defense_scores.append(score)
                    key = f"d{i+1}_d{j+1}"
                    defense_factors[key] = factors
        
        # Calculate chemistry between forwards and defense
        cross_scores = []
        cross_factors = {}
        
        for i, fw in enumerate(forwards):
            for j, d in enumerate(defense):
                score, factors = self._calculate_player_compatibility(fw, d)
                cross_scores.append(score)
                key = f"fw{i+1}_d{j+1}"
                cross_factors[key] = factors
        
        # Calculate weighted average
        # 50% forward chemistry, 20% defense chemistry, 30% forward-defense chemistry
        total_score = 0
        total_weight = 0
        
        if forward_scores:
            avg_forward_score = sum(forward_scores) / len(forward_scores)
            total_score += avg_forward_score * 0.5
            total_weight += 0.5
            
        if defense_scores:
            avg_defense_score = sum(defense_scores) / len(defense_scores)
            total_score += avg_defense_score * 0.2
            total_weight += 0.2
            
        if cross_scores:
            avg_cross_score = sum(cross_scores) / len(cross_scores)
            total_score += avg_cross_score * 0.3
            total_weight += 0.3
            
        # Calculate final score
        if total_weight > 0:
            weighted_score = total_score / total_weight
        else:
            weighted_score = 0
            
        # Normalize to our chemistry scale (-5 to +5)
        normalized_score = self._normalize_chemistry_score(weighted_score)
        
        # Round to nearest 0.5
        rounded_score = round(normalized_score * 2) / 2
        
        # Compile all factors
        factors = {
            'forward_chemistry': forward_factors,
            'defense_chemistry': defense_factors,
            'forward_defense_chemistry': cross_factors,
            'final_score': rounded_score
        }
        
        return rounded_score, factors
    
    def calculate_pk_unit_chemistry(self, unit: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """
        Calculate chemistry for a penalty kill unit.
        
        Args:
            unit: Dictionary with 'forwards' and 'defense' lists
            
        Returns:
            Tuple of (chemistry rating, chemistry factors)
        """
        forwards = unit.get('forwards', [])
        defense = unit.get('defense', [])
        
        if not forwards or not defense:
            return 0, {}
            
        # Calculate chemistry between forwards
        forward_scores = []
        forward_factors = {}
        
        if len(forwards) > 1:
            score, factors = self._calculate_player_compatibility(forwards[0], forwards[1])
            forward_scores.append(score)
            forward_factors['fw1_fw2'] = factors
        
        # Calculate chemistry between defensemen
        defense_scores = []
        defense_factors = {}
        
        if len(defense) > 1:
            score, factors = self._calculate_player_compatibility(defense[0], defense[1])
            defense_scores.append(score)
            defense_factors['d1_d2'] = factors
        
        # For PK, prioritize defensive attributes
        # Add bonus for two-way or defensive player types
        defensive_bonus = 0
        defensive_factors = {}
        
        for i, player in enumerate(forwards + defense):
            player_type = player.get('player_type', '')
            if player_type in ['2 Way Forward', 'Defensive Def.', '2 Way Def.']:
                defensive_bonus += 0.5
                defensive_factors[f'player{i+1}_defensive_type'] = 0.5
        
        # Compute weighted score
        # 30% forward chemistry, 30% defense chemistry, 40% defensive bonus
        total_score = 0
        total_weight = 0
        
        if forward_scores:
            avg_forward_score = sum(forward_scores) / len(forward_scores)
            total_score += avg_forward_score * 0.3
            total_weight += 0.3
            
        if defense_scores:
            avg_defense_score = sum(defense_scores) / len(defense_scores)
            total_score += avg_defense_score * 0.3
            total_weight += 0.3
            
        if defensive_bonus > 0:
            total_score += defensive_bonus * 0.4
            total_weight += 0.4
            
        # Calculate final score
        if total_weight > 0:
            weighted_score = total_score / total_weight
        else:
            weighted_score = 0
            
        # Normalize to our chemistry scale (-5 to +5)
        normalized_score = self._normalize_chemistry_score(weighted_score)
        
        # Round to nearest 0.5
        rounded_score = round(normalized_score * 2) / 2
        
        # Compile all factors
        factors = {
            'forward_chemistry': forward_factors,
            'defense_chemistry': defense_factors,
            'defensive_bonus': defensive_factors,
            'final_score': rounded_score
        }
        
        return rounded_score, factors
    
    def _normalize_chemistry_score(self, raw_score: float) -> float:
        """
        Normalize a raw compatibility score to our chemistry scale (-5 to +5).
        
        Args:
            raw_score: Raw compatibility score
            
        Returns:
            Normalized chemistry score
        """
        # Define the range for raw scores
        # A typical raw score would be between -3 and +5
        min_raw = -3
        max_raw = 5
        
        # Normalize to our chemistry scale
        normalized = ((raw_score - min_raw) / (max_raw - min_raw)) * \
                    (self.MAX_CHEMISTRY - self.MIN_CHEMISTRY) + self.MIN_CHEMISTRY
                    
        # Clamp to our defined min/max
        return max(self.MIN_CHEMISTRY, min(self.MAX_CHEMISTRY, normalized))
    
    def update_time_played(self, players: List[Dict[str, Any]], minutes: float) -> None:
        """
        Update the time played together for a group of players.
        
        Args:
            players: List of player dictionaries
            minutes: Minutes played together in this session
        """
        # For each pair of players, update their time played together
        for i in range(len(players)):
            if players[i] is None or players[i] == 'Empty':
                continue
                
            for j in range(i + 1, len(players)):
                if players[j] is None or players[j] == 'Empty':
                    continue
                    
                pair_key = self._get_player_pair_key(players[i], players[j])
                
                if pair_key in self.time_played_together:
                    self.time_played_together[pair_key] += minutes
                else:
                    self.time_played_together[pair_key] = minutes
    
    def get_chemistry_performance_modifier(self, chemistry_value: float) -> float:
        """
        Convert a chemistry rating to a performance modifier for game simulations.
        
        Args:
            chemistry_value: Chemistry rating (-5 to +5)
            
        Returns:
            Performance multiplier centered around 1.0
        """
        # Convert chemistry to a performance multiplier
        # 0 chemistry = 1.0 (no modifier)
        # +5 chemistry = 1.15 (15% boost)
        # -5 chemistry = 0.85 (15% penalty)
        return 1.0 + (chemistry_value / 33.33)
    
    def reset_time_played(self) -> None:
        """Reset all time played data."""
        self.time_played_together = {}

    def calculate_team_chemistry(self, lines: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate chemistry values for all line combinations.
        
        Args:
            lines: The line combinations dictionary
            
        Returns:
            Dictionary with chemistry values
        """
        chemistry = {
            'overall': 0,
            'forward_lines': {},
            'defense_pairs': {},
            'special_teams': {}
        }
        
        # Calculate forward line chemistry
        forward_chemistry = {}
        for i, line in enumerate(lines.get('forward_lines', [])):
            # For now, just use random values (would be based on player attributes)
            line_chemistry = random.uniform(70, 95)
            forward_chemistry[f'line_{i+1}'] = round(line_chemistry, 1)
            
        chemistry['forward_lines'] = forward_chemistry
        
        # Calculate defense pair chemistry
        defense_chemistry = {}
        for i, pair in enumerate(lines.get('defense_pairs', [])):
            # For now, just use random values (would be based on player attributes)
            pair_chemistry = random.uniform(70, 95)
            defense_chemistry[f'pair_{i+1}'] = round(pair_chemistry, 1)
            
        chemistry['defense_pairs'] = defense_chemistry
        
        # Calculate special teams chemistry
        special_teams_chemistry = {
            'power_play': round(random.uniform(70, 95), 1),
            'penalty_kill': round(random.uniform(70, 95), 1)
        }
        chemistry['special_teams'] = special_teams_chemistry
        
        # Calculate overall chemistry as weighted average
        overall = 0
        if forward_chemistry:
            overall += sum(forward_chemistry.values()) / len(forward_chemistry) * 0.5
            
        if defense_chemistry:
            overall += sum(defense_chemistry.values()) / len(defense_chemistry) * 0.3
            
        if special_teams_chemistry:
            overall += (special_teams_chemistry['power_play'] + special_teams_chemistry['penalty_kill']) / 2 * 0.2
            
        chemistry['overall'] = round(overall, 1)
        
        return chemistry
