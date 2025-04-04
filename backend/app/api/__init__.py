from flask import Blueprint

# Create the main API blueprint
api_bp = Blueprint('api', __name__)

# Register all API blueprints
def register_api_blueprints(app):
    from . import players, teams, games, calendar, stats, contracts, draft, init
    
    # Register the main API blueprint
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Register individual API blueprints
    app.register_blueprint(players.player_bp, url_prefix='/api/players')
    app.register_blueprint(teams.team_bp, url_prefix='/api/teams')
    app.register_blueprint(games.game_bp, url_prefix='/api/games')
    app.register_blueprint(calendar.calendar_bp, url_prefix='/api/calendar')
    app.register_blueprint(stats.stats_bp, url_prefix='/api/stats')
    app.register_blueprint(contracts.contract_bp, url_prefix='/api/contracts')
    app.register_blueprint(draft.draft_bp, url_prefix='/api/draft')
    app.register_blueprint(init.init_bp, url_prefix='/api/init')
