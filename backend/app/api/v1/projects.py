from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import User, Project, Milestone, MilestoneStatus, ProjectStatus
from app.schemas.schemas import ProjectCreate, ProjectResponse, MilestoneUpdateStatus, MilestoneResponse
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects & Milestones"])

@router.post("", response_model=ProjectResponse)
def create_project(project_in: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    freelancer_id = None
    if project_in.freelancer_email:
        fl_user = db.query(User).filter(User.email == project_in.freelancer_email).first()
        if fl_user:
            freelancer_id = fl_user.id
            
    total_amount = sum(m.amount for m in project_in.milestones)
    
    # Create project
    new_project = Project(
        title=project_in.title,
        description=project_in.description,
        client_id=current_user.id if current_user.role == "client" else (freelancer_id or current_user.id),
        freelancer_id=current_user.id if current_user.role == "freelancer" else freelancer_id,
        total_amount=total_amount,
        currency=project_in.currency,
        status=ProjectStatus.ACTIVE.value
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Create milestones
    for idx, m_in in enumerate(project_in.milestones):
        ms = Milestone(
            project_id=new_project.id,
            title=m_in.title,
            description=m_in.description,
            amount=m_in.amount,
            currency=m_in.currency,
            status=MilestoneStatus.PENDING.value,
            order_index=idx
        )
        db.add(ms)
    
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("", response_model=List[ProjectResponse])
def list_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Project).filter(
        (Project.client_id == current_user.id) | (Project.freelancer_id == current_user.id)
    ).all()

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    if current_user.id not in [project.client_id, project.freelancer_id]:
        raise HTTPException(status_code=403, detail="No tienes acceso a este proyecto")
        
    return project

@router.patch("/milestones/{milestone_id}/status", response_model=MilestoneResponse)
def update_milestone_status(
    milestone_id: int,
    status_update: MilestoneUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Hito no encontrado")
        
    project = db.query(Project).filter(Project.id == milestone.project_id).first()
    
    if current_user.id not in [project.client_id, project.freelancer_id]:
        raise HTTPException(status_code=403, detail="No tienes acceso a este proyecto")
    
    # State matrix validation
    new_status = status_update.status
    valid_statuses = [s.value for s in MilestoneStatus]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Opciones: {valid_statuses}")
        
    # Only client can mark as approved
    if new_status == MilestoneStatus.APPROVED.value and project.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo el cliente del proyecto puede aprobar y liberar fondos de un hito.")
        
    milestone.status = new_status
    if status_update.proof_link:
        milestone.proof_link = status_update.proof_link
    if status_update.proof_notes:
        milestone.proof_notes = status_update.proof_notes

    db.commit()
    db.refresh(milestone)
    return milestone
