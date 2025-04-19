# Hockey League Backend

This is the backend for the Hockey League application, providing APIs for managing teams, players, and game simulations.

## Project Structure

```
backend/
├── app.py                 # Main entry point
├── requirements.txt       # Python dependencies
├── app/                   # Application package
│   ├── __init__.py        # App factory setup
│   ├── extensions.py      # Flask extensions
│   ├── api/               # API routes (Flask blueprints)
│   │   ├── __init__.py    # Blueprint registration
│   │   ├── players.py     # Player routes
│   │   ├── teams.py       # Team routes
│   │   ├── lines.py       # Lines routes
│   │   └── ...
│   ├── models/            # Database models
│   │   ├── player.py
│   │   ├── team.py
│   │   └── ...
│   ├── services/          # Business logic
│   │   ├── lines.py
│   │   ├── team_formation.py
│   │   ├── chemistry.py
│   │   └── ...
│   └── utils/             # Utility functions
└── migrations/            # Database migrations
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL or Supabase account

### Installation

1. Clone the repository
2. Navigate to the backend directory

```bash
cd backend
```

3. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

4. Install dependencies

```bash
pip install -r requirements.txt
```

5. Set up environment variables
   - Copy `.env.example` to `.env`
   - Fill in the required values

```bash
cp .env.example .env
```

6. Initialize the database

```bash
flask db upgrade
```

### Running the Application

To run the development server:

```bash
python app.py
```

Or with Flask CLI:

```bash
flask run --host=0.0.0.0 --port=5001
```

## API Documentation

### Players API

- `GET /api/players` - Get all players or filter by query parameters
- `GET /api/players/<id>` - Get a specific player
- `POST /api/players` - Create a player
- `PUT /api/players/<id>` - Update a player
- `DELETE /api/players/<id>` - Delete a player

### Teams API

- `GET /api/teams` - Get all teams
- `GET /api/teams/<id>` - Get a specific team
- `POST /api/teams` - Create a team
- `PUT /api/teams/<id>` - Update a team
- `DELETE /api/teams/<id>` - Delete a team

### Lines API

- `GET /api/lines/formation/<team_abbreviation>` - Generate optimal lines
- `GET /api/lines/chemistry/<team_abbreviation>` - Get chemistry data
- `GET /api/lines/update-team-overall/<team_abbreviation>` - Update team rating

## Development Guidelines

1. **Code Style**: Follow PEP 8 style guide for Python code.
2. **Naming Conventions**: 
   - Files: lowercase with underscores (snake_case)
   - Classes: CamelCase
   - Functions/variables: lowercase with underscores (snake_case)
3. **API Routes**: Use Flask blueprints and RESTful principles
4. **Database Models**: Define in `app/models/` directory
5. **Business Logic**: Implement in the `app/services/` directory

## Database Migrations

1. Create a migration after model changes:

```bash
flask db migrate -m "Description of changes"
```

2. Apply migrations:

```bash
flask db upgrade
```

## Testing

Run tests using pytest:

```bash
pytest
```

## Deployment

The application is deployed using Render.com.

## Contact

For questions or issues, please contact the development team. 