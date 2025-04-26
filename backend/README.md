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

# NHL Hockey League Draft Simulation

This directory contains scripts for simulating and viewing NHL drafts using the Supabase database.

## Prerequisites

Before running these scripts, make sure you have:

1. Set up your Supabase database with proper credentials
2. Created an `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```
3. Installed required Python packages:
   ```
   pip install supabase python-dotenv tabulate
   ```

## Script Order

The scripts should be run in the following order:

1. `create_supabase_tables.py` - Creates the necessary tables in your Supabase database
2. `populate_nhl_teams.py` - Populates the database with NHL teams
3. `generate_prospects.py` - Generates prospect players eligible for the draft
4. `simulate_draft.py` - Simulates an NHL draft
5. `view_draft_results.py` - Views the results of the simulated draft

## Simulate Draft Script

The `simulate_draft.py` script simulates an NHL draft with realistic team strategies and prospect selection.

### Usage

```bash
python simulate_draft.py [--year YEAR] [--rounds ROUNDS] [--interactive]
```

### Options

- `--year`: The draft year (default: current year)
- `--rounds`: Number of rounds for the draft (default: 7)
- `--interactive`: Run the draft in interactive mode, pausing after each pick

### Example

```bash
# Run a 7-round draft for 2023
python simulate_draft.py --year 2023 --rounds 7

# Run an interactive draft
python simulate_draft.py --interactive
```

## View Draft Results Script

The `view_draft_results.py` script provides various ways to view and analyze the results of a simulated draft.

### Usage

```bash
python view_draft_results.py [command] [options]
```

### Commands

- `list`: List all drafts in the database
- `summary`: Display a summary of a draft
- `team`: Display draft results for a team
- `round`: Display all picks for a round
- `full`: Display the entire draft
- `position`: Display picks by position
- `player`: Display player details

### Examples

```bash
# List all drafts in the database
python view_draft_results.py list

# Show a summary of the most recent draft
python view_draft_results.py summary

# Show a summary of the 2023 draft
python view_draft_results.py summary --year 2023

# Show all picks for a specific team
python view_draft_results.py team --name "Maple Leafs"

# Show all picks from the first round
python view_draft_results.py round --number 1

# Show the entire draft
python view_draft_results.py full

# Show all drafted centers
python view_draft_results.py position --position C

# Show details for a specific player
python view_draft_results.py player --id 123
```

## How the Draft Simulation Works

The draft simulation follows these key steps:

1. **Check Prerequisites**: Ensures teams and prospects exist in the database
2. **Assign Team Strategies**: Assigns random draft strategies to teams (best available, position needs, etc.)
3. **Generate Draft Order**: Creates a draft order based on team prestige
4. **Initialize Draft**: Creates a draft record and draft picks in the database
5. **Make Picks**: Teams select prospects based on their needs and strategies
6. **Complete Draft**: Updates player information with draft details

Teams evaluate prospects based on:
- Overall rating
- Potential rating
- Position needs
- Age
- Team draft strategy

## Database Structure

The simulation works with the following key tables:

- `Team`: NHL teams
- `Player`: Player information, including prospects
- `Draft`: Draft metadata (year, round count, status)
- `DraftPick`: Individual draft picks

## Troubleshooting

If you encounter any issues:

1. Check your `.env` file has the correct Supabase credentials
2. Verify the database tables exist and have the expected structure
3. Make sure you've run the prerequisite scripts in the correct order
4. Check the Supabase console for any database errors 