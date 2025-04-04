from app import create_app
from app.utils.db_init import init_nhl_data

app = create_app()
with app.app_context():
    result = init_nhl_data()
    print(f"Successfully initialized: {result['conferences']} conferences, {result['divisions']} divisions, {result['teams']} teams") 