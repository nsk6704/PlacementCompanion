from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import json
import os
from contextlib import asynccontextmanager

from database import create_db_and_tables, get_session, engine
from models import SurveyMetadata, StudentCheckIn

# Load distributions on startup
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "survey_distributions.json")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create DB and Load Data
    create_db_and_tables()
    
    with Session(engine) as session:
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
    allow_origins=["http://localhost:3000"],
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

@app.post("/check-in")
def create_check_in(check_in: StudentCheckIn, session: Session = Depends(get_session)):
    session.add(check_in)
    session.commit()
    session.refresh(check_in)
    return check_in
