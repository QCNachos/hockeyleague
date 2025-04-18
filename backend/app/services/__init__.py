"""
This module contains service classes that implement the core business logic of the application.
"""

from . import calendar, player
# Remove these imports to avoid circular dependency
# from .lines import LineOptimizer
# from .team_formation import TeamFormation
from .chemistry import ChemistryCalculator
from .coach import CoachStrategy

from flask import Blueprint

# Create a function to register all service blueprints
def register_service_blueprints(app):
    # Import all services with blueprints
    from . import contract_manager, draft_engine, lines, statistics
    from . import team_formation, chemistry, coach, game_simulation, team_service
    from . import db_initialization
    
    # Register individual service blueprints
    # These will be created or modified in each service file
    if hasattr(calendar, 'calendar_bp'):
        app.register_blueprint(calendar.calendar_bp, url_prefix='/api/calendar')
    
    if hasattr(contract_manager, 'contract_bp'):
        app.register_blueprint(contract_manager.contract_bp, url_prefix='/api/contracts')
    
    if hasattr(draft_engine, 'draft_bp'):
        app.register_blueprint(draft_engine.draft_bp, url_prefix='/api/draft')
    
    if hasattr(lines, 'lines_bp'):
        app.register_blueprint(lines.lines_bp, url_prefix='/api/lines')
    
    if hasattr(statistics, 'stats_bp'):
        app.register_blueprint(statistics.stats_bp, url_prefix='/api/stats')
    
    if hasattr(team_formation, 'team_rating_bp'):
        app.register_blueprint(team_formation.team_rating_bp, url_prefix='/api/team_rating')
    
    if hasattr(game_simulation, 'game_bp'):
        app.register_blueprint(game_simulation.game_bp, url_prefix='/api/games')
    
    if hasattr(player, 'player_bp'):
        app.register_blueprint(player.player_bp, url_prefix='/api/players')
    
    if hasattr(team_service, 'team_bp'):
        app.register_blueprint(team_service.team_bp, url_prefix='/api/teams')
    
    if hasattr(db_initialization, 'init_bp'):
        app.register_blueprint(db_initialization.init_bp, url_prefix='/api/init')

    # Add other blueprints as needed

# Update this list to remove the classes that cause circular imports
__all__ = [
    "ChemistryCalculator",
    "CoachStrategy"
]
