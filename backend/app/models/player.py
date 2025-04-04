from ..extensions import db
from datetime import datetime


class Player(db.Model):
    """Player model for hockey players"""
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    position = db.Column(db.String(5), nullable=False)  # C, LW, RW, LD, RD, G
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=True)
    overall_rating = db.Column(db.Integer, default=50)
    potential = db.Column(db.String(3), default='MED')  # LOW, MED, HIGH, ELITE
    age = db.Column(db.Integer, default=18)
    height_cm = db.Column(db.Integer)  # in centimeters
    weight_kg = db.Column(db.Integer)  # in kilograms
    nationality = db.Column(db.String(50))
    shoot_catch = db.Column(db.String(1))  # L or R
    salary = db.Column(db.Integer, default=0)  # Annual salary
    contract_years = db.Column(db.Integer, default=0)
    is_drafted = db.Column(db.Boolean, default=False)
    draft_year = db.Column(db.Integer, nullable=True)
    draft_round = db.Column(db.Integer, nullable=True)
    draft_position = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Player skills/attributes for skaters
    skating = db.Column(db.Integer, default=50)
    shooting = db.Column(db.Integer, default=50)
    hands = db.Column(db.Integer, default=50)
    checking = db.Column(db.Integer, default=50)
    defense = db.Column(db.Integer, default=50)
    
    # Player skills/attributes for goalies
    positioning = db.Column(db.Integer, default=50)
    reflexes = db.Column(db.Integer, default=50)
    puck_handling = db.Column(db.Integer, default=50)
    rebound_control = db.Column(db.Integer, default=50)
    recovery = db.Column(db.Integer, default=50)
    
    # Relationships
    team = db.relationship('Team', back_populates='players')
    player_stats = db.relationship('PlayerStats', back_populates='player', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Player {self.first_name} {self.last_name}, {self.position}>'
    
    def to_dict(self):
        """Convert Player object to dictionary"""
        player_dict = {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'position': self.position,
            'team_id': self.team_id,
            'overall_rating': self.overall_rating,
            'potential': self.potential,
            'age': self.age,
            'height_cm': self.height_cm,
            'weight_kg': self.weight_kg,
            'nationality': self.nationality,
            'shoot_catch': self.shoot_catch,
            'salary': self.salary,
            'contract_years': self.contract_years,
            'is_drafted': self.is_drafted,
            'draft_year': self.draft_year,
            'draft_round': self.draft_round,
            'draft_position': self.draft_position
        }
        
        # Add position-specific attributes
        if self.position != 'G':  # Skater attributes
            player_dict.update({
                'skating': self.skating,
                'shooting': self.shooting,
                'hands': self.hands,
                'checking': self.checking,
                'defense': self.defense
            })
        else:  # Goalie attributes
            player_dict.update({
                'positioning': self.positioning,
                'reflexes': self.reflexes,
                'puck_handling': self.puck_handling,
                'rebound_control': self.rebound_control,
                'recovery': self.recovery
            })
        
        return player_dict
