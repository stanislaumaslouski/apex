from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, models, database
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CRM API",
    version="1.0.0",
    description="CRM система для управления клиентами на Supabase"
)

# Добавляем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        logger.info("Creating database tables...")
        database.Base.metadata.create_all(bind=database.engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        # Не падаем, а логируем ошибку
        # Таблицы могут уже существовать

@app.get("/")
def read_root():
    return {
        "message": "CRM API is running on Supabase",
        "version": "1.0.0",
        "database": "connected" if database.check_db_connection() else "disconnected"
    }

@app.get("/health")
def health_check():
    try:
        if database.check_db_connection():
            return {
                "status": "healthy",
                "database": "connected",
                "message": "All systems operational"
            }
        else:
            return {
                "status": "unhealthy",
                "database": "disconnected",
                "message": "Cannot connect to database"
            }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# CREATE - Создать клиента
@app.post("/clients/", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(client: schemas.ClientCreate, db: Session = Depends(database.get_db)):
    try:
        # Проверяем, не существует ли клиент с таким email
        existing_client = crud.get_client_by_email(db, client.email)
        if existing_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        return crud.create_client(db=db, client=client)
    except Exception as e:
        logger.error(f"Error creating client: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# READ - Получить всех клиентов
@app.get("/clients/", response_model=List[schemas.ClientResponse])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    try:
        return crud.get_clients(db, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error getting clients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# READ - Получить одного клиента по ID
@app.get("/clients/{client_id}", response_model=schemas.ClientResponse)
def read_client(client_id: int, db: Session = Depends(database.get_db)):
    client = crud.get_client(db, client_id=client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client

# UPDATE - Обновить клиента
@app.put("/clients/{client_id}", response_model=schemas.ClientResponse)
def update_client(
    client_id: int,
    client_update: schemas.ClientUpdate,
    db: Session = Depends(database.get_db)
):
    client = crud.update_client(db, client_id=client_id, client_update=client_update)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client

# DELETE - Удалить клиента
@app.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(database.get_db)):
    client = crud.delete_client(db, client_id=client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return None