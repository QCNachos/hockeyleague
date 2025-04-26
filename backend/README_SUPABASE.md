# Supabase Integration

## Overview
This project uses Supabase as a data backend. All Supabase interactions are now centralized through a single file (`supabase_client.py`) and exposed via endpoints in `app.py`.

## Key Features
- **Single Source of Truth**: All Supabase interactions go through `supabase_client.py`
- **Centralized API Endpoints**: All data access is available through `/api/supabase/` endpoints
- **No Table Creation**: Tables should be created directly in Supabase, not via this application
- **Read-Only**: The current implementation focuses on retrieving data from Supabase

## Available Endpoints

### Get Data from a Table
```
GET /api/supabase/<table_name>
```

**Query Parameters:**
- `filters`: JSON string of key-value pairs for filtering (optional)
- `select`: Comma-separated list of columns to select (optional, defaults to all columns)

**Example:**
```
GET /api/supabase/Team?filters={"division":1}&select=id,team,abbreviation
```

### Get Single Item by ID
```
GET /api/supabase/<table_name>/<item_id>
```

**Query Parameters:**
- `id_column`: Name of the ID column (optional, defaults to 'id')

**Example:**
```
GET /api/supabase/Player/42
```

## Implementation Details

### Single Source of Truth
The `supabase_client.py` file serves as the single source of truth for all Supabase interactions:

1. It provides a singleton client via `get_supabase()` or the alias `get_supabase_client()`
2. It contains helper functions for common operations like `get_data()` and `get_item_by_id()`
3. It handles error cases gracefully (e.g., missing credentials)

### Configuration
Supabase configuration is read from environment variables:
- `SUPABASE_URL`
- `SUPABASE_KEY`

If these are not set, the API will work in a degraded mode, returning empty results.

## Project Organization
- **supabase_client.py**: The single file for all Supabase interactions
- **app.py**: Contains the centralized API endpoints
- **db_initialization.py** and **db_init.py**: These remain separate as they deal with the local SQLite database, not Supabase

## Deprecated Files/Functionality
The following files/functionality are now deprecated:
- `create_supabase_tables.py` - No longer needed as tables should be created directly in Supabase
- Duplicate Supabase client creation - All clients should use the singleton from `supabase_client.py` 