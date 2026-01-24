# 🎓 Placement Companion

A mental health and placement preparation tracking platform for students, powered by research with 130+ students across departments.

## 📊 About

Placement Companion helps students navigate the stressful placement season by providing:
- **Personalized insights** based on your check-in history
- **Comparative analytics** showing how you compare to peers
- **Trend detection** to spot patterns early
- **Evidence-based recommendations** for stress management

Built on real data from 130+ students, this platform transforms placement anxiety into actionable insights.

## ✨ Features

### 🔐 Authentication
- Secure JWT-based authentication
- User registration and login
- Protected routes and personalized data

### 📝 Daily Check-Ins
- Quick 4-step reflection process
- Track stress levels, preparation habits, and coping strategies
- Academic context (department, CGPA, placement stage)

### 📈 Intelligent Dashboard
- **You vs. Peers**: See your percentile ranking and comparisons
- **Trend Analysis**: Detect if stress is increasing, decreasing, or stable
- **Stress Charts**: Visualize your journey over time
- **Prep Distribution**: Understand your preparation patterns
- **Smart Recommendations**: Priority-ranked, actionable advice

### 🧠 Personalized Insights
- Comparative analysis against population benchmarks
- Pattern detection (stress spikes, consistency tracking)
- Department and stage-specific comparisons
- Evidence-based guidance

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (React 19, App Router)
- **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Plotly.js** for data visualization
- **Radix UI** components

### Backend
- **FastAPI** (Python)
- **SQLModel** (SQLAlchemy + Pydantic)
- **PostgreSQL** (Neon Database)
- **JWT** authentication
- **Bcrypt** password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.13+
- PostgreSQL database (Neon recommended)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install fastapi uvicorn sqlmodel psycopg2-binary asyncpg python-dotenv passlib[bcrypt] python-jose python-multipart
   ```

4. **Create `.env` file**
   ```env
   DATABASE_URL=postgresql://user:password@host/database
   SECRET_KEY=your-secret-key-here
   ```

5. **Run the server**
   ```bash
   uvicorn main:app --reload
   ```

   Backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
DTSEL/
├── backend/
│   ├── main.py              # FastAPI app & endpoints
│   ├── models.py            # Database models
│   ├── database.py          # Database connection
│   ├── auth.py              # Authentication logic
│   ├── insights_engine.py   # Analytics & recommendations
│   └── data/
│       └── survey_distributions.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── login/             # Login page
│   │   │   ├── register/          # Registration page
│   │   │   ├── check-in/          # Check-in flow
│   │   │   ├── dashboard/         # Analytics dashboard
│   │   │   └── guide/             # Guidance resources
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, Footer
│   │   │   ├── ui/                # Reusable UI components
│   │   │   └── dashboard/         # Chart components
│   │   ├── lib/
│   │   │   ├── api.ts             # API client
│   │   │   └── insightsEngine.ts  # Frontend insights
│   │   └── data/
│   │       └── insights/          # Insight messages
│   └── package.json
└── README.md
```

## 🔑 Key Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get JWT token

### Check-Ins
- `POST /check-in` - Submit daily check-in (protected)
- `GET /check-ins` - Get user's check-in history (protected)

### Insights
- `GET /insights/personalized` - Get personalized analytics (protected)
- `GET /insights/distributions` - Get population benchmarks

## 📊 Research Foundation

This platform is built on research analyzing 130+ students across:
- Multiple departments (CS/IT, Electrical, Mechanical, etc.)
- Various CGPA ranges
- Different placement stages
- Diverse preparation patterns

The insights engine uses statistical analysis to provide meaningful, personalized guidance based on real student experiences.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Research participants who shared their placement journey data
- Open source community for the amazing tools and libraries

---

**Note**: This is a mental health support tool. If you're experiencing severe stress or anxiety, please reach out to a mental health professional.
