from typing import Dict, List, Any, Optional
import random

class CoachStrategy:
    """
    Implements coaching strategies that affect line formations and gameplay.
    Different coaches have different preferences for player types, 
    line combinations, and in-game strategies.
    """
    
    # Coach strategy types and their default attributes
    STRATEGY_TEMPLATES = {
        'Offensive': {
            'offensive_bias': 0.8,
            'defensive_bias': 0.2,
            'physical_bias': 0.4,
            'skill_bias': 0.7,
            'forward_line_balance': 0.3,  # Lower means more focus on top lines
            'player_type_preferences': {
                'Sniper': 1.5,
                'Playmaker': 1.3,
                'Power Forward': 1.0,
                '2 Way Forward': 0.8,
                'Enforcer': 0.6,
                'Offensive Def.': 1.5,
                'Defensive Def.': 0.7,
                '2 Way Def.': 1.0
            }
        },
        'Defensive': {
            'offensive_bias': 0.3,
            'defensive_bias': 0.8,
            'physical_bias': 0.6,
            'skill_bias': 0.5,
            'forward_line_balance': 0.6,  # Higher means more balanced ice time
            'player_type_preferences': {
                'Sniper': 0.8,
                'Playmaker': 0.9,
                'Power Forward': 1.1,
                '2 Way Forward': 1.5,
                'Enforcer': 1.0,
                'Offensive Def.': 0.8,
                'Defensive Def.': 1.5,
                '2 Way Def.': 1.3
            }
        },
        'Balanced': {
            'offensive_bias': 0.5,
            'defensive_bias': 0.5,
            'physical_bias': 0.5,
            'skill_bias': 0.5,
            'forward_line_balance': 0.5,
            'player_type_preferences': {
                'Sniper': 1.0,
                'Playmaker': 1.0,
                'Power Forward': 1.0,
                '2 Way Forward': 1.0,
                'Enforcer': 1.0,
                'Offensive Def.': 1.0,
                'Defensive Def.': 1.0,
                '2 Way Def.': 1.2  # Slight preference for 2-way defensemen
            }
        },
        'Physical': {
            'offensive_bias': 0.4,
            'defensive_bias': 0.6,
            'physical_bias': 0.9,
            'skill_bias': 0.3,
            'forward_line_balance': 0.4,
            'player_type_preferences': {
                'Sniper': 0.7,
                'Playmaker': 0.7,
                'Power Forward': 1.5,
                '2 Way Forward': 1.1,
                'Enforcer': 1.5,
                'Offensive Def.': 0.7,
                'Defensive Def.': 1.3,
                '2 Way Def.': 1.0
            }
        },
        'Skill': {
            'offensive_bias': 0.7,
            'defensive_bias': 0.4,
            'physical_bias': 0.3,
            'skill_bias': 0.9,
            'forward_line_balance': 0.3,
            'player_type_preferences': {
                'Sniper': 1.4,
                'Playmaker': 1.5,
                'Power Forward': 0.9,
                '2 Way Forward': 1.0,
                'Enforcer': 0.5,
                'Offensive Def.': 1.4,
                'Defensive Def.': 0.8,
                '2 Way Def.': 1.1
            }
        }
    }
    
    def __init__(self, coach_data: Dict[str, Any] = None):
        """
        Initialize coach strategy with provided data or default to balanced.
        
        Args:
            coach_data: Dictionary with coach attributes and preferences
        """
        # Set default attributes
        self.name = "Default Coach"
        self.strategy_type = "Balanced"
        self.attributes = self._get_default_strategy("Balanced")
        
        # Override with provided data if available
        if coach_data:
            self.name = coach_data.get('name', self.name)
            self.strategy_type = coach_data.get('strategy_type', self.strategy_type)
            
            # Load appropriate template strategy
            self.attributes = self._get_default_strategy(self.strategy_type)
            
            # Override default attributes with custom ones if provided
            if 'attributes' in coach_data:
                for key, value in coach_data['attributes'].items():
                    self.attributes[key] = value
    
    def _get_default_strategy(self, strategy_type: str) -> Dict[str, Any]:
        """
        Get the default attributes for a strategy type.
        
        Args:
            strategy_type: Type of coaching strategy
            
        Returns:
            Dictionary with default attributes for the strategy
        """
        if strategy_type in self.STRATEGY_TEMPLATES:
            return self.STRATEGY_TEMPLATES[strategy_type].copy()
        else:
            # Fallback to balanced if strategy not found
            return self.STRATEGY_TEMPLATES['Balanced'].copy()
    
    def adjust_lines_for_strategy(self, lines: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adjust line combinations based on coach strategy.
        
        Args:
            lines: Dictionary with line combinations
            
        Returns:
            Adjusted line combinations
        """
        # Create a deep copy to avoid modifying the original
        import copy
        adjusted_lines = copy.deepcopy(lines)
        
        try:
            # Adjust forward lines
            if 'forward_lines' in adjusted_lines:
                self._adjust_forward_lines(adjusted_lines['forward_lines'])
                
            # Adjust defense pairs
            if 'defense_pairs' in adjusted_lines:
                self._adjust_defense_pairs(adjusted_lines['defense_pairs'])
                
            # Handle both old and new format for power play units
            if 'power_play_units' in adjusted_lines:
                self._adjust_special_teams(adjusted_lines['power_play_units'], 'offensive')
            elif 'power_play_1' in adjusted_lines and 'power_play_2' in adjusted_lines:
                # Create a temporary list to adjust both units
                pp_units = [adjusted_lines['power_play_1'], adjusted_lines['power_play_2']]
                self._adjust_special_teams(pp_units, 'offensive')
                # Update the original dictionaries
                adjusted_lines['power_play_1'] = pp_units[0]
                adjusted_lines['power_play_2'] = pp_units[1]
            
            # Handle both old and new format for penalty kill units
            if 'penalty_kill_units' in adjusted_lines:
                self._adjust_special_teams(adjusted_lines['penalty_kill_units'], 'defensive')
            elif 'penalty_kill_1' in adjusted_lines and 'penalty_kill_2' in adjusted_lines:
                # Create a temporary list to adjust both units
                pk_units = [adjusted_lines['penalty_kill_1'], adjusted_lines['penalty_kill_2']]
                self._adjust_special_teams(pk_units, 'defensive')
                # Update the original dictionaries
                adjusted_lines['penalty_kill_1'] = pk_units[0]
                adjusted_lines['penalty_kill_2'] = pk_units[1]
        except Exception as e:
            import traceback
            print(f"Error in adjust_lines_for_strategy: {e}")
            traceback.print_exc()
            # If there's an error, just return the original lines
            # This ensures we don't crash the entire application
        
        return adjusted_lines
    
    def _adjust_forward_lines(self, forward_lines: List[Dict[str, Any]]) -> None:
        """
        Adjust forward lines based on coach strategy.
        This may reorder players or swap them between lines.
        
        Args:
            forward_lines: List of forward line dictionaries
        """
        # Example adjustment: Coaches with offensive bias might push
        # their best offensive players up the lineup
        offensive_bias = self.attributes.get('offensive_bias', 0.5)
        
        # Simple implementation: If offensive bias is high, 
        # we might swap a high-shooting player up a line
        if offensive_bias > 0.7 and len(forward_lines) >= 2:
            for position in ['LW', 'C', 'RW']:
                # Look at second line
                if forward_lines[1].get(position) and 'shooting' in forward_lines[1][position]:
                    # If second line player has high shooting, consider swap
                    if forward_lines[1][position]['shooting'] > 85:
                        # 50% chance to swap with first line player
                        if random.random() < 0.5 and forward_lines[0].get(position):
                            forward_lines[0][position], forward_lines[1][position] = \
                                forward_lines[1][position], forward_lines[0][position]
    
    def _adjust_defense_pairs(self, defense_pairs: List[Dict[str, Any]]) -> None:
        """
        Adjust defense pairs based on coach strategy.
        
        Args:
            defense_pairs: List of defense pair dictionaries
        """
        # Example: Defensive coaches prefer balanced pairs
        defensive_bias = self.attributes.get('defensive_bias', 0.5)
        
        # Try to create balanced pairs if we're defensive-minded
        if defensive_bias > 0.7 and len(defense_pairs) >= 2:
            # Check if we have an offensive and defensive defenseman
            # in different pairs that could be swapped
            if (defense_pairs[0].get('LD') and defense_pairs[1].get('LD') and
                defense_pairs[0]['LD'].get('player_type') == 'Offensive Def.' and
                defense_pairs[1]['LD'].get('player_type') == 'Defensive Def.'):
                # Swap them for better balance
                defense_pairs[0]['LD'], defense_pairs[1]['LD'] = \
                    defense_pairs[1]['LD'], defense_pairs[0]['LD']
            
            # Same check for right defensemen
            if (defense_pairs[0].get('RD') and defense_pairs[1].get('RD') and
                defense_pairs[0]['RD'].get('player_type') == 'Offensive Def.' and
                defense_pairs[1]['RD'].get('player_type') == 'Defensive Def.'):
                # Swap them for better balance
                defense_pairs[0]['RD'], defense_pairs[1]['RD'] = \
                    defense_pairs[1]['RD'], defense_pairs[0]['RD']
    
    def _adjust_special_teams(self, units, unit_type: str) -> None:
        """
        Adjust special teams units based on coach strategy.
        
        Args:
            units: List of special teams unit dictionaries or a single unit dictionary
            unit_type: Type of unit ('offensive' for PP, 'defensive' for PK)
        """
        import random
        
        # If we're dealing with a single unit instead of a list, handle it properly
        is_single_unit = not isinstance(units, list)
        units_list = [units] if is_single_unit else units
        
        try:
            # For power play (offensive units)
            if unit_type == 'offensive' and self.attributes.get('offensive_bias', 0.5) > 0.8:
                # Check if the unit has the expected structure
                for unit in units_list:
                    # Handle both old format (players list) and new format (forwards/defense)
                    if 'players' in unit:
                        # Original format with 'players' list - no action needed for now
                        pass
                    elif 'forwards' in unit and 'defense' in unit:
                        # New format with separate forwards and defense lists
                        # Example: If a coach is very offensive-minded, we might
                        # try to use 4 forwards/1 defenseman on power play
                        forwards = unit.get('forwards', [])
                        defense = unit.get('defense', [])
                        
                        # Only make this adjustment if we have enough forwards and the coach is offensive
                        if len(forwards) >= 3 and len(defense) >= 1 and random.random() < 0.3:
                            # If we have multiple defensemen, remove one and add a forward
                            # (this is just a simple example - actual implementation would be more complex)
                            pass
            
            # For penalty kill (defensive units)
            elif unit_type == 'defensive' and self.attributes.get('defensive_bias', 0.5) > 0.8:
                # Check if the unit has the expected structure
                for unit in units_list:
                    # Handle both old format (players list) and new format (forwards/defense)
                    if 'players' in unit:
                        # Original format with 'players' list - no action needed for now
                        pass
                    elif 'forwards' in unit and 'defense' in unit:
                        # New format with separate forwards and defense lists
                        # For penalty kill, defensive coaches prefer defensive specialists
                        forwards = unit.get('forwards', [])
                        
                        # Example: Sort forwards by defensive ability if available
                        if forwards and 'defense' in forwards[0]:
                            forwards.sort(key=lambda p: p.get('defense', 0), reverse=True)
                        
                        # More complex defensive adjustment logic would go here
                        pass
        
        except Exception as e:
            import traceback
            print(f"Error adjusting special teams: {e}")
            traceback.print_exc()
            # Continue without adjustments rather than crashing
    
    def get_ice_time_distribution(self) -> Dict[str, Dict[str, float]]:
        """
        Get the coach's preferred ice time distribution for different situations.
        
        Returns:
            Dictionary with ice time percentages by line/pair for different situations
        """
        # Base distribution affected by forward_line_balance attribute
        balance_factor = self.attributes.get('forward_line_balance', 0.5)
        
        # Lower balance factor means more ice time for top lines
        # Higher means more balanced distribution
        
        # Calculate distributions
        forward_even_strength = {
            'line1': 0.35 - (balance_factor * 0.1),  # Range: 0.3-0.35
            'line2': 0.3 - (balance_factor * 0.05),  # Range: 0.25-0.3
            'line3': 0.25 + (balance_factor * 0.05), # Range: 0.25-0.3
            'line4': 0.1 + (balance_factor * 0.1)    # Range: 0.1-0.2
        }
        
        defense_even_strength = {
            'pair1': 0.45 - (balance_factor * 0.1),  # Range: 0.35-0.45
            'pair2': 0.35,                          # Fixed at 0.35
            'pair3': 0.2 + (balance_factor * 0.1)   # Range: 0.2-0.3
        }
        
        return {
            'forward_even_strength': forward_even_strength,
            'defense_even_strength': defense_even_strength,
            'power_play': {
                'unit1': 0.7,  # First unit gets 70% of PP time
                'unit2': 0.3   # Second unit gets 30%
            },
            'penalty_kill': {
                'unit1': 0.6,  # First unit gets 60% of PK time
                'unit2': 0.4   # Second unit gets 40%
            }
        }
    
    def get_matchup_preferences(self) -> Dict[str, Any]:
        """
        Get the coach's preferences for line matching.
        
        Returns:
            Dictionary with matchup preferences
        """
        return {
            'match_top_line': self.attributes.get('defensive_bias', 0.5) > 0.6,
            'match_top_pair': self.attributes.get('defensive_bias', 0.5) > 0.7,
            'home_advantage_factor': 0.8  # How much to leverage home ice advantage
        }
    
    def get_strategy_name(self) -> str:
        """
        Get a descriptive name for the coach's strategy.
        
        Returns:
            Strategy description string
        """
        # Determine the dominant aspect of the coach's strategy
        attributes = self.attributes
        
        # Find the highest bias
        biases = {
            'Offensive': attributes.get('offensive_bias', 0),
            'Defensive': attributes.get('defensive_bias', 0),
            'Physical': attributes.get('physical_bias', 0),
            'Skill': attributes.get('skill_bias', 0)
        }
        
        dominant_bias = max(biases.items(), key=lambda x: x[1])
        
        # If the dominant bias is strong enough, use it
        if dominant_bias[1] > 0.7:
            return f"{dominant_bias[0]} Strategy"
        else:
            return "Balanced Strategy"
    
    def get_player_value_modifier(self, player: Dict[str, Any]) -> float:
        """
        Get the coach's valuation modifier for a specific player.
        This affects how the coach values the player relative to others.
        
        Args:
            player: Player dictionary with attributes
            
        Returns:
            Modifier value (1.0 is neutral, higher is more valued)
        """
        modifier = 1.0
        
        # Apply player type preference
        player_type = player.get('player_type')
        if player_type in self.attributes.get('player_type_preferences', {}):
            modifier *= self.attributes['player_type_preferences'][player_type]
            
        # Could add more factors here, such as:
        # - Player size preference
        # - Skill attributes preference
        # - Age preference
        # - Chemistry with existing players
        
        return modifier
