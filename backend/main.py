from typing import List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import json
import os
from contextlib import asynccontextmanager
from pydantic import BaseModel

from database import create_db_and_tables, get_session, engine
from models import SurveyMetadata, StudentCheckIn, User
from auth import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import datetime, timedelta

# Pydantic models for request bodies
class UserCreate(BaseModel):
    email: str
    password: str
    branch: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Load distributions on startup
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "survey_distributions.json")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create DB and Load Data
    create_db_and_tables()
    
    with Session(engine) as session:
        # MIGRATION: Ensure all new columns exist
        try:
            from sqlalchemy import inspect, String, Integer
            from sqlalchemy import text
            inspector = inspect(engine)
            
            # Check StudentCheckIn table columns
            # In Postgres, table names are usually lowercase. Using "studentcheckin" without quotes for inspector
            checkin_columns = [col['name'] for col in inspector.get_columns('studentcheckin')]
            
            # Migrate user_email if needed
            if 'user_email' not in checkin_columns:
                print("Adding user_email column to studentcheckin table...")
                session.exec(text('ALTER TABLE "studentcheckin" ADD COLUMN user_email VARCHAR'))
                session.commit()
                print("Migration: Added user_email column successfully.")
            
            # Migrate anxiety indicator columns
            anxiety_columns = [
                'anxiety_thinking', 'anxiety_overwhelmed', 'anxiety_rejections',
                'anxiety_peer_comparison', 'anxiety_concentration'
            ]
            for col in anxiety_columns:
                if col not in checkin_columns:
                    print(f"Adding {col} column to studentcheckin table...")
                    session.exec(text(f'ALTER TABLE "studentcheckin" ADD COLUMN {col} INTEGER'))
                    session.commit()
            
            # Migrate burnout indicator columns
            burnout_columns = [
                'burnout_sleep', 'burnout_exhaustion', 'burnout_motivation', 'burnout_physical'
            ]
            for col in burnout_columns:
                if col not in checkin_columns:
                    print(f"Adding {col} column to studentcheckin table...")
                    session.exec(text(f'ALTER TABLE "studentcheckin" ADD COLUMN {col} INTEGER'))
                    session.commit()
            
            # Migrate additional context columns
            if 'applications_count' not in checkin_columns:
                print("Adding applications_count column to studentcheckin table...")
                session.exec(text('ALTER TABLE "studentcheckin" ADD COLUMN applications_count VARCHAR'))
                session.commit()
            
            if 'challenging_stage' not in checkin_columns:
                print("Adding challenging_stage column to studentcheckin table...")
                session.exec(text('ALTER TABLE "studentcheckin" ADD COLUMN challenging_stage VARCHAR'))
                session.commit()
            
            # Check User table columns
            # Use "user" in quotes for Postgres because it's a reserved word
            user_columns = [col['name'] for col in inspector.get_columns('user')]
            
            # Migrate branch column to User table
            if 'branch' not in user_columns:
                print("Adding branch column to user table...")
                session.exec(text('ALTER TABLE "user" ADD COLUMN branch VARCHAR'))
                session.commit()
                print("Migration: Added branch column successfully.")
            
            print("All migrations completed successfully.")
        except Exception as e:
            print(f"Migration warning: {e}")
            session.rollback()

        statement = select(SurveyMetadata).where(SurveyMetadata.key == "survey_distributions")
        result = session.exec(statement).first()
        
        if not result:
            print("Loading initial survey data into database...")
            try:
                with open(DATA_PATH, "r") as f:
                    dist_data = json.load(f)
                
                survey_meta = SurveyMetadata(key="survey_distributions", data=dist_data)
                session.add(survey_meta)
                session.commit()
                print("Survey distributions loaded successfully.")
            except Exception as e:
                print(f"Error loading initial data: {e}")
        else:
            print("Survey distributions already exist in database.")
    
    yield
    # Shutdown logic if needed

app = FastAPI(title="Placement Companion API", lifespan=lifespan)

# Allow CORS for frontend
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Placement Companion API is running"}

@app.get("/insights/distributions")
def get_distributions(session: Session = Depends(get_session)):
    statement = select(SurveyMetadata).where(SurveyMetadata.key == "survey_distributions")
    result = session.exec(statement).first()
    
    if not result:
        raise HTTPException(status_code=500, detail="Data not loaded")
    return result.data

