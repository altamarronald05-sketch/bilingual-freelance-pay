import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import User, Milestone, Transaction, MilestoneStatus, TransactionStatus, Project, Contract, AuditLog
from app.schemas.schemas import PaymentCreate, TransactionResponse
from app.api.v1.auth import get_current_user
from app.services.payment_service import process_sandbox_payment
from app.services.pdf_service import generate_contract_pdf

router = APIRouter(prefix="/payments", tags=["Payments & Transactions"])

@router.post("/checkout", response_model=TransactionResponse)
@router.post("/create-checkout", response_model=TransactionResponse)
def create_payment_checkout(
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    milestone = db.query(Milestone).filter(Milestone.id == payment_in.milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Hito no encontrado")
        
    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    if not project or project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo el cliente del proyecto puede pagar los hitos.")
        
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
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="MILESTONE_PAID",
        resource_type="Milestone",
        resource_id=milestone.id
    )
    db.add(audit_log)

    db.commit()
    db.refresh(new_tx)
    return new_tx

@router.post("/webhook")
def payment_webhook(payload: dict, db: Session = Depends(get_db)):
    """Async webhook handler for Stripe/Crypto payment events."""
    event_type = payload.get("event", "payment.succeeded")
    data = payload.get("data", payload)
    
    milestone_id = data.get("milestone_id")
    if not milestone_id:
        raise HTTPException(status_code=400, detail="milestone_id es requerido en el payload")
        
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Hito no encontrado")

    amount = float(data.get("amount", milestone.amount))
    currency = data.get("currency", milestone.currency)
    payment_method = data.get("payment_method", "stripe")
    tx_hash = data.get("tx_hash", f"wh_{milestone_id}_success")

    new_tx = Transaction(
        milestone_id=milestone.id,
        project_id=milestone.project_id,
        amount=amount,
        currency=currency,
        payment_method=payment_method,
        status=TransactionStatus.COMPLETED.value,
        tx_hash=tx_hash
    )
    db.add(new_tx)

    milestone.status = MilestoneStatus.APPROVED.value
    
    project = db.query(Project).filter(Project.id == milestone.project_id).first()

    audit_log = AuditLog(
        user_id=project.client_id if project else None,
        action="WEBHOOK_PAYMENT_RECEIVED",
        resource_type="Milestone",
        resource_id=milestone.id
    )
    db.add(audit_log)

    # Auto-generate contract on payment success
    existing_contract = db.query(Contract).filter(Contract.project_id == project.id).first() if project else None
    if not existing_contract and project:
        client_name = project.client.full_name if project.client else "Cliente Registrado"
        freelancer_name = project.freelancer.full_name if project.freelancer else "Freelancer Registrado"
        pdf_dir = os.path.join(os.getcwd(), "generated_contracts")
        os.makedirs(pdf_dir, exist_ok=True)
        pdf_path = os.path.join(pdf_dir, f"contract_project_{project.id}.pdf")
        milestones_list = [{"title": m.title, "amount": m.amount, "currency": m.currency, "status": m.status} for m in project.milestones]
        
        try:
            sig = generate_contract_pdf(project.title, client_name, freelancer_name, project.total_amount, project.currency, milestones_list, pdf_path)
            contract = Contract(project_id=project.id, pdf_path=pdf_path, digital_signature=sig)
            db.add(contract)
        except Exception as e:
            print(f"Failed to generate contract on webhook: {e}")

    db.commit()

    return {"status": "success", "event": event_type, "milestone_id": milestone_id}

@router.get("/transactions", response_model=List[TransactionResponse])
def get_user_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Limit transactions to those belonging to projects where the user is client or freelancer
    return db.query(Transaction).join(Project, Transaction.project_id == Project.id).filter(
        (Project.client_id == current_user.id) | (Project.freelancer_id == current_user.id)
    ).all()

