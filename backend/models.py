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
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SurveyMetadata(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True) # e.g., "survey_distributions"
    data: dict = Field(sa_column=Column(JSON))
