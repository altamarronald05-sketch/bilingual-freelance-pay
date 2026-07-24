# PayLance Pro 💎 - Bilingual Milestone & Crypto Payment Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_TypeScript-61DAFB.svg?logo=react)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com)
[![Security](https://img.shields.io/badge/OWASP-HSTS_%7C_CSP_%7C_SHA256-brightgreen.svg)](https://owasp.org)

**PayLance Pro** es una plataforma SaaS de nivel enterprise para la gestión de proyectos de freelancers internacionales, contratos digitales con firma criptográfica SHA-256, tablero Kanban/Gantt y liquidez multimoneda (FIAT + Cripto).

---

## ✨ Características Principales

- **🎨 Diseño Luxury Obsidian & Gold:** Interfaz editorial de alta gama utilizando fuentes **Playfair Display** (títulos serif) y **Montserrat** (UI limpia).
- **🌐 Sistema Bilingüe (i18n):** Alternador instantáneo entre **Español (ES)** e **Inglés (EN)**.
- **💱 Conversor Multimoneda en Tiempo Real:** Soporte dinámico para **USD ($)**, **COP ($)**, **EUR (€)**, **BTC (₿)**, **ETH (Ξ)** y **USDT ($)** con ticker financiero en vivo.
- **📄 Contratos PDF con Firma SHA-256:** Motor ReportLab para emisión inalterable de contratos legales sellados digitalmente.
- **💳 Pasarela Fintech Sandbox:** Simulación de pagos mediante **MetaMask Web3 Wallet** y tarjeta **Stripe Elements**.
- **📊 Vista Doble Kanban & Cronograma Gantt:** Alternador de vistas para gestión fluida de entregables por hitos.
- **⚡ Tiempo Real & WebSockets:** Sincronización continua de cambios entre pantallas mediante FastAPI WebSockets (`/api/v1/ws`).
- **🛡️ Seguridad Enterprise OWASP:** Protección HSTS, Content Security Policy, Rate Limiting in-memory y log inalterable en `logs/security_audit.log`.

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Framework:** FastAPI (Python 3.14+)
- **Base de Datos:** PostgreSQL (con fallback transparente a SQLite `freelance_pay.db`)
- **ORM:** SQLAlchemy + Pydantic v2
- **PDF & Cripto:** ReportLab + Hashlib SHA-256
- **Autenticación:** JWT (HS256) + Passlib

### Frontend
- **Framework:** React 19 + TypeScript + Vite 8
- **Estilos:** Tailwind CSS v4 + Glassmorphic UI
- **Iconos & Tipografía:** Lucide React + Google Fonts (*Playfair Display*, *Montserrat*, *JetBrains Mono*)
- **Internacionalización:** react-i18next

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+ y npm
- Python 3.10+ y pip
- Git

---

### 1. Clonar el Repositorio

```bash
git clone https://github.com/altamarronald05-sketch/bilingual-freelance-pay.git
cd bilingual-freelance-pay
```

---

### 2. Configurar y Ejecutar el Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual de Python
python -m venv venv

# Activar entorno virtual
# En Windows (PowerShell):
.\venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Inicializar y poblar base de datos de demostración
python reset_db.py

# Iniciar servidor Uvicorn
uvicorn app.main:app --reload --port 8000
```
> El backend estará disponible en `http://localhost:8000` (Documentación API en `http://localhost:8000/docs`).

---

### 3. Configurar y Ejecutar el Frontend (React + Vite)

En una nueva terminal:

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo Vite
npm run dev
```
> El frontend estará disponible en `http://localhost:5173`.

---

## ⚡ Cuentas de Acceso Rápido (Demostración)

En la pantalla de inicio de sesión (`http://localhost:5173`), puedes ingresar con un clic usando los botones de prueba:

- **🏢 Demo Cliente:** `client@nexusglobal.com` / `demo1234`
- **💻 Demo Freelancer:** `freelancer@dev.com` / `demo1234`

---

## 📂 Estructura del Proyecto

```text
bilingual-freelance-pay/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints API (auth, projects, payments, contracts, ws)
│   │   ├── core/            # Seguridad JWT, Rate Limiter y Headers OWASP
│   │   ├── db/              # Modelos SQLAlchemy y Seeding
│   │   ├── models/          # Esquemas ORM
│   │   ├── schemas/         # Validación Pydantic
│   │   └── services/        # Generador PDF SHA-256, Email y Currencies
│   ├── logs/                # Security Audit Log inalterable
│   ├── reset_db.py          # Script de reinicio y seeding de BD
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Kanban, Gantt, Modales, Charts, Navbar, Toast
│   │   ├── context/         # AuthContext & CurrencyContext
│   │   ├── i18n/            # Traducciones Español/Inglés
│   │   ├── pages/           # Dashboard, Login, Transactions
│   │   └── index.css        # Tailwind CSS + Design System Luxury
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE). Libre para uso personal y comercial.
