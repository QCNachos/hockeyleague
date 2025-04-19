from typing import Dict, Any
from datetime import datetime
from ..extensions import db

class Calendar(db.Model):
    """
    Model for calendar events in the hockey league.
    """
    __tablename__ = 'calendar_events'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    type = db.Column(db.String(50), default='other')
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the model instance to a dictionary.
        
        Returns:
            Dictionary representation of the calendar event
        """
        return {
            'id': self.id,
            'title': self.title,
            'date': self.date.isoformat() if self.date else None,
            'type': self.type,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Calendar':
        """
        Create a new Calendar instance from a dictionary.
        
        Args:
            data: Dictionary with calendar event data
            
        Returns:
            New Calendar instance
        """
        return cls(
            title=data.get('title'),
            date=datetime.fromisoformat(data.get('date')).date() if data.get('date') else None,
            type=data.get('type', 'other'),
            description=data.get('description')
        )
