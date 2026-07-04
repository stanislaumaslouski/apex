from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging
import urllib.parse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()


def clean_database_url(url):
    """Очищает строку подключения от нестандартных параметров"""
    if not url:
        return url

    # Удаляем параметр pgbouncer если он есть
    if 'pgbouncer=true' in url:
        url = url.replace('&pgbouncer=true', '')
        url = url.replace('?pgbouncer=true&', '?')
        url = url.replace('?pgbouncer=true', '')
        logger.info("Removed pgbouncer parameter from connection string")

    # Конвертируем postgres:// в postgresql://
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)
        logger.info("Converted postgres:// to postgresql://")

    # Убеждаемся, что sslmode=require присутствует
    if 'sslmode=require' not in url and 'localhost' not in url:
        if '?' in url:
            url += '&sslmode=require'
        else:
            url += '?sslmode=require'
        logger.info("Added sslmode=require")

    return url


def get_database_url():
    """Получает и очищает DATABASE_URL"""
    # Сначала проверяем DATABASE_URL
    url = os.getenv("DATABASE_URL")
    if url:
        logger.info("Using DATABASE_URL")
        return clean_database_url(url)

    # Затем apex_POSTGRES_PRISMA_URL
    url = os.getenv("apex_POSTGRES_PRISMA_URL")
    if url:
        logger.info("Using apex_POSTGRES_PRISMA_URL")
        return clean_database_url(url)

    # Затем apex_POSTGRES_URL
    url = os.getenv("apex_POSTGRES_URL")
    if url:
        logger.info("Using apex_POSTGRES_URL")
        return clean_database_url(url)

    # Затем apex_POSTGRES_URL_NON_POOLING
    url = os.getenv("apex_POSTGRES_URL_NON_POOLING")
    if url:
        logger.info("Using apex_POSTGRES_URL_NON_POOLING")
        return clean_database_url(url)

    logger.error("No database URL found!")
    return None


DATABASE_URL = get_database_url()

if not DATABASE_URL:
    DATABASE_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder"
    logger.error("Using placeholder DATABASE_URL - database will not work!")

# Логируем информацию о подключении (без пароля)
if '@' in DATABASE_URL and 'placeholder' not in DATABASE_URL:
    parts = DATABASE_URL.split('@')
    logger.info(f"Connecting to: {parts[0].split(':')[0]}:***@{parts[1][:50]}...")
else:
    logger.info(f"Using database URL (cleaned)")

# Создаем engine
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
        } if 'localhost' not in DATABASE_URL else {}
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