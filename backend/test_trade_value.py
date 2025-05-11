#!/usr/bin/env python3
"""
Test script for trade value calculations.
Run this file from the backend directory: python3 test_trade_value.py
"""

import json
from app.services.value_trade import (
    calculate_player_trade_value,
    calculate_draft_pick_value,
    evaluate_trade,
    visualize_trade_balance,
    apply_quality_adjustment
)
import unittest


def main():
    """Run trade value examples and print results."""
    print("NHL TRADE VALUE CALCULATOR TEST\n" + "=" * 30)
    
    # Example player values
    print("\n1. INDIVIDUAL PLAYER VALUES")
    print("-" * 30)
    
    # Example: Connor McDavid (Established superstar)
    mcdavid_value = calculate_player_trade_value(
        overall=97,
        age=28,
        position="Center",
        contract_type="UFA",
        term_years=8,
        aav_millions=12.5,
        potential="Generational",
        potential_certainty=0.95,
        potential_volatility=0.1,
        is_captain=True,
        is_alternate=False,
        stanley_cups=0,
        has_major_awards=True
    )
    
    # Example: Nick Suzuki (Young captain with long-term deal)
    suzuki_value = calculate_player_trade_value(
        overall=90,
        age=26,
        position="Center",
        contract_type="UFA",
        term_years=5,
        aav_millions=7.875,
        potential="Elite",
        potential_certainty=0.8,
        potential_volatility=0.2,
        is_captain=True,
        is_alternate=False,
        stanley_cups=0,
        has_major_awards=False
    )
    
    # Example: Andrei Vasilevskiy (Elite goalie with cups)
    vasilevskiy_value = calculate_player_trade_value(
        overall=91,
        age=31,
        position="Goaltender",
        contract_type="UFA",
        term_years=3,
        aav_millions=9.5,
        potential="Elite",
        potential_certainty=0.9,
        potential_volatility=0.2,
        is_captain=False,
        is_alternate=False,
        stanley_cups=2,
        has_major_awards=True
    )
    
    # Example: Tyler Toffoli (Veteran winger)
    toffoli_value = calculate_player_trade_value(
        overall=85,
        age=33,
        position="Winger",
        contract_type="UFA",
        term_years=3,
        aav_millions=6.0,
        potential="Top6",
        potential_certainty=0.9,
        potential_volatility=0.2,
        is_captain=False,
        is_alternate=False,
        stanley_cups=0,
        has_major_awards=False
    )
    
    # Example: Young prospect example
    prospect_value = calculate_player_trade_value(
        overall=78,
        age=19,
        position="Winger",
        contract_type="Unsigned",
        term_years=3,
        aav_millions=0.9,
        potential="Elite",
        potential_certainty=0.6,
        potential_volatility=0.3,
        is_captain=False,
        is_alternate=False,
        stanley_cups=0,
        has_major_awards=False
    )
    
    print(f"Connor McDavid:    {mcdavid_value:.1f}")
    print(f"Nick Suzuki:       {suzuki_value:.1f}")
    print(f"Andrei Vasilevskiy: {vasilevskiy_value:.1f}")
    print(f"Tyler Toffoli:     {toffoli_value:.1f}")
    print(f"Young Prospect:    {prospect_value:.1f}")
    
    # Example trade: McDavid for Suzuki + Toffoli + Prospect
    print("\n2. TRADE EVALUATION")
    print("-" * 30)
    
    team1_players = [
        {
            "name": "Connor McDavid",
            "overall": 97,
            "age": 28,
            "position": "Center",
            "contract_type": "UFA",
            "term_years": 5,
            "aav_millions": 12.5,
            "potential": "Generational",
            "potential_certainty": 0.9,
            "potential_volatility": 0.1,
            "is_captain": False,
            "is_alternate": True,
            "stanley_cups": 0,
            "has_major_awards": True
        }
    ]
    
    team2_players = [
        {
            "name": "Nick Suzuki",
            "overall": 90,
            "age": 26,
            "position": "Center",
            "contract_type": "UFA",
            "term_years": 5,
            "aav_millions": 7.875,
            "potential": "Elite",
            "potential_certainty": 0.8,
            "potential_volatility": 0.2,
            "is_captain": True,
            "is_alternate": False,
            "stanley_cups": 0,
            "has_major_awards": False
        },
        {
            "name": "Tyler Toffoli",
            "overall": 85,
            "age": 33,
            "position": "Winger",
            "contract_type": "UFA",
            "term_years": 3,
            "aav_millions": 6.0,
            "potential": "Top6",
            "potential_certainty": 0.9,
            "potential_volatility": 0.2,
            "is_captain": False,
            "is_alternate": False,
            "stanley_cups": 0,
            "has_major_awards": False
        },
        {
            "name": "Young Prospect",
            "overall": 83,
            "age": 22,
            "position": "Center",
            "contract_type": "Unsigned",
            "term_years": 3,
            "aav_millions": 0.9,
            "potential": "Elite",
            "potential_certainty": 0.6,
            "potential_volatility": 0.3,
            "is_captain": False,
            "is_alternate": False,
            "stanley_cups": 0,
            "has_major_awards": False
        }
    ]
    
    trade_result = evaluate_trade(team1_players, team2_players)
    
    # Pretty print the trade evaluation
    print("Team 1:")
    print(f"  Total Value: {trade_result['team1']['raw_value']}")
    print(f"  Adjusted Value: {trade_result['team1']['adjusted_value']} (quality adjustment applied)")
    print("  Players:")
    for player in trade_result['team1']['players_values']:
        print(f"    - {player['name']}: {player['value']}")
    
    print("\nTeam 2:")
    print(f"  Total Value: {trade_result['team2']['raw_value']}")
    print(f"  Adjusted Value: {trade_result['team2']['adjusted_value']} (quality adjustment applied)")
    print("  Players:")
    for player in trade_result['team2']['players_values']:
        print(f"    - {player['name']}: {player['value']}")
    
    print("\nTrade Assessment:")
    print(f"  Fairness: {trade_result['trade_assessment']['fairness']}")
    print(f"  Value Difference: {trade_result['trade_assessment']['raw_difference']} (adjusted)")
    print(f"  Better Deal For: {trade_result['trade_assessment']['better_deal_for']}")
    
    # Visualization data
    print("\n3. TRADE BALANCE VISUALIZATION")
    print("-" * 30)
    viz_data = visualize_trade_balance(
        trade_result['team1']['raw_value'], 
        trade_result['team2']['raw_value']
    )
    
    print(f"Team 1: {viz_data['team1_percentage']}%")
    print(f"Team 2: {viz_data['team2_percentage']}%")
    print(f"Is Balanced: {viz_data['is_balanced']}")
    
    # Visualize with a simple ASCII bar
    bar_width = 50
    team1_chars = int(viz_data['team1_percentage'] * bar_width / 100)
    team2_chars = bar_width - team1_chars
    
    print("\nTrade Value Bar:")
    print("[" + "=" * team1_chars + "|" + "=" * team2_chars + "]")
    print(f"  Team 1: {viz_data['team1_percentage']}%   Team 2: {viz_data['team2_percentage']}%")


