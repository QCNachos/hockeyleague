# Changelog

## Backend Cleanup - v1.0.0

### Major Changes

- **Entry Point Consolidation**:
  - Created a single `app.py` as the main entry point
  - Removed redundant files:
    - `run.py`
    - `run_server.py`
    - `app/main.py`

- **Framework Standardization**:
  - Standardized on Flask routes (removed FastAPI dependencies)
  - Converted all FastAPI routes to Flask blueprints:
    - `lines.py`
    - `team_rating.py`

- **File Structure Cleanup**:
  - Fixed case inconsistency:
    - Renamed `services/Lines.py` to `services/lines.py`
    - Created `services/team_formation.py` (renamed from `TeamFormation.py`)
  - Followed consistent naming (lowercase with underscores)

- **API Routes Standardization**:
  - Ensured consistent routing patterns across all endpoints
  - Updated imports in route files
  - Standardized response formats

- **Documentation**:
  - Added comprehensive `README.md` file
  - Created this `CHANGELOG.md` to track changes

### Minor Changes

- **Dependency Management**:
  - Updated `requirements.txt` to reflect Flask-only dependencies
  - Removed FastAPI and Uvicorn dependencies

- **Database Access**:
  - Simplified database access patterns
  - Ensured consistent error handling 