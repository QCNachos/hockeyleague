# Hockey League Simulator

A comprehensive open-source NHL franchise mode simulator with a focus on customizability and realistic simulation.

## Project Overview

Hockey League Simulator is designed to provide a deep and immersive hockey franchise management experience. Unlike commercial games, our focus is on:

- Customization: Create and edit players, teams, leagues, and rules
- Realistic Simulation: Advanced algorithms to model real hockey
- Management Focus: In-depth team management, scouting, drafting, and contract negotiations

This project is for hockey fans who want a more detailed and customizable management experience than what's available in commercial games.

## Tech Stack

### Backend
- Python 3.9+
- Flask (Web framework)
- SQLAlchemy (ORM)
- Flask-JWT-Extended (Authentication)
- PostgreSQL/SQLite (Database)

### Frontend
- React 18+
- Redux (State management)
- React Router (Navigation)
- Styled Components (Styling)
- Axios (API client)

## Project Structure

```
├── backend/                  # Flask API backend
│   ├── app/                  # Application package
│   │   ├── api/              # API endpoints
│   │   ├── auth/             # Authentication
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
│   │   └── utils/            # Helper functions
│   ├── migrations/           # Database migrations
│   └── tests/                # Test suite
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   └── src/                  # React source code
│       ├── components/       # Reusable components
│       ├── pages/            # Page components
│       ├── store/            # Redux store
│       ├── hooks/            # Custom React hooks
│       ├── utils/            # Helper functions
│       └── styles/           # CSS and styling
└── docs/                     # Documentation
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 14+
- PostgreSQL (for production)

### Backend Setup
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/hockeyleague.git
   cd hockeyleague
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```
   flask db init
   flask db migrate
   flask db upgrade
   ```

6. Run the development server:
   ```
   flask run
   ```

### Frontend Setup
1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run the development server:
   ```
   npm start
   ```

## Features

- **Player Management**: Create, edit, and develop players with detailed attributes
- **Team Management**: Build and customize teams with unique characteristics
- **Game Simulation**: Simulate games with realistic results
- **League Calendar**: Manage schedules, playoffs, and key events
- **Statistics**: Track performance with detailed statistics
- **Entry Draft**: Scout and draft young talent to develop
- **Contracts & Salary Cap**: Manage player contracts within cap constraints
- **Coaching System**: Hire coaches with different styles and abilities

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The open-source community
- Hockey fans and gamers who've provided feedback
- Contributors and supporters of the project

## Database Information

This project uses SQLAlchemy as an Object-Relational Mapper (ORM) to interact with the database. The ORM allows us to work with database tables through Python classes, making it easier to perform database operations without writing raw SQL.

### Database Structure

The database is organized around these main models:

- **User**: Stores user authentication information
- **Team**: Stores team information, including name, city, colors, etc.
- **Player**: Stores player information, attributes, and ratings
- **Division/Conference**: Organizes teams into divisions and conferences
- **Game**: Stores game results and statistics
- **Contract**: Manages player contracts and salary information

### Database Setup

The application supports different database configurations:

1. **Development**: Uses SQLite, a file-based database that requires no additional setup
2. **Testing**: Uses in-memory SQLite for fast test execution
3. **Production**: Uses PostgreSQL for better performance and scalability

### Database Migrations

We use Flask-Migrate (based on Alembic) to handle database schema changes. This allows us to:

1. Create initial database structure
2. Update the schema as the application evolves
3. Rollback changes if needed

### Working with the Database

If you're new to databases, here's how this project makes it easier:

1. **Models**: Python classes represent database tables
2. **Relationships**: Models can reference each other (like a player belongs to a team)
3. **Queries**: Find, filter, and sort data using Python methods
4. **CRUD Operations**: Create, Read, Update, and Delete records with simple commands

For example, to add a new team to the database:

```python
new_team = Team(
    name="Seattle Kraken",
    city="Seattle",
    abbreviation="SEA",
    # Other attributes...
)
db.session.add(new_team)
db.session.commit()
```

To query teams:

```python
# Get all teams
all_teams = Team.query.all()

# Get teams by division
atlantic_teams = Team.query.filter_by(division_id=1).all()

# Get team by ID
team = Team.query.get(1)
```

### Database Initialization

The application includes tools to populate the database with the 32 NHL teams, their divisions, and conferences. This gives you a ready-to-use starting point without having to manually create all this data.
