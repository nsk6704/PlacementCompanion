# Placement Companion

Placement Companion is a mental health and placement-preparation tracking platform for students. It combines daily reflections with comparative analytics and evidence-based guidance, grounded in research with 130+ students across departments.

## Overview

The platform helps students navigate placement season by turning day-to-day check-ins into practical, personalized insights. Users record stress levels, preparation habits, and context (department, CGPA range, placement stage), then receive benchmarks, trends, and recommended actions based on population data.

## Key Capabilities

- Secure JWT-based authentication and protected user data
- Four-step daily check-in flow capturing stress, preparation, and coping strategies
- Personalized analytics with percentile ranking, trends, and visual charts
- Evidence-based recommendations prioritized by impact
- Department and stage-specific comparisons using research benchmarks

## Tech Stack

Frontend

- Next.js 16 (React 19, App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Plotly.js
- Radix UI

Backend

- FastAPI (Python)
- SQLModel (SQLAlchemy + Pydantic)
- PostgreSQL (Neon)
- JWT authentication
- Bcrypt password hashing

## Getting Started

Prerequisites

- Node.js 20+
- Python 3.13+
- PostgreSQL database

Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://user:password@host/database
SECRET_KEY=your-secret-key-here
```

Run the API server:

```bash
uvicorn main:app --reload
```

API runs at `http://127.0.0.1:8000`.

Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Project Structure

```
DTSEL/
├── backend/
│   ├── main.py              # FastAPI app and routes
│   ├── models.py            # Database models
│   ├── database.py          # DB connection
│   ├── auth.py              # Auth and token logic
│   ├── insights_engine.py   # Analytics and recommendations
│   └── data/
│       └── survey_distributions.json
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router routes
│   │   ├── components/      # Layout, UI, dashboards
│   │   ├── lib/             # API client and insights helpers
│   │   └── data/            # Insight messages
│   └── package.json
└── README.md
```

## API Endpoints

Authentication

- `POST /auth/register` Create a new account
- `POST /auth/login` Authenticate and receive a JWT

Check-ins

- `POST /check-in` Submit a daily check-in (protected)
- `GET /check-ins` Fetch user check-in history (protected)

Insights

- `GET /insights/personalized` Personalized analytics (protected)
- `GET /insights/distributions` Population benchmarks

## Research Foundation

The insights engine is derived from survey data across departments (e.g., CS/IT, Electrical, Mechanical), CGPA ranges, and placement stages. The benchmarks are used to generate percentile comparisons, identify stress trends, and recommend interventions supported by the data.

## Security and Privacy

- JWT authentication for API access
- Passwords are hashed with bcrypt
- Only aggregated, anonymized distributions are used for benchmarks

## Contributing

Pull requests are welcome. For significant changes, open an issue to discuss scope and approach first.

## License

MIT License. See `LICENSE` for details.

## Acknowledgments

- Research participants who shared placement journey data
- Open source community for the libraries used

---

Note: This is a mental health support tool. If you are experiencing severe stress or anxiety, please reach out to a qualified mental health professional.
