#!/usr/bin/env python3
"""
Test script for trade value calculations.
Run this file from the backend directory: python3 test_trade_value.py
"""

import json
from app.services.value_trade import (
    calculate_player_trade_value,
    evaluate_trade,
    visualize_trade_balance
)


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


if __name__ == "__main__":
    main() 