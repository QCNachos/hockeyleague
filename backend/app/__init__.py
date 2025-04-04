import os
from flask import Flask
from .extensions import db, migrate, jwt, bcrypt, cors
from .config.config import config_by_name


def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)
    
    # Register blueprints
    from .api import register_api_blueprints
    register_api_blueprints(app)
    
    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200
    
    return app
