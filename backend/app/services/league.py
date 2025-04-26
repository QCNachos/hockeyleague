from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..extensions import db
from datetime import datetime

# Create a blueprint for league endpoints
league_bp = Blueprint('league', __name__)

# Conference model definition (moved from models/conference.py)
class Conference(db.Model):
    """
    Model representing a hockey conference.
    """
    __tablename__ = 'conferences'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    abbreviation = db.Column(db.String(10), nullable=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    divisions = db.relationship('Division', backref='conference', lazy=True)
    
    def __repr__(self):
        return f'<Conference {self.name}>'
    
    def to_dict(self):
        """
        Convert the conference object to a dictionary.
        """
        return {
            'id': self.id,
            'name': self.name,
            'abbreviation': self.abbreviation,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Division model definition (moved from models/division.py)
class Division(db.Model):
    """
    Model representing a hockey division.
    """
    __tablename__ = 'divisions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    abbreviation = db.Column(db.String(10), nullable=True)
    conference_id = db.Column(db.Integer, db.ForeignKey('conferences.id'), nullable=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teams = db.relationship('Team', backref='division', lazy=True)
    
    def __repr__(self):
        return f'<Division {self.name}>'
    
    def to_dict(self):
        """
        Convert the division object to a dictionary.
        """
        return {
            'id': self.id,
            'name': self.name,
            'abbreviation': self.abbreviation,
            'conference_id': self.conference_id,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ConferenceService:
    """
    Service for managing conferences.
    """
    
    @staticmethod
    def get_all_conferences() -> List[Dict[str, Any]]:
        """
        Get all conferences.
        
        Returns:
            List of conferences as dictionaries
        """
        conferences = [conference.to_dict() for conference in Conference.query.all()]
        return conferences
    
    @staticmethod
    def get_conference_by_id(conference_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific conference by ID.
        
        Args:
            conference_id: The ID of the conference to retrieve
            
        Returns:
            Conference as dictionary, or None if not found
        """
        conference = Conference.query.get(conference_id)
        return conference.to_dict() if conference else None
    
    @staticmethod
    def create_conference(conference_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new conference.
        
        Args:
            conference_data: Dictionary with conference data
            
        Returns:
            Created conference as dictionary
        """
        new_conference = Conference(
            name=conference_data.get('name'),
            abbreviation=conference_data.get('abbreviation'),
            active=conference_data.get('active', True)
        )
        
        db.session.add(new_conference)
        db.session.commit()
        
        return new_conference.to_dict()
    
    @staticmethod
    def update_conference(conference_id: int, conference_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing conference.
        
        Args:
            conference_id: The ID of the conference to update
            conference_data: Dictionary with updated conference data
            
        Returns:
            Updated conference as dictionary, or None if not found
        """
        conference = Conference.query.get(conference_id)
        if not conference:
            return None
            
        # Update conference attributes
        for key, value in conference_data.items():
            if hasattr(conference, key):
                setattr(conference, key, value)
        
        db.session.commit()
        
        return conference.to_dict()
    
    @staticmethod
    def delete_conference(conference_id: int) -> bool:
        """
        Delete a conference.
        
        Args:
            conference_id: The ID of the conference to delete
            
        Returns:
            Boolean indicating success
        """
        conference = Conference.query.get(conference_id)
        if not conference:
            return False
            
        db.session.delete(conference)
        db.session.commit()
        
        return True


class DivisionService:
    """
    Service for managing divisions.
    """
    
    @staticmethod
    def get_all_divisions() -> List[Dict[str, Any]]:
        """
        Get all divisions.
        
        Returns:
            List of divisions as dictionaries
        """
        divisions = [division.to_dict() for division in Division.query.all()]
        return divisions
    
    @staticmethod
    def get_divisions_by_conference(conference_id: int) -> List[Dict[str, Any]]:
        """
        Get all divisions in a conference.
        
        Args:
            conference_id: The ID of the conference
            
        Returns:
            List of divisions as dictionaries
        """
        divisions = [division.to_dict() for division in Division.query.filter_by(conference_id=conference_id).all()]
        return divisions
    
    @staticmethod
    def get_division_by_id(division_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific division by ID.
        
        Args:
            division_id: The ID of the division to retrieve
            
        Returns:
            Division as dictionary, or None if not found
        """
        division = Division.query.get(division_id)
        return division.to_dict() if division else None
    
    @staticmethod
    def create_division(division_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new division.
        
        Args:
            division_data: Dictionary with division data
            
        Returns:
            Created division as dictionary
        """
        new_division = Division(
            name=division_data.get('name'),
            abbreviation=division_data.get('abbreviation'),
            conference_id=division_data.get('conference_id'),
            active=division_data.get('active', True)
        )
        
        db.session.add(new_division)
        db.session.commit()
        
        return new_division.to_dict()
    
    @staticmethod
    def update_division(division_id: int, division_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing division.
        
        Args:
            division_id: The ID of the division to update
            division_data: Dictionary with updated division data
            
        Returns:
            Updated division as dictionary, or None if not found
        """
        division = Division.query.get(division_id)
        if not division:
            return None
            
        # Update division attributes
        for key, value in division_data.items():
            if hasattr(division, key):
                setattr(division, key, value)
        
        db.session.commit()
        
        return division.to_dict()
    
    @staticmethod
    def delete_division(division_id: int) -> bool:
        """
        Delete a division.
        
        Args:
            division_id: The ID of the division to delete
            
        Returns:
            Boolean indicating success
        """
        division = Division.query.get(division_id)
        if not division:
            return False
            
        db.session.delete(division)
        db.session.commit()
        
        return True


# API endpoints for conferences

@league_bp.route('/conferences', methods=['GET'])
def get_conferences():
    """Get all conferences"""
    conferences = ConferenceService.get_all_conferences()
    return jsonify(conferences), 200


@league_bp.route('/conferences/<int:conference_id>', methods=['GET'])
def get_conference(conference_id):
    """Get a specific conference by ID"""
    conference = ConferenceService.get_conference_by_id(conference_id)
    
    if not conference:
        return jsonify({"error": f"Conference with ID {conference_id} not found"}), 404
        
    return jsonify(conference), 200


@league_bp.route('/conferences', methods=['POST'])
@jwt_required()
def create_conference():
    """Create a new conference"""
    conference_data = request.get_json()
    
    if not conference_data:
        return jsonify({"error": "No conference data provided"}), 400
    
    # Validate required fields
    if 'name' not in conference_data:
        return jsonify({"error": "Missing required field: name"}), 400
    
    new_conference = ConferenceService.create_conference(conference_data)
    return jsonify(new_conference), 201


@league_bp.route('/conferences/<int:conference_id>', methods=['PUT'])
@jwt_required()
def update_conference(conference_id):
    """Update an existing conference"""
    conference_data = request.get_json()
    
    if not conference_data:
        return jsonify({"error": "No conference data provided"}), 400
        
    updated_conference = ConferenceService.update_conference(conference_id, conference_data)
    
    if not updated_conference:
        return jsonify({"error": f"Conference with ID {conference_id} not found"}), 404
        
    return jsonify(updated_conference), 200


@league_bp.route('/conferences/<int:conference_id>', methods=['DELETE'])
@jwt_required()
def delete_conference(conference_id):
    """Delete a conference"""
    success = ConferenceService.delete_conference(conference_id)
    
    if not success:
        return jsonify({"error": f"Conference with ID {conference_id} not found"}), 404
        
    return jsonify({'message': 'Conference deleted successfully'}), 200


# API endpoints for divisions

@league_bp.route('/divisions', methods=['GET'])
def get_divisions():
    """Get all divisions or filter by conference ID"""
    conference_id = request.args.get('conference_id')
    
    if conference_id:
        divisions = DivisionService.get_divisions_by_conference(int(conference_id))
    else:
        divisions = DivisionService.get_all_divisions()
        
    return jsonify(divisions), 200


@league_bp.route('/divisions/<int:division_id>', methods=['GET'])
def get_division(division_id):
    """Get a specific division by ID"""
    division = DivisionService.get_division_by_id(division_id)
    
    if not division:
        return jsonify({"error": f"Division with ID {division_id} not found"}), 404
        
    return jsonify(division), 200


@league_bp.route('/divisions', methods=['POST'])
@jwt_required()
def create_division():
    """Create a new division"""
    division_data = request.get_json()
    
    if not division_data:
        return jsonify({"error": "No division data provided"}), 400
    
    # Validate required fields
    if 'name' not in division_data:
        return jsonify({"error": "Missing required field: name"}), 400
    
    new_division = DivisionService.create_division(division_data)
    return jsonify(new_division), 201


@league_bp.route('/divisions/<int:division_id>', methods=['PUT'])
@jwt_required()
def update_division(division_id):
    """Update an existing division"""
    division_data = request.get_json()
    
    if not division_data:
        return jsonify({"error": "No division data provided"}), 400
        
    updated_division = DivisionService.update_division(division_id, division_data)
    
    if not updated_division:
        return jsonify({"error": f"Division with ID {division_id} not found"}), 404
        
    return jsonify(updated_division), 200


@league_bp.route('/divisions/<int:division_id>', methods=['DELETE'])
@jwt_required()
def delete_division(division_id):
    """Delete a division"""
    success = DivisionService.delete_division(division_id)
    
    if not success:
        return jsonify({"error": f"Division with ID {division_id} not found"}), 404
        
    return jsonify({'message': 'Division deleted successfully'}), 200
