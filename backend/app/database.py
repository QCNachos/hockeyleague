import os
from supabase import create_client, Client
import dotenv
from .supabase_client import get_supabase

# Load environment variables
dotenv.load_dotenv()

def get_supabase_client():
    """
    Get a Supabase client using the singleton from supabase_client module.
    
    Returns:
        Supabase client instance
    """
    return get_supabase() 