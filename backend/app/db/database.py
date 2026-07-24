import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def get_engine():
    """Attempt PostgreSQL connection first; fallback to SQLite if PostgreSQL is unreachable."""
    pg_url = settings.DATABASE_URL
    try:
        engine = create_engine(pg_url, pool_pre_ping=True)
        # Test connection with simple ping query
        with engine.connect() as conn:
            print("[DB SUCCESS] Connected cleanly to Supabase PostgreSQL Cloud Database!")
            return engine
    except Exception as e:
        safe_err = str(e).encode('ascii', 'ignore').decode('ascii')
        print(f"[DB NOTICE] PostgreSQL connection fallback: {safe_err}")
        sqlite_engine = create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False}
        )
        return sqlite_engine

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
