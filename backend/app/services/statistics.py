from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

# Create a blueprint for statistics endpoints
stats_bp = Blueprint('stats', __name__)

class StatisticsService:
    """
    Service for managing player and team statistics.
    """
    
    @staticmethod
    def get_player_stats(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Get player statistics with optional filtering.
        
        Args:
            filters: Optional dictionary of filter parameters
            
        Returns:
            List of player statistics as dictionaries
        """
        # This is a placeholder implementation - update when PlayerStats model is implemented
        # In a real implementation, this would query the database
        player_stats = [
            {
                "id": 1,
                "player_id": 101,
                "player_name": "John Smith",
                "team": "TOR",
                "games_played": 82,
                "goals": 42,
                "assists": 56,
                "points": 98,
                "plus_minus": 24,
                "penalty_minutes": 38,
                "shots": 245,
                "shooting_percentage": 17.1,
                "ice_time": 1230, # in minutes
                "season": "2023-2024"
            },
            {
                "id": 2,
                "player_id": 102,
                "player_name": "Mike Johnson",
                "team": "BOS",
                "games_played": 78,
                "goals": 35,
                "assists": 45,
                "points": 80,
                "plus_minus": 18,
                "penalty_minutes": 42,
                "shots": 210,
                "shooting_percentage": 16.7,
                "ice_time": 1180, # in minutes
                "season": "2023-2024"
            },
            {
                "id": 3,
                "player_id": 103,
                "player_name": "David Williams",
                "team": "MTL",
                "games_played": 80,
                "goals": 28,
                "assists": 48,
                "points": 76,
                "plus_minus": 15,
                "penalty_minutes": 24,
                "shots": 195,
                "shooting_percentage": 14.4,
                "ice_time": 1150, # in minutes
                "season": "2023-2024"
            }
        ]
        
        # Apply filters if provided
        if filters:
            for key, value in filters.items():
                player_stats = [stat for stat in player_stats if str(stat.get(key)) == str(value)]
                
        return player_stats
    
    @staticmethod
    def get_team_stats(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Get team statistics with optional filtering.
        
        Args:
            filters: Optional dictionary of filter parameters
            
        Returns:
            List of team statistics as dictionaries
        """
        # This is a placeholder implementation - update when TeamStats model is implemented
        # In a real implementation, this would query the database
        team_stats = [
            {
                "id": 1,
                "team": "TOR",
                "games_played": 82,
                "wins": 52,
                "losses": 20,
                "ot_losses": 10,
                "points": 114,
                "goals_for": 280,
                "goals_against": 230,
                "pp_percentage": 24.5,
                "pk_percentage": 82.3,
                "shots_for": 2800,
                "shots_against": 2450,
                "season": "2023-2024"
            },
            {
                "id": 2,
                "team": "BOS",
                "games_played": 82,
                "wins": 48,
                "losses": 24,
                "ot_losses": 10,
                "points": 106,
                "goals_for": 265,
                "goals_against": 225,
                "pp_percentage": 23.8,
                "pk_percentage": 83.5,
                "shots_for": 2750,
                "shots_against": 2400,
                "season": "2023-2024"
            },
            {
                "id": 3,
                "team": "MTL",
                "games_played": 82,
                "wins": 35,
                "losses": 37,
                "ot_losses": 10,
                "points": 80,
                "goals_for": 240,
                "goals_against": 260,
                "pp_percentage": 20.5,
                "pk_percentage": 79.8,
                "shots_for": 2600,
                "shots_against": 2700,
                "season": "2023-2024"
            }
        ]
        
        # Apply filters if provided
        if filters:
            for key, value in filters.items():
                team_stats = [stat for stat in team_stats if str(stat.get(key)) == str(value)]
                
        return team_stats


# API endpoints that utilize the service

@stats_bp.route('/players', methods=['GET'])
def get_player_stats():
    """Get player statistics"""
    # Get filters from request args
    filters = request.args.to_dict() if request.args else None
    player_stats = StatisticsService.get_player_stats(filters)
    return jsonify(player_stats), 200


@stats_bp.route('/teams', methods=['GET'])
def get_team_stats():
    """Get team statistics"""
    # Get filters from request args
    filters = request.args.to_dict() if request.args else None
    team_stats = StatisticsService.get_team_stats(filters)
    return jsonify(team_stats), 200
