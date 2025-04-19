from typing import Dict, List, Any, Optional
import random
from datetime import datetime, timedelta
from ..models.player import Player
from ..models.team import Team
from ..models.contract import Contract
from ..extensions import db
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

# Create a blueprint for contract endpoints
contract_bp = Blueprint('contract', __name__)

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
        # Placeholder implementation
        # In a real implementation, this would query the database
        contracts = [
            {
                "id": 1,
                "player_id": 1,
                "team_id": 1,
                "years": 8,
                "salary": 10500000,
                "signing_bonus": 2000000,
                "no_trade_clause": True,
                "start_date": "2020-07-01",
                "end_date": "2028-06-30"
            },
            {
                "id": 2,
                "player_id": 2,
                "team_id": 1,
                "years": 5,
                "salary": 8750000,
                "signing_bonus": 1000000,
                "no_trade_clause": False,
                "start_date": "2022-07-01",
                "end_date": "2027-06-30"
            },
            {
                "id": 3,
                "player_id": 3,
                "team_id": 2,
                "years": 3,
                "salary": 6500000,
                "signing_bonus": 500000,
                "no_trade_clause": False,
                "start_date": "2021-07-01",
                "end_date": "2024-06-30"
            }
        ]
        
        # Apply filters if provided
        if filters:
            filtered_contracts = []
            for contract in contracts:
                match = True
                for key, value in filters.items():
                    if contract.get(key) != value:
                        match = False
                        break
                if match:
                    filtered_contracts.append(contract)
            return filtered_contracts
            
        return contracts
    
    @staticmethod
    def get_contract_by_id(contract_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific contract by ID.
        
        Args:
            contract_id: The ID of the contract to retrieve
            
        Returns:
            Contract dictionary, or None if not found
        """
        contracts = ContractManager.get_all_contracts()
        for contract in contracts:
            if contract.get("id") == contract_id:
                return contract
                
        return None
    
    @staticmethod
    def get_player_contract(player_id: int) -> Optional[Dict[str, Any]]:
        """
        Get the current contract for a specific player.
        
        Args:
            player_id: The ID of the player
            
        Returns:
            Contract dictionary, or None if not found
        """
        contracts = ContractManager.get_all_contracts({"player_id": player_id})
        return contracts[0] if contracts else None
    
    @staticmethod
    def get_team_contracts(team_id: int) -> List[Dict[str, Any]]:
        """
        Get all contracts for a specific team.
        
        Args:
            team_id: The ID of the team
            
        Returns:
            List of contract dictionaries
        """
        return ContractManager.get_all_contracts({"team_id": team_id})
    
    @staticmethod
    def create_contract(contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new contract.
        
        Args:
            contract_data: Dictionary with contract data
            
        Returns:
            Created contract as dictionary
        """
        # Placeholder implementation
        # In a real implementation, this would create a new Contract model instance
        
        # Calculate end date based on start date and years
        start_date = datetime.strptime(contract_data.get("start_date", "2023-07-01"), "%Y-%m-%d")
        years = contract_data.get("years", 1)
        end_date = start_date + timedelta(days=365 * years)
        
        contract = {
            "id": 4,  # Would be auto-generated in a real implementation
            "player_id": contract_data.get("player_id"),
            "team_id": contract_data.get("team_id"),
            "years": years,
            "salary": contract_data.get("salary", 0),
            "signing_bonus": contract_data.get("signing_bonus", 0),
            "no_trade_clause": contract_data.get("no_trade_clause", False),
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        }
        
        return contract
    
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
        contract = ContractManager.get_contract_by_id(contract_id)
        if not contract:
            return None
            
        # Update contract fields
        for key, value in contract_data.items():
            if key not in ["id", "player_id", "team_id"]:  # Protect key fields
                contract[key] = value
            
        # Recalculate end date if years changed
        if "years" in contract_data:
            start_date = datetime.strptime(contract.get("start_date"), "%Y-%m-%d")
            years = contract.get("years")
            end_date = start_date + timedelta(days=365 * years)
            contract["end_date"] = end_date.strftime("%Y-%m-%d")
            
        return contract
    
    @staticmethod
    def terminate_contract(contract_id: int) -> bool:
        """
        Terminate a contract.
        
        Args:
            contract_id: The ID of the contract to terminate
            
        Returns:
            Boolean indicating success
        """
        contract = ContractManager.get_contract_by_id(contract_id)
        return contract is not None
    
    @staticmethod
    def calculate_team_cap_hit(team_id: int) -> Dict[str, float]:
        """
        Calculate the total salary cap hit for a team.
        
        Args:
            team_id: The ID of the team
            
        Returns:
            Dictionary with cap information
        """
        contracts = ContractManager.get_team_contracts(team_id)
        
        total_salary = sum(contract.get("salary", 0) for contract in contracts)
        total_bonuses = sum(contract.get("signing_bonus", 0) for contract in contracts)
        
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
