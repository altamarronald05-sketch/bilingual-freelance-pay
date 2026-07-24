from app.db.database import SessionLocal
from app.models.models import User
from app.core.security import verify_password, get_password_hash

db = SessionLocal()
users = db.query(User).all()
print(f"Total users in DB: {len(users)}")
for u in users:
    print(f"- ID: {u.id}, Email: {u.email}, Role: {u.role}")

client = db.query(User).filter(User.email == "client@nexusglobal.com").first()
if client:
    check = verify_password("demo1234", client.password_hash)
    print(f"Password check for client@nexusglobal.com with 'demo1234': {check}")
else:
    print("Client user client@nexusglobal.com NOT found in DB!")
