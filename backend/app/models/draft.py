from typing import Dict, Any, List
from datetime import datetime
from ..extensions import db

class Draft(db.Model):
    """
    Model for NHL draft information.
    """
    __tablename__ = 'drafts'
    
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    round_count = db.Column(db.Integer, default=7)
    status = db.Column(db.String(20), default='pending')  # pending, active, completed
    current_round = db.Column(db.Integer, default=1)
    current_pick = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define relationship to draft picks
    picks = db.relationship('DraftPick', backref='draft', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the model instance to a dictionary.
        
        Returns:
            Dictionary representation of the draft
        """
        return {
            'id': self.id,
            'year': self.year,
            'round_count': self.round_count,
            'status': self.status,
            'current_round': self.current_round,
            'current_pick': self.current_pick,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Draft':
        """
        Create a new Draft instance from a dictionary.
        
        Args:
            data: Dictionary with draft data
            
        Returns:
            New Draft instance
        """
        return cls(
            year=data.get('year'),
            round_count=data.get('round_count', 7),
            status=data.get('status', 'pending'),
            current_round=data.get('current_round', 1),
            current_pick=data.get('current_pick', 1)
        )


class DraftPick(db.Model):
    """
    Model for individual draft picks.
    """
    __tablename__ = 'draft_picks'
    
    id = db.Column(db.Integer, primary_key=True)
    draft_id = db.Column(db.Integer, db.ForeignKey('drafts.id'), nullable=False)
    round_num = db.Column(db.Integer, nullable=False)
    pick_num = db.Column(db.Integer, nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'))
    prospect_id = db.Column(db.String(36))  # UUID for prospect before becoming a player
    overall_pick = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define relationships
    team = db.relationship('Team', backref=db.backref('draft_picks', lazy=True))
    player = db.relationship('Player', backref=db.backref('draft_pick', lazy=True))
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the model instance to a dictionary.
        
        Returns:
            Dictionary representation of the draft pick
        """
        return {
            'id': self.id,
            'draft_id': self.draft_id,
            'round_num': self.round_num,
            'pick_num': self.pick_num,
            'team_id': self.team_id,
            'player_id': self.player_id,
            'prospect_id': self.prospect_id,
            'overall_pick': self.overall_pick,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DraftPick':
        """
        Create a new DraftPick instance from a dictionary.
        
        Args:
            data: Dictionary with draft pick data
            
        Returns:
            New DraftPick instance
        """
        return cls(
            draft_id=data.get('draft_id'),
            round_num=data.get('round_num'),
            pick_num=data.get('pick_num'),
            team_id=data.get('team_id'),
            player_id=data.get('player_id'),
            prospect_id=data.get('prospect_id'),
            overall_pick=data.get('overall_pick')
        )
