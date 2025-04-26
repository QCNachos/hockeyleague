from typing import Dict, List, Any, Optional, Tuple
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from ..extensions import db
from ..services.team_service import Team
from ..services.player import Player
import random
import logging
from flask_jwt_extended import jwt_required

# Create a blueprint for contract endpoints
contract_bp = Blueprint('contract', __name__)

# Contract model definition (moved from models/contract.py)
class Contract(db.Model):
    """
    Model for player contracts in the hockey league.
    """
    __tablename__ = 'contracts'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    years = db.Column(db.Integer, nullable=False)
    salary = db.Column(db.Integer, nullable=False)  # Annual salary in dollars
    signing_bonus = db.Column(db.Integer, default=0)  # Signing bonus in dollars
    no_trade_clause = db.Column(db.Boolean, default=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define relationships (SQLAlchemy will use these to create joins)
    player = db.relationship('Player', backref=db.backref('contract', lazy=True))
    team = db.relationship('Team', backref=db.backref('contracts', lazy=True))
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the model instance to a dictionary.
        
        Returns:
            Dictionary representation of the contract
        """
        return {
            'id': self.id,
            'player_id': self.player_id,
            'team_id': self.team_id,
            'years': self.years,
            'salary': self.salary,
            'signing_bonus': self.signing_bonus,
            'no_trade_clause': self.no_trade_clause,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Contract':
        """
        Create a new Contract instance from a dictionary.
        
        Args:
            data: Dictionary with contract data
            
        Returns:
            New Contract instance
        """
        # Parse date strings to datetime objects
        start_date = None
        if data.get('start_date'):
            start_date = datetime.fromisoformat(data['start_date']).date() if isinstance(data['start_date'], str) else data['start_date']
            
        end_date = None
        if data.get('end_date'):
            end_date = datetime.fromisoformat(data['end_date']).date() if isinstance(data['end_date'], str) else data['end_date']
        
        return cls(
            player_id=data.get('player_id'),
            team_id=data.get('team_id'),
            years=data.get('years'),
            salary=data.get('salary'),
            signing_bonus=data.get('signing_bonus', 0),
            no_trade_clause=data.get('no_trade_clause', False),
            start_date=start_date,
            end_date=end_date
        )

class ContractManager:
    """
    Service for managing player contracts.
    """
    
    @staticmethod
    def get_all_contracts(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Get all contracts, optionally filtered.
        
        Args:
            filters: Optional dictionary of filter parameters
            
        Returns:
            List of contract dictionaries
        """
        # Real implementation using the Contract model
        query = Contract.query
        
        # Apply filters
        if filters:
            for key, value in filters.items():
                if hasattr(Contract, key):
                    query = query.filter(getattr(Contract, key) == value)
                    
        # Convert to dictionaries
        return [contract.to_dict() for contract in query.all()]
    
    @staticmethod
    def get_contract_by_id(contract_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific contract by ID.
        
        Args:
            contract_id: The ID of the contract to retrieve
            
        Returns:
            Contract dictionary, or None if not found
        """
        contract = Contract.query.get(contract_id)
        return contract.to_dict() if contract else None
    
    @staticmethod
    def get_player_contract(player_id: int) -> Optional[Dict[str, Any]]:
        """
        Get the current contract for a specific player.
        
        Args:
            player_id: The ID of the player
            
        Returns:
            Contract dictionary, or None if not found
        """
        contract = Contract.query.filter_by(player_id=player_id).first()
        return contract.to_dict() if contract else None
    
    @staticmethod
    def get_team_contracts(team_id: int) -> List[Dict[str, Any]]:
        """
        Get all contracts for a specific team.
        
        Args:
            team_id: The ID of the team
            
        Returns:
            List of contract dictionaries
        """
        contracts = Contract.query.filter_by(team_id=team_id).all()
        return [contract.to_dict() for contract in contracts]
    
    @staticmethod
    def create_contract(contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new contract.
        
        Args:
            contract_data: Dictionary with contract data
            
        Returns:
            Created contract as dictionary
        """
        # Create a new contract using the from_dict class method
        new_contract = Contract.from_dict(contract_data)
        
        # Add to database and commit
        db.session.add(new_contract)
        db.session.commit()
        
        return new_contract.to_dict()
    
    @staticmethod
    def update_contract(contract_id: int, contract_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing contract.
        
        Args:
            contract_id: The ID of the contract to update
            contract_data: Dictionary with updated contract data
            
        Returns:
            Updated contract as dictionary, or None if not found
        """
        contract = Contract.query.get(contract_id)
        if not contract:
            return None
            
        # Update contract attributes
        for key, value in contract_data.items():
            if key not in ["id", "player_id", "team_id"] and hasattr(contract, key):
                setattr(contract, key, value)
        
        # Commit changes
        db.session.commit()
        
        return contract.to_dict()
    
    @staticmethod
    def terminate_contract(contract_id: int) -> bool:
        """
        Terminate a contract.
        
        Args:
            contract_id: The ID of the contract to terminate
            
        Returns:
            Boolean indicating success
        """
        contract = Contract.query.get(contract_id)
        if not contract:
            return False
            
        db.session.delete(contract)
        db.session.commit()
        
        return True
    
    @staticmethod
    def calculate_team_cap_hit(team_id: int) -> Dict[str, float]:
        """
        Calculate the total salary cap hit for a team.
        
        Args:
            team_id: The ID of the team
            
        Returns:
            Dictionary with cap information
        """
        contracts = Contract.query.filter_by(team_id=team_id).all()
        
        total_salary = sum(contract.salary for contract in contracts)
        total_bonuses = sum(contract.signing_bonus for contract in contracts)
        
        return {
            "team_id": team_id,
            "total_salary": total_salary,
            "total_bonuses": total_bonuses,
            "total_cap_hit": total_salary + total_bonuses
        }


# API endpoints that utilize the contract service

@contract_bp.route('/', methods=['GET'])
def get_contracts():
    """Get all contracts or filter by query parameters"""
    # Get filters from request args
    filters = {}
    
    # Extract filters from request args
    player_id = request.args.get('player_id')
    team_id = request.args.get('team_id')
    
    if player_id:
        filters['player_id'] = int(player_id)
    if team_id:
        filters['team_id'] = int(team_id)
    
    # Get contracts
    if filters:
        contracts = ContractManager.get_all_contracts(filters)
    else:
        contracts = ContractManager.get_all_contracts()
    
    return jsonify(contracts), 200


@contract_bp.route('/<int:contract_id>', methods=['GET'])
def get_contract(contract_id):
    """Get a specific contract by ID"""
    contract = ContractManager.get_contract_by_id(contract_id)
    
    if not contract:
        return jsonify({"error": f"Contract with ID {contract_id} not found"}), 404
        
    return jsonify(contract), 200


@contract_bp.route('/players/<int:player_id>', methods=['GET'])
def get_player_contract(player_id):
    """Get contract for a specific player"""
    contract = ContractManager.get_player_contract(player_id)
    
    if not contract:
        return jsonify({"error": f"No contract found for player with ID {player_id}"}), 404
        
    return jsonify(contract), 200


@contract_bp.route('/teams/<int:team_id>', methods=['GET'])
def get_team_contracts(team_id):
    """Get all contracts for a specific team"""
    contracts = ContractManager.get_team_contracts(team_id)
    return jsonify(contracts), 200


@contract_bp.route('/teams/<int:team_id>/cap', methods=['GET'])
def get_team_cap(team_id):
    """Get salary cap information for a team"""
    cap_info = ContractManager.calculate_team_cap_hit(team_id)
    return jsonify(cap_info), 200


@contract_bp.route('/', methods=['POST'])
@jwt_required()
def create_contract():
    """Create a new contract"""
    contract_data = request.get_json()
    
    if not contract_data:
        return jsonify({"error": "No contract data provided"}), 400
        
    # Validate required fields
    required_fields = ['player_id', 'team_id', 'years', 'salary']
    for field in required_fields:
        if field not in contract_data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    new_contract = ContractManager.create_contract(contract_data)
    return jsonify(new_contract), 201


@contract_bp.route('/<int:contract_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_contract(contract_id):
    """Update an existing contract"""
    contract_data = request.get_json()
    
    if not contract_data:
        return jsonify({"error": "No contract data provided"}), 400
        
    updated_contract = ContractManager.update_contract(contract_id, contract_data)
    
    if not updated_contract:
        return jsonify({"error": f"Contract with ID {contract_id} not found"}), 404
        
    return jsonify(updated_contract), 200


@contract_bp.route('/<int:contract_id>', methods=['DELETE'])
@jwt_required()
def terminate_contract(contract_id):
    """Terminate a contract"""
    success = ContractManager.terminate_contract(contract_id)
    
    if not success:
        return jsonify({"error": f"Contract with ID {contract_id} not found"}), 404
        
    return jsonify({"message": f"Contract with ID {contract_id} terminated successfully"}), 200
