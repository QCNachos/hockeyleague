from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..extensions import db
from datetime import datetime

# Create a blueprint for league endpoints
league_bp = Blueprint('league', __name__)

# League model definition
class League(db.Model):
    """
    Model representing a hockey league.
    """
    __tablename__ = 'leagues'

    id = db.Column(db.Integer, primary_key=True)
    league = db.Column(db.String(100), nullable=False, unique=True)
    abbreviation = db.Column(db.String(10), nullable=True)
    league_level = db.Column(db.String(50), nullable=False)  # Pro, Junior, Minor, etc.
    country = db.Column(db.String(100), nullable=True)
    league_strength = db.Column(db.Integer, nullable=True)  # Value from 0-100 representing league strength
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - remove the backref to avoid conflict
    teams = db.relationship('Team', back_populates='league_object')
    
    def __repr__(self):
        return f'<League {self.league}>'
    
    def to_dict(self):
        """
        Convert the league object to a dictionary.
        """
        return {
            'id': self.id,
            'league': self.league,
            'abbreviation': self.abbreviation,
            'league_level': self.league_level,
            'country': self.country,
            'league_strength': self.league_strength,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

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
    
    # Relationships - Use back_populates instead of backref
    teams = db.relationship('Team', back_populates='division_obj', lazy=True)
    
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
        Get all conferences from Supabase.
        
        Returns:
            List of conferences as dictionaries
        """
        import os
        from supabase import create_client, Client
        import logging
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        # Get Supabase credentials
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        try:
            if not SUPABASE_URL or not SUPABASE_KEY:
                logger.error("Supabase credentials not configured")
                # Fallback to local database
                conferences = [conference.to_dict() for conference in Conference.query.all()]
                return conferences
            
            # Initialize Supabase client
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Query conferences table
            response = supabase.table("Conference").select("*").execute()
            
            if response.data:
                logger.info(f"Fetched {len(response.data)} conferences from Supabase")
                
                # Map Supabase fields to our model structure
                conferences = []
                for conf_data in response.data:
                    conferences.append({
                        'id': conf_data.get('id'),
                        'name': conf_data.get('conference'),
                        'abbreviation': conf_data.get('abbreviation'),
                        'league': conf_data.get('league'),
                        'active': True  # Default value
                    })
                return conferences
            else:
                logger.warning("No conferences found in Supabase")
                # Fallback to local database
                conferences = [conference.to_dict() for conference in Conference.query.all()]
                return conferences
                
        except Exception as e:
            logger.error(f"Error fetching conferences from Supabase: {e}")
            # Try to get conferences from local database as fallback
            try:
                conferences = [conference.to_dict() for conference in Conference.query.all()]
                return conferences
            except Exception as db_error:
                logger.error(f"Error fetching conferences from local database: {db_error}")
                return []
    
    @staticmethod
    def get_conference_by_id(conference_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific conference by ID from Supabase.
        
        Args:
            conference_id: The ID of the conference to retrieve
            
        Returns:
            Conference as dictionary, or None if not found
        """
        import os
        from supabase import create_client, Client
        import logging
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        # Get Supabase credentials
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        try:
            if not SUPABASE_URL or not SUPABASE_KEY:
                logger.error("Supabase credentials not configured")
                # Fallback to local database
                conference = Conference.query.get(conference_id)
                return conference.to_dict() if conference else None
            
            # Initialize Supabase client
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Query conference by ID
            response = supabase.table("Conference").select("*").eq("id", conference_id).execute()
            
            if response.data and len(response.data) > 0:
                conf_data = response.data[0]
                logger.info(f"Found conference with ID {conference_id}")
                
                return {
                    'id': conf_data.get('id'),
                    'name': conf_data.get('conference'),
                    'abbreviation': conf_data.get('abbreviation'),
                    'league': conf_data.get('league'),
                    'active': True  # Default value
                }
            else:
                logger.warning(f"Conference with ID {conference_id} not found in Supabase")
                # Fallback to local database
                conference = Conference.query.get(conference_id)
                return conference.to_dict() if conference else None
                
        except Exception as e:
            logger.error(f"Error fetching conference from Supabase: {e}")
            # Try to get conference from local database as fallback
            try:
                conference = Conference.query.get(conference_id)
                return conference.to_dict() if conference else None
            except Exception as db_error:
                logger.error(f"Error fetching conference from local database: {db_error}")
                return None
    
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
        Get all divisions from Supabase.
        
        Returns:
            List of divisions as dictionaries
        """
        import os
        from supabase import create_client, Client
        import logging
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        # Get Supabase credentials
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        try:
            if not SUPABASE_URL or not SUPABASE_KEY:
                logger.error("Supabase credentials not configured")
                # Fallback to local database
                divisions = [division.to_dict() for division in Division.query.all()]
                return divisions
            
            # Initialize Supabase client
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Query divisions table
            response = supabase.table("Division").select("*").execute()
            
            if response.data:
                logger.info(f"Fetched {len(response.data)} divisions from Supabase")
                
                # Map Supabase fields to our model structure
                divisions = []
                for div_data in response.data:
                    divisions.append({
                        'id': div_data.get('id'),
                        'name': div_data.get('division'),
                        'abbreviation': div_data.get('abbreviation'),
                        'conference_id': div_data.get('conference'),
                        'league': div_data.get('league'),
                        'active': True  # Default value
                    })
                return divisions
            else:
                logger.warning("No divisions found in Supabase")
                # Fallback to local database
                divisions = [division.to_dict() for division in Division.query.all()]
                return divisions
                
        except Exception as e:
            logger.error(f"Error fetching divisions from Supabase: {e}")
            # Try to get divisions from local database as fallback
            try:
                divisions = [division.to_dict() for division in Division.query.all()]
                return divisions
            except Exception as db_error:
                logger.error(f"Error fetching divisions from local database: {db_error}")
                return []
    
    @staticmethod
    def get_divisions_by_conference(conference_id: int) -> List[Dict[str, Any]]:
        """
        Get all divisions in a conference from Supabase.
        
        Args:
            conference_id: The ID of the conference
            
        Returns:
            List of divisions as dictionaries
        """
        import os
        from supabase import create_client, Client
        import logging
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        # Get Supabase credentials
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        try:
            if not SUPABASE_URL or not SUPABASE_KEY:
                logger.error("Supabase credentials not configured")
                # Fallback to local database
                divisions = [division.to_dict() for division in Division.query.filter_by(conference_id=conference_id).all()]
                return divisions
            
            # Initialize Supabase client
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Query divisions by conference ID
            response = supabase.table("Division").select("*").eq("conference", conference_id).execute()
            
            if response.data:
                logger.info(f"Fetched {len(response.data)} divisions for conference ID {conference_id} from Supabase")
                
                # Map Supabase fields to our model structure
                divisions = []
                for div_data in response.data:
                    divisions.append({
                        'id': div_data.get('id'),
                        'name': div_data.get('division'),
                        'abbreviation': div_data.get('abbreviation'),
                        'conference_id': div_data.get('conference'),
                        'league': div_data.get('league'),
                        'active': True  # Default value
                    })
                return divisions
            else:
                logger.warning(f"No divisions found for conference ID {conference_id} in Supabase")
                # Fallback to local database
                divisions = [division.to_dict() for division in Division.query.filter_by(conference_id=conference_id).all()]
                return divisions
                
        except Exception as e:
            logger.error(f"Error fetching divisions for conference ID {conference_id} from Supabase: {e}")
            # Try to get divisions from local database as fallback
            try:
                divisions = [division.to_dict() for division in Division.query.filter_by(conference_id=conference_id).all()]
                return divisions
            except Exception as db_error:
                logger.error(f"Error fetching divisions for conference ID {conference_id} from local database: {db_error}")
                return []
    
    @staticmethod
    def get_division_by_id(division_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific division by ID from Supabase.
        
        Args:
            division_id: The ID of the division to retrieve
            
        Returns:
            Division as dictionary, or None if not found
        """
        import os
        from supabase import create_client, Client
        import logging
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        # Get Supabase credentials
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        try:
            if not SUPABASE_URL or not SUPABASE_KEY:
                logger.error("Supabase credentials not configured")
                # Fallback to local database
                division = Division.query.get(division_id)
                return division.to_dict() if division else None
            
            # Initialize Supabase client
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Query division by ID
            response = supabase.table("Division").select("*").eq("id", division_id).execute()
            
            if response.data and len(response.data) > 0:
                div_data = response.data[0]
                logger.info(f"Found division with ID {division_id}")
                
                return {
                    'id': div_data.get('id'),
                    'name': div_data.get('division'),
                    'abbreviation': div_data.get('abbreviation'),
                    'conference_id': div_data.get('conference'),
                    'league': div_data.get('league'),
                    'active': True  # Default value
                }
            else:
                logger.warning(f"Division with ID {division_id} not found in Supabase")
                # Fallback to local database
                division = Division.query.get(division_id)
                return division.to_dict() if division else None
                
        except Exception as e:
            logger.error(f"Error fetching division from Supabase: {e}")
            # Try to get division from local database as fallback
            try:
                division = Division.query.get(division_id)
                return division.to_dict() if division else None
            except Exception as db_error:
                logger.error(f"Error fetching division from local database: {db_error}")
                return None
    
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


class LeagueService:
    """
    Service for managing leagues.
    """
    
    @staticmethod
    def get_all_leagues() -> List[Dict[str, Any]]:
        """
        Get all leagues from Supabase.
        
        Returns:
            List of leagues as dictionaries
        """
        import os
        from supabase import create_client, Client
        import logging
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        # Get Supabase credentials
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        try:
            if not SUPABASE_URL or not SUPABASE_KEY:
                logger.error("Supabase credentials not configured")
                # Fallback to local database (will be empty if tables not created)
                leagues = [league.to_dict() for league in League.query.all()]
                return leagues
            
            # Initialize Supabase client
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Query leagues table
            response = supabase.table("League").select("*").execute()
            
            if response.data:
                logger.info(f"Fetched {len(response.data)} leagues from Supabase")
                
                # Map Supabase fields to our model structure
                leagues = []
                for league_data in response.data:
                    leagues.append({
                        'id': league_data.get('id'),
                        'league': league_data.get('league'),
                        'abbreviation': league_data.get('abbreviation'),
                        'league_level': league_data.get('league_level'),
                        'country': league_data.get('country'),
                        'league_strength': league_data.get('league_strength'),
                        'active': league_data.get('active', True)
                    })
                return leagues
            else:
                logger.warning("No leagues found in Supabase")
                # Fallback to local database
                leagues = [league.to_dict() for league in League.query.all()]
                return leagues
                
        except Exception as e:
            logger.error(f"Error fetching leagues from Supabase: {e}")
            # Try to get leagues from local database as fallback
            try:
                leagues = [league.to_dict() for league in League.query.all()]
                return leagues
            except Exception as db_error:
                logger.error(f"Error fetching leagues from local database: {db_error}")
                return []
    
    @staticmethod
    def get_leagues_by_level(level: str) -> List[Dict[str, Any]]:
        """
        Get leagues by level (Pro, Junior, etc.) from Supabase
        
        Args:
            level: The level of leagues to retrieve (e.g., "Pro", "Junior")
            
        Returns:
            List of leagues as dictionaries
        """
        import os
        from supabase import create_client, Client
        import logging
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        # Get Supabase credentials
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        
        try:
            if not SUPABASE_URL or not SUPABASE_KEY:
                logger.error("Supabase credentials not configured")
                return []
            
            # Initialize Supabase client
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Query leagues table with level filter
            response = supabase.table("League").select("*").eq("league_level", level).execute()
            
            if response.data:
                logger.info(f"Fetched {len(response.data)} leagues with level {level} from Supabase")
                
                # Map Supabase fields to our model structure
                leagues = []
                for league_data in response.data:
                    leagues.append({
                        'id': league_data.get('id'),
                        'league': league_data.get('league'),
                        'abbreviation': league_data.get('abbreviation'),
                        'league_level': league_data.get('league_level'),
                        'country': league_data.get('country'),
                        'league_strength': league_data.get('league_strength'),
                        'active': league_data.get('active', True)
                    })
                return leagues
            else:
                logger.warning(f"No leagues with level {level} found in Supabase")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching leagues from Supabase: {e}")
            return []
    
    @staticmethod
    def get_league_by_id(league_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific league by ID.
        
        Args:
            league_id: The ID of the league to retrieve
            
        Returns:
            League as dictionary, or None if not found
        """
        league = League.query.get(league_id)
        return league.to_dict() if league else None
    
    @staticmethod
    def get_league_by_abbreviation(abbreviation: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific league by abbreviation.
        
        Args:
            abbreviation: The abbreviation of the league to retrieve
            
        Returns:
            League as dictionary, or None if not found
        """
        league = League.query.filter_by(abbreviation=abbreviation).first()
        return league.to_dict() if league else None
    
    # The following methods are for internal use only and not exposed via API endpoints
    @staticmethod
    def create_league(league_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new league.
        
        Args:
            league_data: Dictionary with league data
            
        Returns:
            Created league as dictionary
        """
        new_league = League(
            league=league_data.get('league'),
            abbreviation=league_data.get('abbreviation'),
            league_level=league_data.get('league_level'),
            country=league_data.get('country'),
            league_strength=league_data.get('league_strength'),
            active=league_data.get('active', True)
        )
        
        db.session.add(new_league)
        db.session.commit()
        
        return new_league.to_dict()
    
    @staticmethod
    def update_league(league_id: int, league_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update an existing league.
        
        Args:
            league_id: The ID of the league to update
            league_data: Dictionary with updated league data
            
        Returns:
            Updated league as dictionary, or None if not found
        """
        league = League.query.get(league_id)
        if not league:
            return None
            
        # Update league attributes
        for key, value in league_data.items():
            if hasattr(league, key):
                setattr(league, key, value)
        
        db.session.commit()
        
        return league.to_dict()
    
    @staticmethod
    def delete_league(league_id: int) -> bool:
        """
        Delete a league.
        
        Args:
            league_id: The ID of the league to delete
            
        Returns:
            Boolean indicating success
        """
        league = League.query.get(league_id)
        if not league:
            return False
            
        db.session.delete(league)
        db.session.commit()
        
        return True


# API endpoints for conferences

@league_bp.route('/conferences', methods=['GET'])
def get_conferences():
    """Get all conferences"""
    try:
        conferences = ConferenceService.get_all_conferences()
        
        if not conferences:
            # Return empty array instead of error if no conferences found
            return jsonify([]), 200
            
        return jsonify(conferences), 200
    except Exception as e:
        import logging
        logging.error(f"Error in get_conferences endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@league_bp.route('/conferences/<int:conference_id>', methods=['GET'])
def get_conference(conference_id):
    """Get a specific conference by ID"""
    try:
        conference = ConferenceService.get_conference_by_id(conference_id)
        
        if not conference:
            return jsonify({"error": f"Conference with ID {conference_id} not found"}), 404
            
        return jsonify(conference), 200
    except Exception as e:
        import logging
        logging.error(f"Error in get_conference endpoint: {e}")
        return jsonify({"error": str(e)}), 500

# Note: Create/Update/Delete operations for conferences should be performed directly in Supabase


# API endpoints for divisions

@league_bp.route('/divisions', methods=['GET'])
def get_divisions():
    """Get all divisions or filter by conference ID"""
    try:
        conference_id = request.args.get('conference_id')
        
        if conference_id:
            divisions = DivisionService.get_divisions_by_conference(int(conference_id))
        else:
            divisions = DivisionService.get_all_divisions()
            
        if not divisions:
            # Return empty array instead of error if no divisions found
            return jsonify([]), 200
            
        return jsonify(divisions), 200
    except Exception as e:
        import logging
        logging.error(f"Error in get_divisions endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@league_bp.route('/divisions/<int:division_id>', methods=['GET'])
def get_division(division_id):
    """Get a specific division by ID"""
    try:
        division = DivisionService.get_division_by_id(division_id)
        
        if not division:
            return jsonify({"error": f"Division with ID {division_id} not found"}), 404
            
        return jsonify(division), 200
    except Exception as e:
        import logging
        logging.error(f"Error in get_division endpoint: {e}")
        return jsonify({"error": str(e)}), 500

# Note: Create/Update/Delete operations for divisions should be performed directly in Supabase


# API endpoints for leagues

@league_bp.route('/', methods=['GET'])
def get_all_leagues():
    """
    Get all leagues.
    This endpoint matches the frontend's expected API path: /api/leagues
    """
    try:
        level = request.args.get('level')

        if level:
            leagues = LeagueService.get_leagues_by_level(level)
        else:
            leagues = LeagueService.get_all_leagues()
        
        if not leagues:
            # Return empty array instead of error if no leagues found
            return jsonify([]), 200
            
        return jsonify(leagues), 200
    except Exception as e:
        import logging
        logging.error(f"Error in get_all_leagues endpoint: {e}")
        return jsonify({"error": str(e)}), 500


@league_bp.route('/leagues/<int:league_id>', methods=['GET'])
def get_league(league_id):
    """Get a specific league by ID"""
    league = LeagueService.get_league_by_id(league_id)
    
    if not league:
        return jsonify({"error": f"League with ID {league_id} not found"}), 404
        
    return jsonify(league), 200


@league_bp.route('/leagues/abbreviation/<string:abbreviation>', methods=['GET'])
def get_league_by_abbreviation(abbreviation):
    """Get a specific league by abbreviation"""
    league = LeagueService.get_league_by_abbreviation(abbreviation.upper())
    
    if not league:
        return jsonify({"error": f"League with abbreviation {abbreviation} not found"}), 404
        
    return jsonify(league), 200

# Note: Create/Update/Delete operations for leagues should be performed directly in Supabase
# These API endpoints have been intentionally removed as they're not needed by the frontend
# and could pose security risks if exposed unnecessarily.
#
# If you need to modify league data, please use the Supabase dashboard or
# SQL functions through the proper administrative channels.
