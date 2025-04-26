"""
This module contains service classes that implement the core business logic of the application.
"""

from .draft import draft_engine
from . import calendar, player
# Remove these imports to avoid circular dependency
# from .lines import LineOptimizer
# from .team_formation import TeamFormation
from .chemistry import ChemistryCalculator
from .coach import CoachStrategy

from flask import Blueprint, current_app

# Create a function to register all service blueprints
def register_service_blueprints(app):
    # Import all services with blueprints
    from . import contract_manager, lines, statistics
    from . import team_formation, chemistry, coach, game_simulation, team_service
    from . import db_initialization, league
    
    # Print all available routes before registration to help debug
    print("Available blueprints to register:")
    if hasattr(lines, 'lines_bp'):
        print(f"- lines_bp blueprint available")
    if hasattr(team_formation, 'team_rating_bp'):
        print(f"- team_rating_bp blueprint available")
    
    # Register individual service blueprints
    # These will be created or modified in each service file
    if hasattr(calendar, 'calendar_bp'):
        app.register_blueprint(calendar.calendar_bp, url_prefix='/api/calendar')
    
    if hasattr(contract_manager, 'contract_bp'):
        app.register_blueprint(contract_manager.contract_bp, url_prefix='/api/contracts')
    
    # Register the draft blueprint
    if hasattr(draft_engine, 'draft_bp'):
        app.register_blueprint(draft_engine.draft_bp, url_prefix='/api/draft')
        print("Registered draft blueprint with prefix /api/draft")
    
    # Register lines blueprint first to give it precedence for shared routes
    if hasattr(lines, 'lines_bp'):
        app.register_blueprint(lines.lines_bp, url_prefix='/api/lines')
        print("Registered lines blueprint with prefix /api/lines")
    
    # Register team_rating blueprint after lines
    if hasattr(team_formation, 'team_rating_bp'):
        app.register_blueprint(team_formation.team_rating_bp, url_prefix='/api/team_rating')
        print("Registered team_rating blueprint with prefix /api/team_rating")
    
    if hasattr(statistics, 'stats_bp'):
        app.register_blueprint(statistics.stats_bp, url_prefix='/api/stats')
    
    if hasattr(game_simulation, 'game_bp'):
        app.register_blueprint(game_simulation.game_bp, url_prefix='/api/games')
    
    if hasattr(player, 'player_bp'):
        app.register_blueprint(player.player_bp, url_prefix='/api/players')
    
    if hasattr(team_service, 'team_bp'):
        app.register_blueprint(team_service.team_bp, url_prefix='/api/teams')
    
    if hasattr(db_initialization, 'init_bp'):
        app.register_blueprint(db_initialization.init_bp, url_prefix='/api/init')
        
    if hasattr(league, 'league_bp'):
        app.register_blueprint(league.league_bp, url_prefix='/api/leagues')
        print("Registered league blueprint with prefix /api/leagues")

    # Print all routes after registration to help debug
    print("All registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule}")

# Update this list to remove the classes that cause circular imports
__all__ = [
    "ChemistryCalculator",
    "CoachStrategy"
]
