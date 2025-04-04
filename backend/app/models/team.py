from ..extensions import db
from datetime import datetime


class Team(db.Model):
    """Team model for hockey teams"""
    __tablename__ = 'teams'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    abbreviation = db.Column(db.String(3), nullable=False, unique=True)
    logo_url = db.Column(db.String(255))
    primary_color = db.Column(db.String(7))  # Hex color code
    secondary_color = db.Column(db.String(7))  # Hex color code
    division_id = db.Column(db.Integer, db.ForeignKey('divisions.id'))
    arena_name = db.Column(db.String(100))
    arena_capacity = db.Column(db.Integer)
    gm_name = db.Column(db.String(100))
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.id'))
    prestige = db.Column(db.Integer, default=50)  # 1-100 scale
    budget = db.Column(db.Integer)  # in $
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    players = db.relationship('Player', back_populates='team')
    coach = db.relationship('Coach', back_populates='team')
    division = db.relationship('Division', back_populates='teams')
    home_games = db.relationship('Game', foreign_keys='Game.home_team_id', back_populates='home_team')
    away_games = db.relationship('Game', foreign_keys='Game.away_team_id', back_populates='away_team')
    
    def __repr__(self):
        return f'<Team {self.name}>'
    
    def to_dict(self):
        """Convert Team object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'city': self.city,
            'abbreviation': self.abbreviation,
            'logo_url': self.logo_url,
            'primary_color': self.primary_color or '#1e1e1e',  # Default dark gray if None
            'secondary_color': self.secondary_color or '#FFFFFF',  # Default white if None
            'division_id': self.division_id,
            'arena_name': self.arena_name,
            'arena_capacity': self.arena_capacity,
            'gm_name': self.gm_name,
            'coach_id': self.coach_id,
            'prestige': self.prestige,
            'budget': self.budget
        }
