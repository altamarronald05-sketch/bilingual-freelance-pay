import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import Base, engine, SessionLocal
from app.models.models import User, Project, Milestone, MilestoneStatus
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    print("Initializing Database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return

        print("Seeding Users...")
        client = User(
            email="client@nexusglobal.com",
            password_hash=get_password_hash("demo1234"),
            full_name="Alex Morgan (Nexus Global Tech)",
            role="client",
            preferred_currency="USD"
        )
        freelancer = User(
            email="freelancer@dev.com",
            password_hash=get_password_hash("demo1234"),
            full_name="Sofia Ramírez (Lead Full-Stack Dev)",
            role="freelancer",
            preferred_currency="USD"
        )
        db.add_all([client, freelancer])
        db.commit()

        print("Seeding Projects...")
        project = Project(
            title="Plataforma SaaS Multimoneda & Smart Contracts",
            description="Desarrollo de motor de pagos en tiempo real con liquidez FIAT/Cripto, interfaz bilingüe e integración de auditoría SHA-256.",
            client_id=client.id,
            freelancer_id=freelancer.id,
            total_amount=4500.0,
            currency="USD",
            status="active"
        )
        db.add(project)
        db.commit()

        print("Seeding Milestones...")
        milestones = [
            Milestone(
                project_id=project.id,
                title="Fase 1: Arquitectura Base, JWT Auth & BD PostgreSQL",
                description="Configuración de FastAPI, esquemas Pydantic y modelos ORM con fallback transparente a SQLite.",
                amount=1000.0,
                currency="USD",
                status=MilestoneStatus.APPROVED.value,
                order_index=0
            ),
            Milestone(
                project_id=project.id,
                title="Fase 2: Motor Bilingüe i18n & Conversor en Tiempo Real",
                description="Integración de react-i18next (Español/Inglés) y API de tipos de cambio para USD, COP, EUR, BTC, ETH.",
                amount=1200.0,
                currency="USD",
                status=MilestoneStatus.UNDER_REVIEW.value,
                order_index=1
            ),
            Milestone(
                project_id=project.id,
                title="Fase 3: Generación de Contratos PDF con Firma SHA-256",
                description="Servicio ReportLab para emisión inalterable de contratos legales en PDF.",
                amount=1300.0,
                currency="USD",
                status=MilestoneStatus.IN_PROGRESS.value,
                order_index=2
            ),
            Milestone(
                project_id=project.id,
                title="Fase 4: Pasarela Sandbox Stripe/Cripto & Webhooks",
                description="Módulo de checkout interactivo y auditoría de transacciones.",
                amount=1000.0,
                currency="USD",
                status=MilestoneStatus.PENDING.value,
                order_index=3
            )
        ]
        db.add_all(milestones)
        db.commit()

        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
