import os
import sys
import logging
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.database import DATABASE_URL
from app import models
from app.database import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_existing_columns(table_name: str, engine) -> list:
    """Получает список существующих колонок в таблице"""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = :table_name
        """), {"table_name": table_name})
        return [row[0] for row in result.fetchall()]


def add_column_if_not_exists(engine, table_name: str, column_name: str, column_type: str):
    """Добавляет колонку, если её нет"""
    existing = get_existing_columns(table_name, engine)
    if column_name not in existing:
        with engine.connect() as conn:
            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))
            conn.commit()
            logger.info(f"✅ Added column: {column_name}")
    else:
        logger.info(f"ℹ️ Column already exists: {column_name}")


def run_migrations():
    """Выполняет миграции"""
    try:
        logger.info("Starting migrations for Vercel...")
        engine = create_engine(DATABASE_URL)

        # Создаем таблицы, если их нет
        logger.info("Creating tables if not exist...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tables created/verified")

        # Проверяем и добавляем колонку country
        add_column_if_not_exists(engine, "clients", "country", "VARCHAR(10)")

        logger.info("✅ Migrations completed successfully!")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        raise