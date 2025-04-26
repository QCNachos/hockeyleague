from typing import Dict, List, Any, Optional
from datetime import datetime
from ..extensions import db
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

# Create a blueprint for calendar endpoints
calendar_bp = Blueprint('calendar', __name__)

# Calendar Model
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

class CalendarService:
    """
    Service for managing calendar events.
    """
    
    @staticmethod
    def get_all_events(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Get all calendar events, optionally filtered.
        
        Args:
            filters: Optional dictionary of filter parameters
            
        Returns:
            List of calendar events as dictionaries
        """
        # Query the database for events
        query = Calendar.query
        
        # Apply filters if provided
        if filters:
            for key, value in filters.items():
                if hasattr(Calendar, key):
                    query = query.filter(getattr(Calendar, key) == value)
        
        # Execute query and convert to dictionaries
        events = [event.to_dict() for event in query.all()]
        return events
    
    @staticmethod
    def get_event_by_id(event_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific calendar event by ID.
        
        Args:
            event_id: The ID of the event to retrieve
            
        Returns:
            Calendar event as dictionary, or None if not found
        """
        event = Calendar.query.get(event_id)
        return event.to_dict() if event else None
    
    @staticmethod
    def create_event(event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new calendar event.
        
        Args:
            event_data: Dictionary with event data
            
        Returns:
            Created event as dictionary
        """
        # Create new Calendar instance
        new_event = Calendar.from_dict(event_data)
        
        # Add to database
        db.session.add(new_event)
        db.session.commit()
        
        return new_event.to_dict()
    
    @staticmethod
    def update_event(event_id: int, event_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing calendar event.
        
        Args:
            event_id: The ID of the event to update
            event_data: Dictionary with updated event data
            
        Returns:
            Updated event as dictionary, or None if not found
        """
        event = Calendar.query.get(event_id)
        if not event:
            return None
            
        # Update event fields
        for key, value in event_data.items():
            if hasattr(event, key):
                if key == 'date' and isinstance(value, str):
                    value = datetime.fromisoformat(value).date()
                setattr(event, key, value)
        
        # Commit changes
        db.session.commit()
        
        return event.to_dict()
    
    @staticmethod
    def delete_event(event_id: int) -> bool:
        """
        Delete a calendar event.
        
        Args:
            event_id: The ID of the event to delete
            
        Returns:
            Boolean indicating success
        """
        event = Calendar.query.get(event_id)
        if not event:
            return False
            
        # Delete event
        db.session.delete(event)
        db.session.commit()
        
        return True

# API endpoints that utilize the service

@calendar_bp.route('/', methods=['GET'])
def get_calendar_events():
    """Get all calendar events or filter by query parameters"""
    # Get filters from request args
    filters = request.args.to_dict() if request.args else None
    events = CalendarService.get_all_events(filters)
    return jsonify(events), 200


@calendar_bp.route('/<int:event_id>', methods=['GET'])
def get_calendar_event(event_id):
    """Get a specific calendar event by ID"""
    event = CalendarService.get_event_by_id(event_id)
    if not event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404
    return jsonify(event), 200


@calendar_bp.route('/', methods=['POST'])
def create_calendar_event():
    """Create a new calendar event"""
    event_data = request.get_json()
    if not event_data:
        return jsonify({"error": "No event data provided"}), 400
    
    new_event = CalendarService.create_event(event_data)
    return jsonify(new_event), 201


@calendar_bp.route('/<int:event_id>', methods=['PUT', 'PATCH'])
def update_calendar_event(event_id):
    """Update an existing calendar event"""
    event_data = request.get_json()
    if not event_data:
        return jsonify({"error": "No event data provided"}), 400
    
    updated_event = CalendarService.update_event(event_id, event_data)
    if not updated_event:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404
    
    return jsonify(updated_event), 200


@calendar_bp.route('/<int:event_id>', methods=['DELETE'])
def delete_calendar_event(event_id):
    """Delete a calendar event"""
    success = CalendarService.delete_event(event_id)
    if not success:
        return jsonify({"error": f"Event with ID {event_id} not found"}), 404
    
    return jsonify({"message": f"Event with ID {event_id} deleted successfully"}), 200 