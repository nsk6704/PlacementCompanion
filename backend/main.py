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
from datetime import timedelta

# Pydantic models for request bodies
class UserCreate(BaseModel):
    email: str
    password: str

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
        # MIGRATION: Ensure user_email column exists
        try:
            from sqlalchemy import inspect, String
            inspector = inspect(engine)
            columns = [col['name'] for col in inspector.get_columns('studentcheckin')]
            
            if 'user_email' not in columns:
                print("Adding user_email column to studentcheckin table...")
                from sqlalchemy import text
                session.exec(text("ALTER TABLE studentcheckin ADD COLUMN user_email VARCHAR"))
                session.commit()
                print("Migration: Added user_email column successfully.")
            else:
                print("Migration: user_email column already exists.")
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
    db_user = User(email=user.email, hashed_password=hashed_password)
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

@app.post("/check-in", response_model=StudentCheckIn)
def create_check_in(check_in: StudentCheckIn, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
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
