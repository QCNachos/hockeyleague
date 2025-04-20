import os
from supabase import create_client, Client
import dotenv

# Load environment variables
dotenv.load_dotenv()

def create_supabase_client() -> Client:
    """
    Create a Supabase client using environment variables.
    
    Returns:
        Supabase client instance
    """
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            print("WARNING: Missing Supabase credentials in environment variables")
            # Return dummy client or raise exception
            from unittest.mock import MagicMock
            mock_client = MagicMock()
            # Configure the mock to return empty data for common methods
            mock_client.table().select().execute.return_value.data = []
            return mock_client
        
        return create_client(url, key)
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        # Return dummy client
        from unittest.mock import MagicMock
        mock_client = MagicMock()
        # Configure the mock to return empty data for common methods
        mock_client.table().select().execute.return_value.data = []
        return mock_client 