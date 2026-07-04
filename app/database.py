from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()


# Пробуем получить DATABASE_URL из разных источников
def get_database_url():
    # Сначала проверяем DATABASE_URL (стандартное имя)
    url = os.getenv("DATABASE_URL")
    if url:
        logger.info("Using DATABASE_URL")
        return url

    # Затем проверяем apex_POSTGRES_PRISMA_URL
    url = os.getenv("apex_POSTGRES_PRISMA_URL")
    if url:
        logger.info("Using apex_POSTGRES_PRISMA_URL")
        return url

    # Затем apex_POSTGRES_URL
    url = os.getenv("apex_POSTGRES_URL")
    if url:
        logger.info("Using apex_POSTGRES_URL")
        return url

    # Затем apex_POSTGRES_URL_NON_POOLING
    url = os.getenv("apex_POSTGRES_URL_NON_POOLING")
    if url:
        logger.info("Using apex_POSTGRES_URL_NON_POOLING")
        return url

    # Если ничего не найдено, логируем ошибку
    logger.error("No database URL found in environment variables!")
    logger.info(f"Available env vars: {[k for k in os.environ.keys() if 'POSTGRES' in k or 'DATABASE' in k]}")
    return None


DATABASE_URL = get_database_url()

if not DATABASE_URL:
    # Создаем фейковый URL для предотвращения ошибки импорта
    # Приложение запустится, но будет показывать ошибку подключения
    DATABASE_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder"
    logger.error("Using placeholder DATABASE_URL - database will not work!")

# Конвертируем postgres:// в postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    logger.info("Converted postgres:// to postgresql://")

# Добавляем sslmode если нужно
if "sslmode=require" not in DATABASE_URL and "localhost" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"
    logger.info("Added sslmode=require")

# Скрываем пароль в логах
if "@" in DATABASE_URL:
    parts = DATABASE_URL.split("@")
    logger.info(f"Connecting to: {parts[0].split(':')[0]}:***@{parts[1][:50]}...")
else:
    logger.info(f"Connecting to: {DATABASE_URL[:50]}...")

# Создаем engine с настройками для Vercel
try:
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
        }
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    engine = None

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None

Base = declarative_base()


def get_db():
    if not SessionLocal:
        raise Exception("Database not configured properly")
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