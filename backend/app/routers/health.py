from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/")
def root():
    return {
        "message": "APEX CRM API is running",
        "version": "1.0.0",
        "status": "online"
    }

@router.get("/health")
def health():
    return {"status": "healthy"}