from app.db.database import SessionLocal, engine, Base
from app.models.models import User, Project, Milestone, MilestoneStatus, UserRole, ProjectStatus, Transaction, TransactionStatus, Contract
from app.core.security import get_password_hash
from app.services.pdf_service import generate_contract_pdf
import os

def seed_demo_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if demo client exists
        client = db.query(User).filter(User.email == "client@nexusglobal.com").first()
        if not client:
            client = User(
                email="client@nexusglobal.com",
                password_hash=get_password_hash("demo1234"),
                full_name="Alex Morgan (Nexus Global Tech)",
                role=UserRole.CLIENT.value,
                preferred_currency="USD"
            )
            db.add(client)

        freelancer = db.query(User).filter(User.email == "freelancer@dev.com").first()
        if not freelancer:
            freelancer = User(
                email="freelancer@dev.com",
                password_hash=get_password_hash("demo1234"),
                full_name="Sofia Ramírez (Lead Full-Stack Dev)",
                role=UserRole.FREELANCER.value,
                preferred_currency="USD"
            )
            db.add(freelancer)

        db.commit()
        if client: db.refresh(client)
        if freelancer: db.refresh(freelancer)

        # Check if demo project exists
        proj1 = db.query(Project).filter(Project.title == "Plataforma SaaS Multimoneda & Smart Contracts").first()
        if not proj1:
            proj1 = Project(
                title="Plataforma SaaS Multimoneda & Smart Contracts",
                description="Desarrollo de motor de pagos en tiempo real con liquidez FIAT/Cripto, interfaz bilingüe e integración de auditoría SHA-256.",
                client_id=client.id,
                freelancer_id=freelancer.id,
                total_amount=4500.0,
                currency="USD",
                status=ProjectStatus.ACTIVE.value
            )
            db.add(proj1)
            db.commit()
            db.refresh(proj1)

            # Milestones for Project 1
            ms1 = Milestone(
                project_id=proj1.id,
                title="Fase 1: Arquitectura Base, JWT Auth & BD PostgreSQL",
                description="Configuración de FastAPI, esquemas Pydantic y modelos ORM con fallback transparente a SQLite.",
                amount=1000.0,
                currency="USD",
                status=MilestoneStatus.APPROVED.value,
                order_index=0
            )
            ms2 = Milestone(
                project_id=proj1.id,
                title="Fase 2: Motor Bilingüe i18n & Conversor en Tiempo Real",
                description="Integración de react-i18next (Español/Inglés) y API de tipos de cambio para USD, COP, EUR, BTC, ETH.",
                amount=1200.0,
                currency="USD",
                status=MilestoneStatus.UNDER_REVIEW.value,
                order_index=1
            )
            ms3 = Milestone(
                project_id=proj1.id,
                title="Fase 3: Generación de Contratos PDF con Firma SHA-256",
                description="Servicio ReportLab para emisión inalterable de contratos legales en PDF.",
                amount=1300.0,
                currency="USD",
                status=MilestoneStatus.IN_PROGRESS.value,
                order_index=2
            )
            ms4 = Milestone(
                project_id=proj1.id,
                title="Fase 4: Pasarela Sandbox Stripe/Cripto & Webhooks",
                description="Módulo de checkout interactivo y auditoría de transacciones.",
                amount=1000.0,
                currency="USD",
                status=MilestoneStatus.PENDING.value,
                order_index=3
            )
            db.add_all([ms1, ms2, ms3, ms4])
            db.commit()

            # Transaction for Milestone 1
            tx1 = Transaction(
                milestone_id=ms1.id,
                project_id=proj1.id,
                amount=1000.0,
                currency="USD",
                payment_method="crypto_usdt",
                status=TransactionStatus.COMPLETED.value,
                tx_hash="0x7f9a8b2c4d6e1f3a5c7e9b0d2f4a6c8e0f1a3b5c7d9e1f3a5c7e9b0d2f4a6c8"
            )
            db.add(tx1)

            # PDF Contract for Project 1
            pdf_path = os.path.join(os.getcwd(), "generated_contracts", f"contract_project_{proj1.id}.pdf")
            ms_data = [
                {"title": ms1.title, "description": ms1.description, "amount": ms1.amount, "currency": "USD", "status": ms1.status},
                {"title": ms2.title, "description": ms2.description, "amount": ms2.amount, "currency": "USD", "status": ms2.status},
                {"title": ms3.title, "description": ms3.description, "amount": ms3.amount, "currency": "USD", "status": ms3.status},
                {"title": ms4.title, "description": ms4.description, "amount": ms4.amount, "currency": "USD", "status": ms4.status},
            ]
            sig = generate_contract_pdf(proj1.title, client.full_name, freelancer.full_name, proj1.total_amount, "USD", ms_data, pdf_path)
            contract = Contract(project_id=proj1.id, pdf_path=pdf_path, digital_signature=sig)
            db.add(contract)
            db.commit()

        print("Demo seed data verified and ready!")

    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()
