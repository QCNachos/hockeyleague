from typing import Dict, Any
from datetime import datetime
from ..extensions import db

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
