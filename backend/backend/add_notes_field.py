import os
import sys

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, inspect
from app.database import engine, SessionLocal


def add_notes_column():
    """Добавляет поле notes в таблицу clients если его нет"""

    print("🔍 Проверяем наличие поля notes в таблице clients...")

    try:
        # Используем инспектор для проверки структуры таблицы
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('clients')]

        if 'notes' in columns:
            print("✅ Поле notes уже существует в таблице clients")
            return

        # Если поле отсутствует, добавляем его
        print("🔧 Добавляем поле notes...")

        with engine.connect() as conn:
            # Для PostgreSQL
            conn.execute(text("ALTER TABLE clients ADD COLUMN notes TEXT;"))
            conn.commit()
            print("✅ Поле notes успешно добавлено в таблицу clients")

    except Exception as e:
        print(f"❌ Ошибка: {e}")
        print("\nВозможные решения:")
        print("1. Проверьте подключение к базе данных")
        print("2. Убедитесь, что таблица clients существует")
        print("3. Если используете SQLite, выполните:")
        print("   ALTER TABLE clients ADD COLUMN notes TEXT;")


if __name__ == "__main__":
    add_notes_column()