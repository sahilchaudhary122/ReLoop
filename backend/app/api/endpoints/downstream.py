from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.batch import BatchResponse
from app.schemas.downstream import BatchReceiveRequest, WeightVerificationRequest, RecyclerReceiveRequest, ProcessingConfirmationRequest
from app.services.downstream_service import downstream_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/batches/{id}/receive", response_model=BatchResponse)
def aggregator_receive(id: int, req: BatchReceiveRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.AGGREGATOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Aggregators can receive batches")
    return downstream_service.aggregator_receive(db, id, current_user, req.latitude, req.longitude)

@router.post("/batches/{id}/verify-weight", response_model=BatchResponse)
def aggregator_verify_weight(id: int, req: WeightVerificationRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.AGGREGATOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Aggregators can verify weight")
    items_weights = [item.dict() for item in req.items]
    return downstream_service.aggregator_verify_weight(db, id, items_weights, current_user, req.latitude, req.longitude)

@router.post("/batches/{id}/sort", response_model=BatchResponse)
def aggregator_sort(id: int, req: BatchReceiveRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.AGGREGATOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Aggregators can sort batches")
    return downstream_service.aggregator_sort(db, id, current_user, req.latitude, req.longitude)

@router.post("/batches/{id}/recycler-receive", response_model=BatchResponse)
def recycler_receive(id: int, req: RecyclerReceiveRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.RECYCLER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Recyclers can receive batches")
    items_weights = [item.dict() for item in req.items]
    return downstream_service.recycler_receive(db, id, items_weights, current_user, req.latitude, req.longitude)

@router.post("/batches/{id}/process", response_model=BatchResponse)
def recycler_process(id: int, req: ProcessingConfirmationRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.RECYCLER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Recyclers can process batches")
    return downstream_service.recycler_process(db, id, current_user, req.latitude, req.longitude)