class TestTradeValue(unittest.TestCase):
    
    def test_player_value_calculation(self):
        """Test that player trade value calculations produce expected results"""
        # Test star player
        star_value = calculate_player_trade_value(
            overall=92,
            age=27,
            position="Center",
            contract_type="UFA",
            term_years=6,
            aav_millions=8.5,
            potential="elite",
            potential_certainty=0.9,
            potential_volatility=0.3,
            is_captain=True,
            stanley_cups=1
        )
        self.assertGreater(star_value, 50, "Star player should have high value")
        
        # Test prospect
        prospect_value = calculate_player_trade_value(
            overall=75,
            age=19,
            position="Wing",
            contract_type="ELC",
            term_years=3,
            aav_millions=0.9,
            potential="elite",
            potential_certainty=0.6,
            potential_volatility=0.7
        )
        self.assertGreater(prospect_value, 25, "Prospect should have decent value")
        
        # Test aging veteran
        veteran_value = calculate_player_trade_value(
            overall=83,
            age=37,
            position="Defense",
            contract_type="UFA",
            term_years=2,
            aav_millions=4.0,
            has_major_awards=True,
            stanley_cups=2
        )
        self.assertLess(veteran_value, 60, "Aging veteran should have moderate value")
        
    def test_draft_pick_value_calculation(self):
        """Test that draft pick value calculations produce expected results"""
        # Test 1st overall pick
        first_overall = calculate_draft_pick_value(
            round_num=1,
            pick_num=1,
            draft_strength="strong"
        )
        self.assertGreater(first_overall, 85, "1st overall pick should have very high value")
        
        # Test late 1st round pick
        late_first = calculate_draft_pick_value(
            round_num=1,
            pick_num=28,
            draft_strength="average"
        )
        self.assertLess(late_first, first_overall, "Late 1st round pick should be worth less than 1st overall")
        self.assertGreater(late_first, 50, "Late 1st round pick should still have good value")
        
        # Test 2nd round pick
        second_round = calculate_draft_pick_value(
            round_num=2,
            pick_num=33,
            draft_strength="weak"
        )
        self.assertLess(second_round, late_first, "2nd round pick should be worth less than 1st round")
        
        # Test future pick with time discount
        future_pick = calculate_draft_pick_value(
            round_num=1,
            projected_position=15,
            draft_strength="average",
            year=2027
        )
        current_pick = calculate_draft_pick_value(
            round_num=1,
            projected_position=15,
            draft_strength="average",
            year=2025
        )
        self.assertLess(future_pick, current_pick, "Future picks should be discounted")
        
        # Test different contexts
        no_context = calculate_draft_pick_value(
            round_num=1,
            projected_position=10,
            context="no_context"
        )
        in_season = calculate_draft_pick_value(
            round_num=1,
            projected_position=10,
            context="in_season"
        )
        franchise = calculate_draft_pick_value(
            round_num=1,
            projected_position=10,
            context="franchise"
        )
        self.assertGreater(no_context, in_season, "In-season projection should have uncertainty discount")
        self.assertGreater(in_season, franchise, "Franchise projection should have higher uncertainty discount")
    
    def test_two_way_trade(self):
        """Test a basic two-way trade evaluation"""
        team1_players = [
            {
                "name": "Connor McDavid",
                "overall": 97,
                "age": 26,
                "position": "Center"
            }
        ]
        
        team2_players = [
            {
                "name": "Leon Draisaitl",
                "overall": 94,
                "age": 27,
                "position": "Center"
            },
            {
                "name": "Evan Bouchard",
                "overall": 85,
                "age": 23,
                "position": "Defense"
            }
        ]
        
        result = evaluate_trade(team1_players, team2_players)
        
        self.assertIn("team1", result)
        self.assertIn("team2", result)
        self.assertIn("trade_assessment", result)
        
        # The McDavid trade should favor team2
        self.assertIn("better_deal_for", result["trade_assessment"])
        
    def test_three_way_trade(self):
        """Test a three-way trade evaluation with specific asset destinations"""
        team1_players = [
            {
                "id": "player1",
                "name": "Player One",
                "overall": 90,
                "age": 25,
                "position": "Center"
            }
        ]
        
        team2_players = [
            {
                "id": "player2",
                "name": "Player Two",
                "overall": 85,
                "age": 27,
                "position": "Wing"
            }
        ]
        
        team3_players = [
            {
                "id": "player3",
                "name": "Player Three",
                "overall": 82,
                "age": 24,
                "position": "Defense"
            }
        ]
        
        # Asset destinations: team1 player -> team3, team2 player -> team1, team3 player -> team2
        asset_destinations = {
            "player1-player": "team3",
            "player2-player": "team1",
            "player3-player": "team2"
        }
        
        result = evaluate_trade(
            team1_players, 
            team2_players,
            team3_players,
            is_three_way=True,
            asset_destinations=asset_destinations
        )
        
        self.assertIn("team1", result)
        self.assertIn("team2", result)
        self.assertIn("team3", result)
        self.assertIn("trade_assessment", result)
        
        # Check that net values reflect the correct destinations
        self.assertGreater(result["team1"]["incoming_value"], 0)
        self.assertGreater(result["team2"]["incoming_value"], 0)
        self.assertGreater(result["team3"]["incoming_value"], 0)
        
    def test_trade_with_draft_picks(self):
        """Test a trade evaluation including draft picks"""
        team1_players = [
            {
                "name": "Star Player",
                "overall": 88,
                "age": 28,
                "position": "Wing"
            }
        ]
        
        team2_players = [
            {
                "name": "Good Player",
                "overall": 84,
                "age": 25,
                "position": "Defense"
            }
        ]
        
        # Team 2 adds a 1st round pick to the deal
        team2_picks = [
            {
                "id": "pick1",
                "year": 2025,
                "round": 1,
                "projected_position": 15,
                "draft_strength": "average"
            }
        ]
        
        result = evaluate_trade(
            team1_players, 
            team2_players,
            team1_picks=[],
            team2_picks=team2_picks
        )
        
        # Team 2 value should include the draft pick
        self.assertGreater(result["team2"]["raw_value"], 
                           sum(p["value"] for p in result["team2"]["players_values"] if "Good Player" in p["name"]),
                           "Team 2 value should include draft pick")
        
        # Draft pick should appear in the players_values list
        pick_values = [p for p in result["team2"]["players_values"] if "Round" in p["name"]]
        self.assertGreaterEqual(len(pick_values), 1, "Draft pick should be included in value list")


if __name__ == "__main__":
    unittest.main() 