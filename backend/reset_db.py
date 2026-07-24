import os
import sys

db_file = "freelance_pay.db"
if os.path.exists(db_file):
    try:
        os.remove(db_file)
        print("Removed stale SQLite file.")
    except Exception as e:
        print(f"Could not remove db file: {e}")

try:
    from app.main import app
    from app.db.seed import seed_demo_data
    seed_demo_data()
    print("Database recreated and demo users seeded cleanly!")
except Exception as e:
    print(f"Error seeding DB: {e}")
    sys.exit(1)
