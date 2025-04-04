from ..extensions import db
from datetime import datetime


class Division(db.Model):
    """Division model for organizing teams"""
    __tablename__ = 'divisions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    abbreviation = db.Column(db.String(10), nullable=False)
    conference_id = db.Column(db.Integer, db.ForeignKey('conferences.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teams = db.relationship('Team', back_populates='division')
    conference = db.relationship('Conference', back_populates='divisions')
    
    def __repr__(self):
        return f'<Division {self.name}>'
    
    def to_dict(self):
        """Convert Division object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'abbreviation': self.abbreviation,
            'conference_id': self.conference_id
        } 