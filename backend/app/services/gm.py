from flask import Blueprint, jsonify, request
import logging
import traceback

# Create blueprint for staff services
staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/coaches', methods=['GET'])
def get_all_coaches():
    """Get all coaches from Supabase"""
    from ..supabase_client import get_supabase
    
    try:
        logging.info("Fetching all coaches from Supabase")
        supabase = get_supabase()
        
        # Query for coaches with detailed logging
        response = None
        try:
            # Explicitly log the query we're about to make
            logging.info("Executing Supabase query: Staff_Coach.select('*')")
            response = supabase.table('Staff_Coach').select('*').execute()
            logging.info(f"Supabase response status: {response.status_code if hasattr(response, 'status_code') else 'Unknown'}")
            
            if hasattr(response, 'data'):
                logging.info(f"Response data count: {len(response.data or [])}")
                if response.data and len(response.data) > 0:
                    logging.info(f"First record sample: {response.data[0]}")
        except Exception as query_error:
            logging.error(f"Error during Supabase query: {query_error}")
            traceback.print_exc()
            # Create a fallback response if needed
            return jsonify({"error": str(query_error)}), 500
        
        if response and response.data:
            logging.info(f"Found {len(response.data)} coaches")
            # Ensure team_id field exists in every record
            for coach in response.data:
                if 'team_id' not in coach and 'team' in coach:
                    coach['team_id'] = coach['team']
            return jsonify(response.data), 200
        else:
            logging.warning("No coaches found in Supabase")
            # Return empty array instead of error
            return jsonify([]), 200
    except Exception as e:
        logging.error(f"Error fetching coaches: {str(e)}")
        logging.exception("Traceback:")
        return jsonify({"error": str(e)}), 500

@staff_bp.route('/gms', methods=['GET'])
def get_all_gms():
    """Get all general managers from Supabase"""
    from ..supabase_client import get_supabase
    
    try:
        logging.info("Fetching all GMs from Supabase")
        supabase = get_supabase()
        
        # Query for GMs with detailed logging
        response = None
        try:
            # Explicitly log the query we're about to make
            logging.info("Executing Supabase query: Staff_Gm.select('*')")
            # Note: table name is case sensitive, ensure it matches database
            response = supabase.table('Staff_Gm').select('*').execute()
            logging.info(f"Supabase response status: {response.status_code if hasattr(response, 'status_code') else 'Unknown'}")
            
            if hasattr(response, 'data'):
                logging.info(f"Response data count: {len(response.data or [])}")
                if response.data and len(response.data) > 0:
                    logging.info(f"First record sample: {response.data[0]}")
                else:
                    logging.warning("GM query returned no data, trying with different case: 'Staff_GM'")
                    # Try alternative table name with different capitalization
                    response = supabase.table('Staff_GM').select('*').execute()
                    if hasattr(response, 'data') and response.data:
                        logging.info(f"Found {len(response.data)} GMs with alternative capitalization")
            else:
                logging.warning("Response has no data attribute, trying with different case: 'Staff_GM'")
                # Try alternative table name with different capitalization
                response = supabase.table('Staff_GM').select('*').execute()
        except Exception as query_error:
            logging.error(f"Error during Supabase query: {query_error}")
            traceback.print_exc()
            # Create a fallback response if needed
            return jsonify({"error": str(query_error)}), 500
        
        if response and response.data:
            logging.info(f"Found {len(response.data)} GMs")
            # Ensure team_id field exists in every record
            for gm in response.data:
                if 'team_id' not in gm and 'team' in gm:
                    gm['team_id'] = gm['team']
            return jsonify(response.data), 200
        else:
            logging.warning("No GMs found in Supabase")
            # Return empty array instead of error
            return jsonify([]), 200
    except Exception as e:
        logging.error(f"Error fetching GMs: {str(e)}")
        logging.exception("Traceback:")
        return jsonify({"error": str(e)}), 500
