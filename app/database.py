from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging
import urllib.parse

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Получаем DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Если DATABASE_URL не установлен, используем apex_POSTGRES_PRISMA_URL
if not DATABASE_URL:
    DATABASE_URL = os.getenv("apex_POSTGRES_PRISMA_URL")
    logger.info("Using apex_POSTGRES_PRISMA_URL as DATABASE_URL")

# Если и это не работает, используем apex_POSTGRES_URL
if not DATABASE_URL:
    DATABASE_URL = os.getenv("apex_POSTGRES_URL")
    logger.info("Using apex_POSTGRES_URL as DATABASE_URL")

# Проверяем, что переменная установлена
if not DATABASE_URL:
    logger.error("No database URL found in environment variables!")
    raise ValueError("DATABASE_URL environment variable is required")

# Убеждаемся, что используем правильный протокол
# Заменяем postgres:// на postgresql:// если нужно
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Убеждаемся, что sslmode=require присутствует
if "sslmode=require" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"

logger.info(f"Connecting to Supabase: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'database'}")

# Явно указываем драйвер для PostgreSQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=1,  # Уменьшаем для бессерверной среды
    max_overflow=2,
    echo=False,
    connect_args={
        "connect_timeout": 30,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_connection():
    """Проверка подключения к базе данных"""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False