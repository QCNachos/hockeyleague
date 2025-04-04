from ..extensions import db
from datetime import datetime


class Conference(db.Model):
    """Conference model for organizing divisions"""
    __tablename__ = 'conferences'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    abbreviation = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    divisions = db.relationship('Division', back_populates='conference')
    
    def __repr__(self):
        return f'<Conference {self.name}>'
    
    def to_dict(self):
        """Convert Conference object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'abbreviation': self.abbreviation
        } 