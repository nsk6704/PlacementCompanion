from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, JSON
from datetime import datetime

class StudentCheckIn(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    department: str
    cgpa: str
    stage: str
    prep_hours: str
    prep_consistency: str
    stress: int
    coping: str
    user_email: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Anxiety indicators (1-5 Likert scale)
    anxiety_thinking: Optional[int] = Field(default=None)  # "I feel anxious when thinking about placements"
    anxiety_overwhelmed: Optional[int] = Field(default=None)  # "I feel overwhelmed by preparation required"
    anxiety_rejections: Optional[int] = Field(default=None)  # "Rejections negatively affect my motivation"
    anxiety_peer_comparison: Optional[int] = Field(default=None)  # "Comparing with peers increases pressure"
    anxiety_concentration: Optional[int] = Field(default=None)  # "Hard to concentrate due to stress"
    
    # Burnout indicators (1-5 Likert scale)
    burnout_sleep: Optional[int] = Field(default=None)  # "Reduced sleep quality"
    burnout_exhaustion: Optional[int] = Field(default=None)  # "Mental exhaustion even after rest"
    burnout_motivation: Optional[int] = Field(default=None)  # "Loss of motivation"
    burnout_physical: Optional[int] = Field(default=None)  # "Physical fatigue or headaches"
    
    # Additional placement context
    applications_count: Optional[str] = Field(default=None)  # Range: "0-10", "11-25", "26-50", "50+"
    challenging_stage: Optional[str] = Field(default=None)  # "online_tests", "technical", "hr", "all_equally"

class SurveyMetadata(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True) # e.g., "survey_distributions"
    data: dict = Field(sa_column=Column(JSON))

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    branch: Optional[str] = Field(default=None)  # e.g., "CSE", "ECE", "MECH"
