import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Project, Contract, User, AuditLog
from app.api.v1.auth import get_current_user
from app.services.pdf_service import generate_contract_pdf

router = APIRouter(prefix="/contracts", tags=["Contracts"])

@router.get("/project/{project_id}/download")
def download_contract(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    if current_user.id not in [project.client_id, project.freelancer_id]:
        raise HTTPException(status_code=403, detail="No tienes acceso a los contratos de este proyecto")
        
    client_name = project.client.full_name if project.client else "Cliente Registrado"
    freelancer_name = project.freelancer.full_name if project.freelancer else "Freelancer Registrado"
    
    milestones_list = [
        {"title": m.title, "description": m.description, "amount": m.amount, "currency": m.currency, "status": m.status}
        for m in project.milestones
    ]
    
    pdf_filename = f"contract_project_{project.id}.pdf"
    pdf_dir = os.path.join(os.getcwd(), "generated_contracts")
    pdf_path = os.path.join(pdf_dir, pdf_filename)
    
    digital_signature = generate_contract_pdf(
        project_title=project.title,
        client_name=client_name,
        freelancer_name=freelancer_name,
        total_amount=project.total_amount,
        currency=project.currency,
        milestones_data=milestones_list,
        output_filepath=pdf_path
    )
    
    # Save contract record in DB
    existing_contract = db.query(Contract).filter(Contract.project_id == project.id).first()
    if not existing_contract:
        c = Contract(
            project_id=project.id,
            pdf_path=pdf_path,
            digital_signature=digital_signature
        )
        db.add(c)
        audit_log = AuditLog(
            user_id=current_user.id,
            action="CONTRACT_GENERATED",
            resource_type="Contract",
            resource_id=project.id
        )
        db.add(audit_log)
        db.commit()

    audit_download = AuditLog(
        user_id=current_user.id,
        action="CONTRACT_DOWNLOADED",
        resource_type="Contract",
        resource_id=project.id
    )
    db.add(audit_download)
    db.commit()

    return FileResponse(
        path=pdf_path,
        filename=f"Contrato_{project.title.replace(' ', '_')}.pdf",
        media_type="application/pdf"
    )

@router.get("/project/{project_id}/info")
def get_contract_info(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.project_id == project_id).first()
    if not contract:
        # Generate on the fly
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Proyecto no encontrado")
            
        if current_user.id not in [project.client_id, project.freelancer_id]:
            raise HTTPException(status_code=403, detail="No tienes acceso a los contratos de este proyecto")
        client_name = project.client.full_name if project.client else "Cliente Registrado"
        freelancer_name = project.freelancer.full_name if project.freelancer else "Freelancer Registrado"
        pdf_path = os.path.join(os.getcwd(), "generated_contracts", f"contract_project_{project.id}.pdf")
        milestones_list = [{"title": m.title, "amount": m.amount, "currency": m.currency, "status": m.status} for m in project.milestones]
        sig = generate_contract_pdf(project.title, client_name, freelancer_name, project.total_amount, project.currency, milestones_list, pdf_path)
        contract = Contract(project_id=project.id, pdf_path=pdf_path, digital_signature=sig)
        db.add(contract)
        db.commit()
        db.refresh(contract)
        
    return {
        "project_id": project_id,
        "digital_signature": contract.digital_signature,
        "signed_at": contract.signed_at,
        "pdf_download_url": f"/api/v1/contracts/project/{project_id}/download"
    }
