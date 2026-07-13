from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import os

from app import models, database
from app.routers import health, auth, clients

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Создание приложения
app = FastAPI(
    title="APEX CRM API",
    version="1.0.0",
    description="CRM система для управления клиентами"
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://crmapex.vercel.app",
        "https://apex-steel-ten.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ ПОДКЛЮЧЕНИЕ РОУТЕРОВ ============

# Роутеры без префикса
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(clients.router)

# Роутеры с префиксом /api (для фронтенда)
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(clients.router, prefix="/api")


# ============ СТАРТ ПРИЛОЖЕНИЯ ============

@app.on_event("startup")
async def startup():
    try:
        logger.info("Starting up...")

        db_url = os.getenv("DATABASE_URL") or os.getenv("apex_POSTGRES_PRISMA_URL")
        if db_url:
            logger.info("DATABASE_URL found")
        else:
            logger.warning("DATABASE_URL not found in environment variables!")

        logger.info("Creating database tables...")
        models.Base.metadata.create_all(bind=database.engine)
        logger.info("Database tables created/verified successfully")

        if database.check_db_connection():
            logger.info("Database connection successful")
        else:
            logger.warning("Database connection check failed during startup")

    except Exception as e:
        logger.error(f"Startup error: {e}")