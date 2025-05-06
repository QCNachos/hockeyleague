import os
from flask import Flask, jsonify
from .extensions import db, migrate, jwt, bcrypt, cors
from .config.config import config_by_name
from .services.draft.draft_order import draft_order_bp

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # CORS is now configured at the application level in app.py
    # cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from .services import register_service_blueprints
    register_service_blueprints(app)
    
    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Register draft_order_bp with a unique URL prefix
    app.register_blueprint(draft_order_bp, url_prefix='/api/draft-order-service')
    
    @app.route('/')
    def index():
        return {'message': 'Welcome to the Hockey League API'}, 200
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200
    
    # Add route diagnostic endpoint
    @app.route('/api/routes')
    def list_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': [method for method in rule.methods if method not in ['HEAD', 'OPTIONS']],
                'path': str(rule)
            })
        return jsonify(routes)
    
    return app
