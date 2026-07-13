from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import logging
import sys
import os

# Импорты для Vercel (с префиксом backend.app)
from app import auth, models, database, crud, schemas

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


# ============ МАРШРУТЫ БЕЗ /api (для прямых запросов) ============

@app.get("/")
def root():
    return {
        "message": "APEX CRM API is running",
        "version": "1.0.0",
        "status": "online"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


# ============ МАРШРУТЫ С /api (для фронтенда на Vercel) ============

@app.get("/api")
def api_root():
    return {
        "message": "APEX CRM API is running",
        "version": "1.0.0",
        "status": "online"
    }


@app.get("/api/health")
def api_health():
    return {"status": "healthy"}


# ============ АВТОРИЗАЦИЯ (оба варианта) ============

# Регистрация без /api
@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return register_logic(user, db)


# Регистрация с /api
@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def api_register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return register_logic(user, db)


# Логин без /api
@app.post("/auth/login", response_model=schemas.Token)
def login(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(database.get_db)
):
    return login_logic(form_data, db)


# Логин с /api
@app.post("/api/auth/login", response_model=schemas.Token)
def api_login(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(database.get_db)
):
    return login_logic(form_data, db)


# Получение информации о пользователе без /api
@app.get("/auth/me", response_model=schemas.UserResponse)
async def get_current_user_info(
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return current_user


# Получение информации о пользователе с /api
@app.get("/api/auth/me", response_model=schemas.UserResponse)
async def api_get_current_user_info(
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return current_user


# ============ ЛОГИКА ДЛЯ АВТОРИЗАЦИИ ============

def register_logic(user: schemas.UserCreate, db: Session):
    """
    Логика регистрации пользователя
    """
    # Проверяем существование пользователя
    existing_user = auth.get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    existing_email = auth.get_user_by_email(db, user.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Создаем пользователя
    db_user = crud.create_user(db, user)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create user"
        )

    return db_user


def login_logic(form_data: OAuth2PasswordRequestForm, db: Session):
    """
    Логика входа пользователя
    """
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# ============ CRUD ДЛЯ КЛИЕНТОВ (оба варианта) ============

# CREATE - Создать клиента (без /api)
@app.post("/clients/", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
        client: schemas.ClientCreate,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return create_client_logic(client, db)


# CREATE - Создать клиента (с /api)
@app.post("/api/clients/", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
def api_create_client(
        client: schemas.ClientCreate,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return create_client_logic(client, db)


# READ - Получить всех клиентов (без /api)
@app.get("/clients/", response_model=List[schemas.ClientResponse])
def read_clients(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return read_clients_logic(skip, limit, db)


# READ - Получить всех клиентов (с /api)
@app.get("/api/clients/", response_model=List[schemas.ClientResponse])
def api_read_clients(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return read_clients_logic(skip, limit, db)


# READ - Получить одного клиента по ID (без /api)
@app.get("/clients/{client_id}", response_model=schemas.ClientResponse)
def read_client(
        client_id: int,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return read_client_logic(client_id, db)


# READ - Получить одного клиента по ID (с /api)
@app.get("/api/clients/{client_id}", response_model=schemas.ClientResponse)
def api_read_client(
        client_id: int,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return read_client_logic(client_id, db)


# UPDATE - Обновить клиента (без /api)
@app.put("/clients/{client_id}", response_model=schemas.ClientResponse)
def update_client(
        client_id: int,
        client_update: schemas.ClientUpdate,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return update_client_logic(client_id, client_update, db)


# UPDATE - Обновить клиента (с /api)
@app.put("/api/clients/{client_id}", response_model=schemas.ClientResponse)
def api_update_client(
        client_id: int,
        client_update: schemas.ClientUpdate,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return update_client_logic(client_id, client_update, db)


# DELETE - Удалить клиента (без /api)
@app.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
        client_id: int,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return delete_client_logic(client_id, db)


# DELETE - Удалить клиента (с /api)
@app.delete("/api/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def api_delete_client(
        client_id: int,
        db: Session = Depends(database.get_db),
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return delete_client_logic(client_id, db)


# ============ ЛОГИКА ДЛЯ КЛИЕНТОВ ============

def create_client_logic(client: schemas.ClientCreate, db: Session):
    try:
        existing_client = crud.get_client_by_email(db, client.email)
        if existing_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        return crud.create_client(db=db, client=client)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating client: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating client: {str(e)}"
        )


def read_clients_logic(skip: int, limit: int, db: Session):
    try:
        return crud.get_clients(db, skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error getting clients: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting clients: {str(e)}"
        )


def read_client_logic(client_id: int, db: Session):
    client = crud.get_client(db, client_id=client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client


def update_client_logic(client_id: int, client_update: schemas.ClientUpdate, db: Session):
    client = crud.update_client(db, client_id=client_id, client_update=client_update)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client


def delete_client_logic(client_id: int, db: Session):
    client = crud.delete_client(db, client_id=client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return None


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