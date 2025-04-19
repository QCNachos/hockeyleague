from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class PlayerAttributes(BaseModel):
    skating: Optional[int] = 0
    shooting: Optional[int] = 0
    puck_skills: Optional[int] = 0
    physical: Optional[int] = 0
    defense: Optional[int] = 0
    
    # Goalie attributes
    agility: Optional[int] = 0
    positioning: Optional[int] = 0
    reflexes: Optional[int] = 0
    puck_control: Optional[int] = 0
    mental: Optional[int] = 0

class Player(BaseModel):
    id: Optional[int] = None
    first_name: str
    last_name: str
    jersey: int
    position_primary: str
    position_secondary: Optional[str] = None
    team: str
    overall_rating: int
    player_type: str
    
    # Physical attributes
    height: Optional[int] = None  # in cm
    weight: Optional[int] = None  # in kg
    shooting: Optional[str] = "L"  # L or R
    
    # Performance attributes
    skating: Optional[int] = 0
    shooting_skill: Optional[int] = 0
    puck_skills: Optional[int] = 0
    physical: Optional[int] = 0
    defense: Optional[int] = 0
    
    # Goalie attributes
    agility: Optional[int] = 0
    positioning: Optional[int] = 0
    reflexes: Optional[int] = 0
    puck_control: Optional[int] = 0
    mental: Optional[int] = 0
    
    # Status
    injury_status: Optional[str] = None  # IR, DTD, OUT
    return_timeline: Optional[str] = None
    
    class Config:
        orm_mode = True
        
    def to_chemistry_format(self) -> Dict[str, Any]:
        """Convert player to format expected by ChemistryCalculator"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'name': f'{self.first_name} {self.last_name}',
            'position': self.position_primary,
            'position_primary': self.position_primary,
            'position_secondary': self.position_secondary,
            'player_type': self.player_type,
            'overall': self.overall_rating,
            'number': self.jersey,
            'weight': self.weight,
            'height': self.height,
            'shooting': self.shooting,
            'team': self.team,
            'attributes': {
                'skating': self.skating,
                'shooting': self.shooting_skill,
                'hands': self.puck_skills,
                'checking': self.physical,
                'defense': self.defense,
                # Goalie attributes
                'agility': self.agility,
                'positioning': self.positioning,
                'reflexes': self.reflexes,
                'puck_control': self.puck_control,
                'mental': self.mental
            }
        }
