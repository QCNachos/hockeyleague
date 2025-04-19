from typing import Dict, List, Any, Tuple, Optional
import copy
from .Lines import LineOptimizer
from .Chemistry import ChemistryCalculator
from .Coach import CoachStrategy

class TeamFormation:
    """
    Integrates line optimization, player chemistry, and coach strategies
    to create the most effective team formations.
    """
    
    def __init__(self, team_abbreviation: str):
        """Initialize the team formation manager for a specific team.
        
        Args:
            team_abbreviation: The abbreviation of the team
        """
        self.team_abbreviation = team_abbreviation
        
        # Initialize component systems
        self.line_optimizer = LineOptimizer(team_abbreviation)
        self.chemistry_calculator = ChemistryCalculator()
        self.coach_strategy = None  # Will be set when coach is assigned
        
        # Cache for calculated chemistry values
        self.chemistry_cache = {}
        
        # Current lines and optimal lines
        self.current_lines = {}
        self.optimal_lines = {}
        
        # Team overall rating cache
        self.team_rating = {}
    
    async def initialize(self):
        """
        Initialize the team formation by fetching players and coach data.
        """
        # Fetch players
        success = await self.line_optimizer.fetch_team_players()
        if not success:
            return False
            
        # Fetch coach data
        coach_data = await self._fetch_coach_data()
        
        # Initialize coach strategy with fetched data
        if coach_data:
            self.coach_strategy = CoachStrategy(coach_data)
        else:
            # Use default coach if none found
            self.coach_strategy = CoachStrategy()
            
        return True
        
    async def _fetch_coach_data(self) -> Optional[Dict[str, Any]]:
        """
        Fetch coach data for the team from the database.
        
        Returns:
            Coach data dictionary or None if not found
        """
        from supabase import create_client, Client
        import os

        # Initialize Supabase client
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)
        
        # Fetch coach for the team
        response = await supabase.table('Coach').select('*').eq('team', self.team_abbreviation).execute()
        
        if response.error:
            print(f"Error fetching coach: {response.error}")
            return None
            
        # If coach found, return the first one
        if response.data and len(response.data) > 0:
            return response.data[0]
            
        return None
    
    def generate_optimal_lines(self) -> Dict[str, Any]:
        """
        Generate optimal line combinations considering chemistry and coach strategy.
        
        Returns:
            Dictionary with optimized line combinations
        """
        # Clear any cached chemistries
        self.chemistry_cache = {}
        
        # Step 1: Generate base lines using the line optimizer
        base_lines = self.line_optimizer.generate_all_lines()
        
        # Step 2: Apply coach's strategy to adjust lines based on preferences
        if self.coach_strategy:
            adjusted_lines = self.coach_strategy.adjust_lines_for_strategy(base_lines)
        else:
            adjusted_lines = base_lines
            
        # Step 3: Refine special teams based on realistic deployment patterns
        adjusted_lines = self._refine_special_teams(adjusted_lines)
            
        # Step 4: Calculate chemistry for each line and pair
        line_chemistry = self._calculate_all_chemistry(adjusted_lines)
        
        # Step 5: Optimize lines based on chemistry values
        optimized_lines = self._optimize_lines_by_chemistry(adjusted_lines, line_chemistry)
        
        # Step 6: Calculate final team ratings
        self.team_rating = self._calculate_team_rating(optimized_lines)
        
        # Store the resulting optimized lines
        self.optimal_lines = optimized_lines
        
        return {
            'lines': optimized_lines,
            'chemistry': line_chemistry,
            'team_rating': self.team_rating
        }
        
    def _refine_special_teams(self, lines: Dict[str, Any]) -> Dict[str, Any]:
        """
        Refine special teams based on realistic NHL deployment patterns.
        This ensures players are placed in appropriate roles based on their 
        skills, positions, and shooting sides.
        
        Args:
            lines: Dictionary with line combinations
            
        Returns:
            Dictionary with refined special teams
        """
        refined_lines = copy.deepcopy(lines)
        
        # Get all players from regular lines for identification
        all_forwards = []
        all_defensemen = []
        
        # Extract players from forward lines
        for line in refined_lines.get('forward_lines', []):
            if line.get('LW') and line.get('LW') != 'Empty':
                all_forwards.append(line.get('LW'))
            if line.get('C') and line.get('C') != 'Empty':
                all_forwards.append(line.get('C'))
            if line.get('RW') and line.get('RW') != 'Empty':
                all_forwards.append(line.get('RW'))
        
        # Extract players from defense pairs
        for pair in refined_lines.get('defense_pairs', []):
            if pair.get('LD') and pair.get('LD') != 'Empty':
                all_defensemen.append(pair.get('LD'))
            if pair.get('RD') and pair.get('RD') != 'Empty':
                all_defensemen.append(pair.get('RD'))
        
        # Refine power play units
        refined_lines = self._refine_power_play_units(refined_lines, all_forwards, all_defensemen)
        
        # Refine penalty kill units
        refined_lines = self._refine_penalty_kill_units(refined_lines, all_forwards, all_defensemen)
        
        return refined_lines
    
    def _refine_power_play_units(self, lines: Dict[str, Any], all_forwards: List[Dict], all_defensemen: List[Dict]) -> Dict[str, Any]:
        """
        Refine power play units based on realistic NHL deployment.
        
        Args:
            lines: Dictionary with line combinations
            all_forwards: List of all forwards
            all_defensemen: List of all defensemen
            
        Returns:
            Dictionary with refined power play units
        """
        refined_lines = copy.deepcopy(lines)
        
        # Get players by specialties
        snipers = [p for p in all_forwards if p.get('player_type') == 'Sniper']
        playmakers = [p for p in all_forwards if p.get('player_type') == 'Playmaker']
        power_forwards = [p for p in all_forwards if p.get('player_type') == 'Power Forward']
        two_way_forwards = [p for p in all_forwards if p.get('player_type') in ['2 Way', '2 Way Forward']]
        offensive_dmen = [p for p in all_defensemen if p.get('player_type') == 'Offensive Def.']
        
        # Sort each group by overall rating
        snipers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        playmakers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        power_forwards.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        offensive_dmen.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Group players by position for position-specific selection
        left_wings = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) == 'LW']
        centers = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) == 'C']
        right_wings = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) == 'RW']
        
        left_wings.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        centers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        right_wings.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # FIRST POWER PLAY UNIT
        pp1_forwards = []
        pp1_defense = []
        
        # Use 4F-1D by default (most common in NHL)
        
        # Assign best offensive defenseman to quarterback PP1
        if offensive_dmen:
            pp1_defense.append(offensive_dmen[0])
        elif all_defensemen:
            # If no offensive defensemen, use best overall
            best_dman = sorted(all_defensemen, key=lambda p: p.get('overall_rating', 0), reverse=True)[0]
            pp1_defense.append(best_dman)
        
        # Try to place shooters on their off-wing for one-timers
        # Right-handed snipers often play left side, left-handed snipers on right side
        for sniper in snipers[:2]:  # Get top 2 snipers
            shooting_hand = sniper.get('shoots', 'L')
            already_in_pp1 = sniper in pp1_forwards
            
            if not already_in_pp1:
                if shooting_hand == 'R' and len([p for p in pp1_forwards if p.get('position_primary') == 'LW']) == 0:
                    # Right-hand shot to LW for one-timers
                    sniper_copy = copy.deepcopy(sniper)
                    sniper_copy['pp_position'] = 'LW'
                    pp1_forwards.append(sniper_copy)
                elif shooting_hand == 'L' and len([p for p in pp1_forwards if p.get('position_primary') == 'RW']) == 0:
                    # Left-hand shot to RW for one-timers
                    sniper_copy = copy.deepcopy(sniper)
                    sniper_copy['pp_position'] = 'RW'
                    pp1_forwards.append(sniper_copy)
        
        # Add best playmaker at C position
        if playmakers and len([p for p in pp1_forwards if p.get('pp_position') == 'C']) == 0:
            for playmaker in playmakers:
                if playmaker not in pp1_forwards:
                    playmaker_copy = copy.deepcopy(playmaker)
                    playmaker_copy['pp_position'] = 'C'
                    pp1_forwards.append(playmaker_copy)
                    break
        
        # Fill remaining positions for balance
        slots_needed = 4 - len(pp1_forwards)  # 4 forwards for 4F-1D
        
        # Check which positions we need to fill
        has_lw = any(p.get('pp_position') == 'LW' for p in pp1_forwards)
        has_c = any(p.get('pp_position') == 'C' for p in pp1_forwards)
        has_rw = any(p.get('pp_position') == 'RW' for p in pp1_forwards)
        
        # Add best available forwards by position
        all_forwards_by_rating = sorted(all_forwards, key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # First fill essential positions
        if not has_c and centers:
            for center in centers:
                if center not in pp1_forwards:
                    center_copy = copy.deepcopy(center)
                    center_copy['pp_position'] = 'C'
                    pp1_forwards.append(center_copy)
                    slots_needed -= 1
                    has_c = True
                    break
        
        if not has_lw and left_wings and slots_needed > 0:
            for lw in left_wings:
                if lw not in pp1_forwards:
                    lw_copy = copy.deepcopy(lw)
                    lw_copy['pp_position'] = 'LW'
                    pp1_forwards.append(lw_copy)
                    slots_needed -= 1
                    has_lw = True
                    break
        
        if not has_rw and right_wings and slots_needed > 0:
            for rw in right_wings:
                if rw not in pp1_forwards:
                    rw_copy = copy.deepcopy(rw)
                    rw_copy['pp_position'] = 'RW'
                    pp1_forwards.append(rw_copy)
                    slots_needed -= 1
                    has_rw = True
                    break
        
        # Fill any remaining slots with best available forwards
        for forward in all_forwards_by_rating:
            if forward not in pp1_forwards and slots_needed > 0:
                # Determine best position for them
                if not has_lw:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'LW'
                    pp1_forwards.append(forward_copy)
                    has_lw = True
                elif not has_c:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'C'
                    pp1_forwards.append(forward_copy)
                    has_c = True
                elif not has_rw:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'RW'
                    pp1_forwards.append(forward_copy)
                    has_rw = True
                else:
                    # Add as bumper/net-front (typically marked as C)
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'C'
                    pp1_forwards.append(forward_copy)
                
                slots_needed -= 1
                
            if slots_needed == 0:
                break
        
        # SECOND POWER PLAY UNIT
        pp2_forwards = []
        pp2_defense = []
        
        # Get players used in PP1
        pp1_ids = [p.get('id') for p in pp1_forwards + pp1_defense if p.get('id')]
        
        # Use 3F-2D format for PP2 (common in NHL)
        
        # Add defensemen
        remaining_offensive_dmen = [d for d in offensive_dmen if d.get('id') not in pp1_ids]
        remaining_defensemen = [d for d in all_defensemen if d.get('id') not in pp1_ids]
        
        # Add one or two defensemen depending on remaining talent
        if len(remaining_offensive_dmen) >= 2:
            pp2_defense = remaining_offensive_dmen[:2]
        elif remaining_offensive_dmen:
            pp2_defense.append(remaining_offensive_dmen[0])
            if remaining_defensemen:
                pp2_defense.append(remaining_defensemen[0])
        elif len(remaining_defensemen) >= 2:
            pp2_defense = remaining_defensemen[:2]
        elif remaining_defensemen:
            pp2_defense.append(remaining_defensemen[0])
        
        # Get remaining players not used in PP1
        remaining_snipers = [p for p in snipers if p.get('id') not in pp1_ids]
        remaining_playmakers = [p for p in playmakers if p.get('id') not in pp1_ids]
        remaining_forwards = [p for p in all_forwards if p.get('id') not in pp1_ids]
        
        # Again, place shooters on off-wings when possible
        for sniper in remaining_snipers[:1]:  # Get top remaining sniper
            shooting_hand = sniper.get('shoots', 'L')
            if shooting_hand == 'R':
                # Right-hand shot to LW for one-timers
                sniper_copy = copy.deepcopy(sniper)
                sniper_copy['pp_position'] = 'LW'
                pp2_forwards.append(sniper_copy)
            elif shooting_hand == 'L':
                # Left-hand shot to RW for one-timers
                sniper_copy = copy.deepcopy(sniper)
                sniper_copy['pp_position'] = 'RW'
                pp2_forwards.append(sniper_copy)
        
        # Add best remaining playmaker at C
        if remaining_playmakers and len([p for p in pp2_forwards if p.get('pp_position') == 'C']) == 0:
            playmaker_copy = copy.deepcopy(remaining_playmakers[0])
            playmaker_copy['pp_position'] = 'C'
            pp2_forwards.append(playmaker_copy)
        
        # Fill positions similar to PP1
        slots_needed = 3 - len(pp2_forwards)  # 3 forwards for 3F-2D
        
        # Check which positions we need to fill
        has_lw = any(p.get('pp_position') == 'LW' for p in pp2_forwards)
        has_c = any(p.get('pp_position') == 'C' for p in pp2_forwards)
        has_rw = any(p.get('pp_position') == 'RW' for p in pp2_forwards)
        
        # Add best available remaining forwards by position
        remaining_forwards_by_rating = sorted(remaining_forwards, key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Fill remaining positions
        for forward in remaining_forwards_by_rating:
            if forward not in pp2_forwards and slots_needed > 0:
                pp2_ids = [p.get('id') for p in pp2_forwards if p.get('id')]
                if forward.get('id') in pp2_ids:
                    continue
                    
                if not has_c:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'C'
                    pp2_forwards.append(forward_copy)
                    has_c = True
                elif not has_lw:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'LW'
                    pp2_forwards.append(forward_copy)
                    has_lw = True
                elif not has_rw:
                    forward_copy = copy.deepcopy(forward)
                    forward_copy['pp_position'] = 'RW'
                    pp2_forwards.append(forward_copy)
                    has_rw = True
                
                slots_needed -= 1
                
            if slots_needed == 0:
                break
        
        # Update power play units in the lines
        refined_lines['power_play_1'] = {
            'forwards': pp1_forwards,
            'defense': pp1_defense
        }
        
        refined_lines['power_play_2'] = {
            'forwards': pp2_forwards,
            'defense': pp2_defense
        }
        
        return refined_lines
    
    def _refine_penalty_kill_units(self, lines: Dict[str, Any], all_forwards: List[Dict], all_defensemen: List[Dict]) -> Dict[str, Any]:
        """
        Refine penalty kill units based on realistic NHL deployment.
        
        Args:
            lines: Dictionary with line combinations
            all_forwards: List of all forwards
            all_defensemen: List of all defensemen
            
        Returns:
            Dictionary with refined penalty kill units
        """
        refined_lines = copy.deepcopy(lines)
        
        # Get players by specialties for PK
        two_way_forwards = [p for p in all_forwards if p.get('player_type') in ['2 Way', '2 Way Forward']]
        defensive_forwards = [p for p in all_forwards if 'defense' in p and p.get('defense', 0) >= 80]
        defensive_dmen = [p for p in all_defensemen if p.get('player_type') in ['Defensive Def.', '2 Way Def.']]
        
        # Group players by position
        centers = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) == 'C']
        wingers = [p for p in all_forwards if p.get('position_primary', p.get('position', '')) in ['LW', 'RW']]
        
        # Sort by defensive ability if available, otherwise by rating
        if any('defense' in p for p in centers):
            pk_centers = sorted(centers, key=lambda p: p.get('defense', p.get('overall_rating', 0)), reverse=True)
        else:
            # Prioritize two-way centers
            pk_centers = [c for c in centers if c.get('player_type') in ['2 Way', '2 Way Forward']]
            pk_centers.extend([c for c in centers if c not in pk_centers])
            pk_centers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        if any('defense' in p for p in wingers):
            pk_wingers = sorted(wingers, key=lambda p: p.get('defense', p.get('overall_rating', 0)), reverse=True)
        else:
            # Prioritize two-way wingers
            pk_wingers = [w for w in wingers if w.get('player_type') in ['2 Way', '2 Way Forward']]
            pk_wingers.extend([w for w in wingers if w not in pk_wingers])
            pk_wingers.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # Sort defensemen by defensive ability
        if any('defense' in p for p in all_defensemen):
            pk_defensemen = sorted(all_defensemen, key=lambda p: p.get('defense', p.get('overall_rating', 0)), reverse=True)
        else:
            # Prioritize defensive defensemen
            pk_defensemen = defensive_dmen + [d for d in all_defensemen if d not in defensive_dmen]
            pk_defensemen.sort(key=lambda p: p.get('overall_rating', 0), reverse=True)
        
        # FIRST PENALTY KILL UNIT
        pk1_forwards = []
        pk1_defense = []
        
        # Add best PK center
        if pk_centers:
            center_copy = copy.deepcopy(pk_centers[0])
            center_copy['pk_position'] = 'C'
            pk1_forwards.append(center_copy)
        
        # Add best PK winger
        if pk_wingers:
            winger_copy = copy.deepcopy(pk_wingers[0])
            winger_copy['pk_position'] = 'W'
            pk1_forwards.append(winger_copy)
        
        # Add best defensemen
        pk1_defense = pk_defensemen[:2] if len(pk_defensemen) >= 2 else pk_defensemen
        
        # SECOND PENALTY KILL UNIT
        pk2_forwards = []
        pk2_defense = []
        
        # Get players used in PK1
        pk1_ids = [p.get('id') for p in pk1_forwards + pk1_defense if p.get('id')]
        
        # Add second best PK center
        remaining_centers = [c for c in pk_centers if c.get('id') not in pk1_ids]
        if remaining_centers:
            center_copy = copy.deepcopy(remaining_centers[0])
            center_copy['pk_position'] = 'C'
            pk2_forwards.append(center_copy)
        elif pk_centers:  # Reuse the first center if we don't have enough
            center_copy = copy.deepcopy(pk_centers[0])
            center_copy['pk_position'] = 'C'
            pk2_forwards.append(center_copy)
        
        # Add second best PK winger
        remaining_wingers = [w for w in pk_wingers if w.get('id') not in pk1_ids]
        if remaining_wingers:
            winger_copy = copy.deepcopy(remaining_wingers[0])
            winger_copy['pk_position'] = 'W'
            pk2_forwards.append(winger_copy)
        elif pk_wingers:  # Reuse the first winger if we don't have enough
            winger_copy = copy.deepcopy(pk_wingers[0])
            winger_copy['pk_position'] = 'W'
            pk2_forwards.append(winger_copy)
        
        # For defense, typical NHL approach is either different pairs or mix top with others
        remaining_defensemen = [d for d in pk_defensemen if d.get('id') not in pk1_ids]
        defensive_depth = len(pk_defensemen)
        
        if len(remaining_defensemen) >= 2:
            # Use completely different pair if we have the depth
            pk2_defense = remaining_defensemen[:2]
        elif remaining_defensemen and defensive_depth >= 3:
            # Mix top defenseman with next best
            pk2_defense = [pk_defensemen[0], remaining_defensemen[0]]
        else:
            # Reuse the same top pair if limited options
            pk2_defense = pk_defensemen[:2] if len(pk_defensemen) >= 2 else pk_defensemen
        
        # Update penalty kill units in the lines
        refined_lines['penalty_kill_1'] = {
            'forwards': pk1_forwards,
            'defense': pk1_defense
        }
        
        refined_lines['penalty_kill_2'] = {
            'forwards': pk2_forwards,
            'defense': pk2_defense
        }
        
        return refined_lines
    
    def _calculate_all_chemistry(self, lines: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate chemistry values for all lines and pairs.
        
        Args:
            lines: Dictionary with line combinations
            
        Returns:
            Dictionary with chemistry values for each line/pair
        """
        chemistry = {
            'forward_lines': [],
            'defense_pairs': [],
            'power_play': [],
            'penalty_kill': [],
            'overall': 0.0
        }
        
        # Calculate forward line chemistry
        forward_chemistry_sum = 0
        for i, line in enumerate(lines.get('forward_lines', [])):
            # Skip empty lines
            if 'Empty' in [line.get('LW'), line.get('C'), line.get('RW')]:
                chemistry['forward_lines'].append(0)
                continue
                
            # Get player list in consistent format for calculator
            players = [line.get('LW'), line.get('C'), line.get('RW')]
            
            # Calculate chemistry
            line_chem, factors = self.chemistry_calculator.calculate_forward_line_chemistry(players)
            
            # Store with line number
            chemistry['forward_lines'].append({
                'line': i + 1,
                'chemistry': line_chem,
                'factors': factors
            })
            
            forward_chemistry_sum += line_chem
        
        # Calculate defense pair chemistry
        defense_chemistry_sum = 0
        for i, pair in enumerate(lines.get('defense_pairs', [])):
            # Skip empty pairs
            if 'Empty' in [pair.get('LD'), pair.get('RD')]:
                chemistry['defense_pairs'].append(0)
                continue
                
            # Get player list in consistent format for calculator
            players = [pair.get('LD'), pair.get('RD')]
            
            # Calculate chemistry
            pair_chem, factors = self.chemistry_calculator.calculate_defense_pair_chemistry(players)
            
            # Store with pair number
            chemistry['defense_pairs'].append({
                'pair': i + 1,
                'chemistry': pair_chem,
                'factors': factors
            })
            
            defense_chemistry_sum += pair_chem
            
        # Calculate power play unit chemistry
        pp_chemistry_sum = 0
        for i, unit_name in enumerate(['power_play_1', 'power_play_2']):
            unit = lines.get(unit_name, {})
            
            # Calculate chemistry
            unit_chem, factors = self.chemistry_calculator.calculate_pp_unit_chemistry(unit)
            
            # Store with unit number
            chemistry['power_play'].append({
                'unit': i + 1,
                'chemistry': unit_chem,
                'factors': factors
            })
            
            pp_chemistry_sum += unit_chem
            
        # Calculate penalty kill unit chemistry
        pk_chemistry_sum = 0
        for i, unit_name in enumerate(['penalty_kill_1', 'penalty_kill_2']):
            unit = lines.get(unit_name, {})
            
            # Calculate chemistry
            unit_chem, factors = self.chemistry_calculator.calculate_pk_unit_chemistry(unit)
            
            # Store with unit number
            chemistry['penalty_kill'].append({
                'unit': i + 1,
                'chemistry': unit_chem,
                'factors': factors
            })
            
            pk_chemistry_sum += unit_chem
            
        # Calculate overall team chemistry (weighted average)
        num_forward_lines = len([l for l in chemistry['forward_lines'] if l != 0])
        num_defense_pairs = len([p for p in chemistry['defense_pairs'] if p != 0])
        num_pp_units = len(chemistry['power_play'])
        num_pk_units = len(chemistry['penalty_kill'])
        
        # Weight factors based on importance
        fw_weight = 0.4  # 40% from forward lines
        d_weight = 0.3   # 30% from defense pairs
        pp_weight = 0.15 # 15% from power play
        pk_weight = 0.15 # 15% from penalty kill
        
        # Calculate weighted average, avoiding division by zero
        weighted_sum = 0
        total_weight = 0
        
        if num_forward_lines > 0:
            weighted_sum += (forward_chemistry_sum / num_forward_lines) * fw_weight
            total_weight += fw_weight
            
        if num_defense_pairs > 0:
            weighted_sum += (defense_chemistry_sum / num_defense_pairs) * d_weight
            total_weight += d_weight
            
        if num_pp_units > 0:
            weighted_sum += (pp_chemistry_sum / num_pp_units) * pp_weight
            total_weight += pp_weight
            
        if num_pk_units > 0:
            weighted_sum += (pk_chemistry_sum / num_pk_units) * pk_weight
            total_weight += pk_weight
            
        # Calculate overall chemistry if we have any components
        if total_weight > 0:
            chemistry['overall'] = weighted_sum / total_weight
        
        return chemistry
    
    def _optimize_lines_by_chemistry(self, lines: Dict[str, Any], chemistry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize line combinations based on chemistry values.
        This may rearrange players to maximize chemistry.
        
        Args:
            lines: Current line combinations
            chemistry: Current chemistry values
            
        Returns:
            Optimized line combinations
        """
        # For the initial implementation, we'll make minor adjustments
        # In a more advanced version, this could use combinatorial optimization
        
        # Create a copy to avoid modifying the original
        optimized = copy.deepcopy(lines)
        
        # Example: If a forward line has negative chemistry, try swapping wingers
        for i, line_chem in enumerate(chemistry.get('forward_lines', [])):
            # Skip empty lines or lines with good chemistry
            if isinstance(line_chem, int) or line_chem.get('chemistry', 0) >= 0:
                continue
                
            # Try swapping wingers to improve chemistry
            if i < len(optimized['forward_lines']):
                line = optimized['forward_lines'][i]
                # Swap LW and RW
                line['LW'], line['RW'] = line['RW'], line['LW']
                
                # Check if chemistry improved (would require recalculation)
                # For simplicity, we'll just assume it might help
                
        # More advanced optimization would go here
        # This could involve trying different player combinations
        # and keeping the ones with the best chemistry
        
        return optimized
    
    def _calculate_team_rating(self, lines: Dict[str, Any]) -> Dict[str, float]:
        """
        Calculate the team's overall rating, incorporating chemistry and coach bonuses.
        
        Args:
            lines: The line combinations to evaluate
            
        Returns:
            Dictionary with team rating metrics
        """
        # First get the base team rating from the line optimizer
        base_rating = self.line_optimizer.calculate_team_overall_rating()
        
        # Apply chemistry bonuses/penalties
        chemistry_adjusted = self._apply_chemistry_to_rating(base_rating)
        
        # Apply coach bonuses if a coach is assigned
        if self.coach_strategy:
            coach_adjusted = self._apply_coach_to_rating(chemistry_adjusted)
        else:
            coach_adjusted = chemistry_adjusted
            
        return coach_adjusted
    
    def _apply_chemistry_to_rating(self, rating: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply chemistry bonuses/penalties to team ratings.
        
        Args:
            rating: Base team rating dictionary
            
        Returns:
            Chemistry-adjusted team rating
        """
        # Create a copy to avoid modifying the original
        adjusted = copy.deepcopy(rating)
        
        # Calculate the average team chemistry
        avg_chemistry = 0
        if self.chemistry_cache and 'overall' in self.chemistry_cache:
            avg_chemistry = self.chemistry_cache['overall']
        
        # Apply a chemistry bonus/penalty to the overall team rating
        # Chemistry ranges from -5 to +5, so we'll apply a ±5% adjustment
        chemistry_multiplier = 1.0 + (avg_chemistry / 100)
        
        # Apply to overall rating
        adjusted['overall'] = adjusted['overall'] * chemistry_multiplier
        
        # Apply to component ratings (offense, defense, etc.)
        for key in ['offense', 'defense', 'special_teams']:
            if key in adjusted:
                adjusted[key] = adjusted[key] * chemistry_multiplier
                
        return adjusted
    
    def _apply_coach_to_rating(self, rating: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply coach bonuses to team ratings.
        
        Args:
            rating: Team rating dictionary
            
        Returns:
            Coach-adjusted team rating
        """
        # Create a copy to avoid modifying the original
        adjusted = copy.deepcopy(rating)
        
        # Apply a small coach bonus (1-3%)
        coach_bonus = 1.01  # Default 1% bonus
        
        # Apply coach bonus to overall rating
        adjusted['overall'] = adjusted['overall'] * coach_bonus
        
        # Apply specific bonuses based on coach strategy type
        strategy_type = self.coach_strategy.strategy_type
        
        if strategy_type == 'Offensive':
            # Offensive coaches provide extra boost to offense
            adjusted['offense'] = adjusted['offense'] * (coach_bonus + 0.02)
            
        elif strategy_type == 'Defensive':
            # Defensive coaches provide extra boost to defense
            adjusted['defense'] = adjusted['defense'] * (coach_bonus + 0.02)
        
        # Special teams bonuses would go here in a full implementation
            
        return adjusted
    
    def get_optimal_lines(self) -> Dict[str, Any]:
        """
        Get the current optimal lines.
        If none exist, they will be generated.
        
        Returns:
            Dictionary with optimal line combinations
        """
        if not self.optimal_lines:
            return self.generate_optimal_lines()
        return {
            'lines': self.optimal_lines,
            'chemistry': self.chemistry_cache,
            'team_rating': self.team_rating
        }
    
    def update_current_lines(self, lines: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update the current line combinations with user changes.
        
        Args:
            lines: New line combinations
            
        Returns:
            Updated line data with chemistry calculations
        """
        # Store the new lines
        self.current_lines = lines
        
        # Calculate chemistry for the new lines
        line_chemistry = self._calculate_all_chemistry(lines)
        self.chemistry_cache = line_chemistry
        
        # Calculate team rating with the new lines
        self.team_rating = self._calculate_team_rating(lines)
        
        return {
            'lines': self.current_lines,
            'chemistry': line_chemistry,
            'team_rating': self.team_rating
        }
    
    def simulate_game_effects(self, minutes_played: Dict[str, float]) -> None:
        """
        Simulate the effects of playing a game on chemistry.
        Updates the time played together for the current lines.
        
        Args:
            minutes_played: Dictionary with minutes played for each line/pair
        """
        # Update time played for forward lines
        for i, line in enumerate(self.current_lines.get('forward_lines', [])):
            line_key = f'line{i+1}'
            if line_key in minutes_played:
                players = [line.get('LW'), line.get('C'), line.get('RW')]
                self.chemistry_calculator.update_time_played(players, minutes_played[line_key])
                
        # Update time played for defense pairs
        for i, pair in enumerate(self.current_lines.get('defense_pairs', [])):
            pair_key = f'pair{i+1}'
            if pair_key in minutes_played:
                players = [pair.get('LD'), pair.get('RD')]
                self.chemistry_calculator.update_time_played(players, minutes_played[pair_key])
                
        # Update special teams units
        for unit_key in ['pp1', 'pp2', 'pk1', 'pk2']:
            if unit_key in minutes_played:
                if unit_key.startswith('pp'):
                    unit_idx = int(unit_key[-1]) - 1
                    if unit_idx < 2:
                        unit_name = f'power_play_{unit_idx+1}'
                        unit = self.current_lines.get(unit_name, {})
                        forwards = unit.get('forwards', [])
                        defense = unit.get('defense', [])
                        self.chemistry_calculator.update_time_played(forwards, minutes_played[unit_key])
                        self.chemistry_calculator.update_time_played(defense, minutes_played[unit_key])
                elif unit_key.startswith('pk'):
                    unit_idx = int(unit_key[-1]) - 1
                    if unit_idx < 2:
                        unit_name = f'penalty_kill_{unit_idx+1}'
                        unit = self.current_lines.get(unit_name, {})
                        forwards = unit.get('forwards', [])
                        defense = unit.get('defense', [])
                        self.chemistry_calculator.update_time_played(forwards, minutes_played[unit_key])
                        self.chemistry_calculator.update_time_played(defense, minutes_played[unit_key])
                        
        # Recalculate chemistry after updating time played
        self.chemistry_cache = self._calculate_all_chemistry(self.current_lines)
        
    def get_line_deployment(self, situation: str, opponent_coach=None) -> Dict[str, float]:
        """
        Get line deployment recommendations based on game situation and coach preferences.
        
        Args:
            situation: Game situation (e.g., 'leading', 'trailing', 'tied')
            opponent_coach: Optional opponent coach for matchup calculations
            
        Returns:
            Dictionary with ice time percentages for each line
        """
        if not self.coach_strategy:
            # Default even deployment if no coach
            return {
                'line1': 0.25, 'line2': 0.25, 'line3': 0.25, 'line4': 0.25,
                'pair1': 0.33, 'pair2': 0.33, 'pair3': 0.33
            }
            
        # Get base line weights from coach preferences
        base_weights = self.coach_strategy.get_line_weights()
        
        # Adjust based on game situation
        situational_adjustments = self.coach_strategy.get_situational_adjustment(situation)
        
        # Apply adjustments to base weights
        deployment = {}
        forward_total = 0
        defense_total = 0
        
        # Apply adjustments to forward lines
        for i in range(1, 5):
            line_key = f'line{i}'
            weight_key = f'first_line' if i == 1 else f'second_line' if i == 2 else f'third_line' if i == 3 else 'fourth_line'
            if weight_key in base_weights and line_key in situational_adjustments:
                deployment[line_key] = base_weights[weight_key] * situational_adjustments[line_key]
                forward_total += deployment[line_key]
                
        # Apply adjustments to defense pairs
        for i in range(1, 4):
            pair_key = f'pair{i}'
            weight_key = f'first_pair' if i == 1 else f'second_pair' if i == 2 else 'third_pair'
            if weight_key in base_weights and pair_key in situational_adjustments:
                deployment[pair_key] = base_weights[weight_key] * situational_adjustments[pair_key]
                defense_total += deployment[pair_key]
        
        # Normalize to ensure percentages sum to 1
        if forward_total > 0:
            for i in range(1, 5):
                line_key = f'line{i}'
                if line_key in deployment:
                    deployment[line_key] /= forward_total
                    
        if defense_total > 0:
            for i in range(1, 4):
                pair_key = f'pair{i}'
                if pair_key in deployment:
                    deployment[pair_key] /= defense_total
                    
        # Include special teams deployment directly from coach weights
        for key in ['pp1', 'pp2', 'pk1', 'pk2']:
            if key in base_weights:
                deployment[key] = base_weights[key]
                
        return deployment
    
    def get_matchup_recommendations(self, opponent_lines: Dict[str, Any], is_home_team: bool) -> Dict[str, Any]:
        """
        Get line matchup recommendations against an opponent's lines.
        
        Args:
            opponent_lines: The opponent's line combinations
            is_home_team: Whether this team is the home team (for last change advantage)
            
        Returns:
            Dictionary with matchup recommendations
        """
        if not self.coach_strategy:
            # Default balanced matchups if no coach
            return {
                'forward_matchups': {},
                'defense_matchups': {}
            }
            
        # Get matchup recommendations from coach strategy
        return self.coach_strategy.optimize_matchups(
            self.current_lines or self.optimal_lines,
            opponent_lines,
            is_home_team
        )
    
    def save_line_preset(self, preset_name: str = "Default") -> bool:
        """
        Save the current line combinations as a preset.
        
        Args:
            preset_name: Name to give the preset
            
        Returns:
            Boolean indicating success
        """
        return self.line_optimizer.save_line_preset(preset_name)
    
    def load_line_preset(self, preset_name: str = "Default") -> bool:
        """
        Load a saved line preset.
        
        Args:
            preset_name: Name of the preset to load
            
        Returns:
            Boolean indicating success
        """
        success = self.line_optimizer.load_line_preset(preset_name)
        if success:
            # Update current lines with the loaded preset
            self.current_lines = self.line_optimizer.lines
            # Recalculate chemistry
            self.chemistry_cache = self._calculate_all_chemistry(self.current_lines)
            # Recalculate team rating
            self.team_rating = self._calculate_team_rating(self.current_lines)
        return success
        
    async def save_team_overall_to_database(self) -> bool:
        """
        Save the team's overall rating to the database.
        This combines player ratings and chemistry to create a single team overall rating.
        
        Returns:
            Boolean indicating success
        """
        from supabase import create_client, Client
        import os

        # Initialize Supabase client
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        supabase: Client = create_client(url, key)
        
        # Get the latest team rating
        if not self.team_rating:
            self.team_rating = self._calculate_team_rating(self.current_lines)
            
        # Extract the overall rating
        overall_rating = round(self.team_rating.get('overall', 0), 1)
        
        # Update the team record
        try:
            response = await supabase.table('Team').update({"overall": overall_rating}).eq("abbreviation", self.team_abbreviation).execute()
            
            if response.error:
                print(f"Error updating team overall: {response.error}")
                return False
                
            print(f"Successfully updated overall rating for {self.team_abbreviation} to {overall_rating}")
            return True
            
        except Exception as e:
            print(f"Exception updating team overall: {e}")
            return False 