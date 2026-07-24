# PayLance Backend

Motor de pagos, autenticación, generación inmutable de contratos PDF y auditoría en tiempo real para PayLance Bilingual SaaS.

## 🚀 Quick Start (Local Development)

1. Clone repository
2. Install dependencies: `pip install -r requirements.txt`
3. Run database migrations / initialization: `python app/seed.py`
4. Start server: `uvicorn app.main:app --reload`

## 🛠️ Tecnologías

- **Framework:** FastAPI
- **Base de Datos:** SQLite (Desarrollo) / PostgreSQL (Producción)
- **ORM:** SQLAlchemy
- **Autenticación:** JWT (JSON Web Tokens)
- **Generación PDF:** ReportLab
- **Seguridad:** Passlib (Bcrypt)
