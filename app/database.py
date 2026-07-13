import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============ ПОЛУЧЕНИЕ СТРОКИ ПОДКЛЮЧЕНИЯ ============

def get_database_url():
    """Определяет правильную строку подключения в зависимости от окружения"""

    # 1. Проверяем переменные окружения (приоритет)
    url = os.getenv("DATABASE_URL")
    if url:
        logger.info("Using DATABASE_URL from environment")
        return url

    # 2. Для Vercel с Supabase
    url = os.getenv("apex_POSTGRES_PRISMA_URL")
    if url:
        logger.info("Using apex_POSTGRES_PRISMA_URL")
        return url

    url = os.getenv("apex_POSTGRES_URL")
    if url:
        logger.info("Using apex_POSTGRES_URL")
        return url

    # 3. Локальная разработка (Docker)
    url = os.getenv("LOCAL_DATABASE_URL", "postgresql://postgres:password@postgres:5432/crm_db")
    logger.info("Using local database URL")
    return url


# ============ ОЧИСТКА И НАСТРОЙКА URL ============

def clean_database_url(url: str) -> str:
    """Очищает URL и добавляет правильные параметры для окружения"""
    if not url:
        return url

    # Конвертируем postgres:// в postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Определяем, является ли это локальным окружением
    is_local = any(host in url for host in ["localhost", "127.0.0.1", "postgres"])

    if is_local:
        # Для локальной разработки - SSL не нужен
        # Удаляем sslmode если он есть
        url = url.replace("?sslmode=require", "")
        url = url.replace("&sslmode=require", "")
        logger.info("Local environment detected: SSL disabled")
    else:
        # Для продакшена - добавляем sslmode=require
        if "sslmode=require" not in url:
            if "?" in url:
                url += "&sslmode=require"
            else:
                url += "?sslmode=require"
        logger.info("Production environment detected: SSL enabled")

    # Удаляем параметр pgbouncer если он есть (он уже не нужен)
    if "pgbouncer=true" in url:
        url = url.replace("&pgbouncer=true", "")
        url = url.replace("?pgbouncer=true&", "?")
        url = url.replace("?pgbouncer=true", "")
        logger.info("Removed pgbouncer parameter")

    return url


# ============ ИНИЦИАЛИЗАЦИЯ ============

DATABASE_URL = get_database_url()
DATABASE_URL = clean_database_url(DATABASE_URL)

# Логируем информацию (без пароля)
if '@' in DATABASE_URL:
    parts = DATABASE_URL.split('@')
    logger.info(f"Connecting to: {parts[0].split(':')[0]}:***@{parts[1][:50]}...")
else:
    logger.info(f"Connecting to: {DATABASE_URL[:50]}...")

# Создаем engine с правильными настройками
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=1,
    max_overflow=0,
    echo=False,
    connect_args={
        "connect_timeout": 30,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    } if "localhost" not in DATABASE_URL and "postgres" not in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection():
    """Проверка подключения к базе данных"""
    if not engine:
        logger.error("Database engine is None")
        return False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
