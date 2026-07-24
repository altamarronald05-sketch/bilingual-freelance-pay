import sys
try:
    from app.main import app
    print("Backend import successful! DB tables initialized.")
except Exception as e:
    print(f"Backend import error: {e}")
    sys.exit(1)
