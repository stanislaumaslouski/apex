from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, models, database

# Создаем таблицы
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="APEX CRM API",
    version="1.0.0",
    description=""
)

# Добавляем CORS для разработки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "CRM API is running",
        "version": "1.0.0",
        "endpoints": {
            "clients": "/clients",
            "client_by_id": "/clients/{id}"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# CREATE - Создать клиента
@app.post("/clients/", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(client: schemas.ClientCreate, db: Session = Depends(database.get_db)):
    # Проверяем, не существует ли клиент с таким email
    existing_client = crud.get_client_by_email(db, client.email)
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return crud.create_client(db=db, client=client)

# READ - Получить всех клиентов
@app.get("/clients/", response_model=List[schemas.ClientResponse])
def read_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    clients = crud.get_clients(db, skip=skip, limit=limit)
    return clients

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