from ..extensions import db
from datetime import datetime


class Coach(db.Model):
    """Coach model for team coaches"""
    __tablename__ = 'coaches'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    experience = db.Column(db.Integer)  # Years of coaching experience
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    team = db.relationship('Team', back_populates='coach')
    
    def __repr__(self):
        return f'<Coach {self.name}>'
    
    def to_dict(self):
        """Convert Coach object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'age': self.age,
            'experience': self.experience
        }
