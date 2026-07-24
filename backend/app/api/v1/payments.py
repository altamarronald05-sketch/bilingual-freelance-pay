from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import User, Milestone, Transaction, MilestoneStatus, TransactionStatus
from app.schemas.schemas import PaymentCreate, TransactionResponse
from app.api.v1.auth import get_current_user
from app.services.payment_service import process_sandbox_payment

router = APIRouter(prefix="/payments", tags=["Payments & Transactions"])

@router.post("/checkout", response_model=TransactionResponse)
def create_payment_checkout(
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    milestone = db.query(Milestone).filter(Milestone.id == payment_in.milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Hito no encontrado")
        
    # Process simulated payment
    payment_res = process_sandbox_payment(
        milestone_id=milestone.id,
        amount=payment_in.amount,
        currency=payment_in.currency,
        payment_method=payment_in.payment_method
    )
    
    # Save transaction record
    new_tx = Transaction(
        milestone_id=milestone.id,
        project_id=milestone.project_id,
        amount=payment_res["amount"],
        currency=payment_res["currency"],
        payment_method=payment_res["payment_method"],
        status=TransactionStatus.COMPLETED.value,
        tx_hash=payment_res["tx_hash"]
    )
    db.add(new_tx)
    
    # Auto-approve / fund milestone
    milestone.status = MilestoneStatus.APPROVED.value
    
    db.commit()
    db.refresh(new_tx)
    return new_tx

@router.get("/transactions", response_model=List[TransactionResponse])
def get_user_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Transaction).all()
