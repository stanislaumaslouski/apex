import os
import sys
import subprocess

sys.path.append(os.path.dirname(os.path.dirname(__file__)))


def run_local_migrations():
    """Запускает Alembic миграции локально"""
    try:
        # Переходим в папку backend
        backend_dir = os.path.dirname(os.path.dirname(__file__))
        os.chdir(backend_dir)

        print("🔄 Running Alembic migrations...")

        # Создаем новую миграцию
        result = subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "auto_migration"],
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print("⚠️", result.stderr)

        # Применяем миграции
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print("⚠️", result.stderr)

        print("✅ Migrations completed!")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    run_local_migrations()