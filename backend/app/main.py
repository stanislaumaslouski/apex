from fastapi import FastAPI, Request, Response
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

# ============ CORS НАСТРОЙКИ ============
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
    expose_headers=["*"],
    max_age=86400,  # Кэширование CORS на 24 часа
)


# ============ MIDDLEWARE ДЛЯ ОБРАБОТКИ OPTIONS И CORS ============
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    """
    Обработка CORS и OPTIONS запросов
    """
    # Явная обработка OPTIONS запросов
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers[
            "Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response

    # Обработка обычных запросов
    response = await call_next(request)

    # Добавляем CORS заголовки к ответу
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Expose-Headers"] = "*"

    return response


# ============ ЯВНЫЙ ОБРАБОТЧИК OPTIONS ДЛЯ ВСЕХ МАРШРУТОВ ============
@app.options("/{full_path:path}")
async def options_router(request: Request):
    """
    Обработка OPTIONS запросов для всех маршрутов
    """
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "86400",
        }
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