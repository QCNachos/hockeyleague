from ..extensions import db
from datetime import datetime
import json


class Game(db.Model):
    """Game model for hockey games"""
    __tablename__ = 'games'
    
    id = db.Column(db.Integer, primary_key=True)
    home_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    away_team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    
    # Game status: scheduled, in_progress, completed, cancelled
    status = db.Column(db.String(20), default='scheduled')
    
    # Date and time
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    
    # Scores
    home_score = db.Column(db.Integer)
    away_score = db.Column(db.Integer)
    
    # Period data (stored as JSON)
    period_data = db.Column(db.Text)  # JSON string with period scores, shots, etc.
    
    # Game statistics (stored as JSON)
    home_stats = db.Column(db.Text)  # JSON string with home team stats
    away_stats = db.Column(db.Text)  # JSON string with away team stats
    
    # Other game details
    arena = db.Column(db.String(100))
    attendance = db.Column(db.Integer)
    season_id = db.Column(db.Integer)
    season_type = db.Column(db.String(20), default='regular')  # regular, playoffs, preseason
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    home_team = db.relationship('Team', foreign_keys=[home_team_id], back_populates='home_games')
    away_team = db.relationship('Team', foreign_keys=[away_team_id], back_populates='away_games')
    
    def __repr__(self):
        return f'<Game {self.id}: {self.away_team.abbreviation} @ {self.home_team.abbreviation}>'
    
    def to_dict(self):
        """Convert Game object to dictionary"""
        
        # Parse JSON strings to dictionaries
        period_data_dict = {}
        home_stats_dict = {}
        away_stats_dict = {}
        
        try:
            if self.period_data:
                period_data_dict = json.loads(self.period_data)
            if self.home_stats:
                home_stats_dict = json.loads(self.home_stats)
            if self.away_stats:
                away_stats_dict = json.loads(self.away_stats)
        except json.JSONDecodeError:
            # If JSON is invalid, use empty dict
            pass
            
        return {
            'id': self.id,
            'home_team_id': self.home_team_id,
            'away_team_id': self.away_team_id,
            'home_team': self.home_team.abbreviation if self.home_team else None,
            'away_team': self.away_team.abbreviation if self.away_team else None,
            'status': self.status,
            'date': self.date.isoformat() if self.date else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'home_score': self.home_score,
            'away_score': self.away_score,
            'period_data': period_data_dict,
            'home_stats': home_stats_dict,
            'away_stats': away_stats_dict,
            'arena': self.arena,
            'attendance': self.attendance,
            'season_id': self.season_id,
            'season_type': self.season_type
        }
    
    def set_period_data(self, period_data):
        """Set period data as JSON string"""
        self.period_data = json.dumps(period_data)
    
    def set_home_stats(self, stats):
        """Set home team stats as JSON string"""
        self.home_stats = json.dumps(stats)
    
    def set_away_stats(self, stats):
        """Set away team stats as JSON string"""
        self.away_stats = json.dumps(stats)
