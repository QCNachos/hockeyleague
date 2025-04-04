from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

# Database
db = SQLAlchemy()

# Migrations
migrate = Migrate()

# JWT Authentication
jwt = JWTManager()

# Password hashing
bcrypt = Bcrypt()

# CORS
cors = CORS()