@app.post("/insights/analyze")
def analyze_profile(stress: int, session: Session = Depends(get_session), department: str = None):
    """
    Simple analysis endpoint. 
    In the future, this will return percentiles based on the user's input.
    """
    statement = select(SurveyMetadata).where(SurveyMetadata.key == "survey_distributions")
    result = session.exec(statement).first()
    
    if not result:
         raise HTTPException(status_code=500, detail="Data not loaded")
    
    distributions = result.data
    
    # Example logic: Compare user stress to overall mean
    overall_mean = distributions["overall"]["anxiety"]["mean"]
    
    analysis = {
        "your_stress": stress,
        "population_mean": overall_mean,
        "status": "High" if stress > overall_mean else "Low/Normal"
    }
    return analysis

@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password, branch=user.branch)
    session.add(db_user)
    session.commit()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username) # OAuth2 form sends username/password
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "branch": current_user.branch,
        "is_active": current_user.is_active
    }


@app.get("/check-in/status")
def get_check_in_status(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Check if the user has already checked in today"""
    # Get user's latest check-in
    statement = select(StudentCheckIn).where(StudentCheckIn.user_email == current_user.email).order_by(StudentCheckIn.created_at.desc())
    latest_checkin = session.exec(statement).first()
    
    if not latest_checkin:
        return {"can_check_in": True, "last_check_in": None}
    
    # Check if latest check-in was today (UTC)
    now = datetime.utcnow()
    last_date = latest_checkin.created_at
    
    is_same_day = (now.year == last_date.year and 
                  now.month == last_date.month and 
                  now.day == last_date.day)
    
    return {
        "can_check_in": not is_same_day, 
        "last_check_in": last_date.isoformat(),
        "next_allowed": (datetime(now.year, now.month, now.day) + timedelta(days=1)).isoformat()
    }

@app.post("/check-in", response_model=StudentCheckIn)
def create_check_in(check_in: StudentCheckIn, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Check if already checked in today
    statement = select(StudentCheckIn).where(StudentCheckIn.user_email == current_user.email).order_by(StudentCheckIn.created_at.desc())
    latest_checkin = session.exec(statement).first()
    
    if latest_checkin:
        now = datetime.utcnow()
        last_date = latest_checkin.created_at
        if (now.year == last_date.year and now.month == last_date.month and now.day == last_date.day):
            raise HTTPException(status_code=400, detail="You have already checked in today. Please come back tomorrow!")

    check_in.user_email = current_user.email
    session.add(check_in)
    session.commit()
    session.refresh(check_in)
    return check_in

@app.get("/check-ins", response_model=List[StudentCheckIn])
def read_check_ins(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(StudentCheckIn).where(StudentCheckIn.user_email == current_user.email).order_by(StudentCheckIn.created_at.desc())
    results = session.exec(statement).all()
    return results

@app.get("/insights/personalized")
def get_personalized_insights(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    Generate personalized insights based on user's check-in history and population data
    """
    from insights_engine import generate_personalized_insights
    
    # Get user's check-ins
    statement = select(StudentCheckIn).where(StudentCheckIn.user_email == current_user.email).order_by(StudentCheckIn.created_at)
    checkins = session.exec(statement).all()
    
    # Convert to dict format for insights engine
    checkins_data = [
        {
            "stress": c.stress,
            "department": c.department,
            "cgpa": c.cgpa,
            "stage": c.stage,
            "prep_hours": c.prep_hours,
            "prep_consistency": c.prep_consistency,
            "coping": c.coping,
            "created_at": c.created_at.isoformat(),
            # Anxiety indicators
            "anxiety_thinking": c.anxiety_thinking,
            "anxiety_overwhelmed": c.anxiety_overwhelmed,
            "anxiety_rejections": c.anxiety_rejections,
            "anxiety_peer_comparison": c.anxiety_peer_comparison,
            "anxiety_concentration": c.anxiety_concentration,
            # Burnout indicators
            "burnout_sleep": c.burnout_sleep,
            "burnout_exhaustion": c.burnout_exhaustion,
            "burnout_motivation": c.burnout_motivation,
            "burnout_physical": c.burnout_physical,
            # Additional context
            "applications_count": c.applications_count,
            "challenging_stage": c.challenging_stage
        }
        for c in checkins
    ]
    
    # Get survey distributions
    dist_statement = select(SurveyMetadata).where(SurveyMetadata.key == "survey_distributions")
    dist_result = session.exec(dist_statement).first()
    
    if not dist_result:
        raise HTTPException(status_code=500, detail="Survey data not available")
    
    # Generate insights
    insights = generate_personalized_insights(checkins_data, dist_result.data)
    
    return insights
