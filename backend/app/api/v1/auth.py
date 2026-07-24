from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, UserRole
from app.schemas.schemas import UserRegister, UserResponse, Token, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.rate_limiter import auth_rate_limiter
from app.services.audit_logger import log_security_event

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    email = decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.post("/register", response_model=Token)
def register_user(user_in: UserRegister, request: Request, db: Session = Depends(get_db)):
    auth_rate_limiter.check_rate_limit(request)
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        log_security_event("REGISTER_FAILED", user_in.email, "Email already registered", request.client.host if request.client else "127.0.0.1")
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        password_hash=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role,
        preferred_currency=user_in.preferred_currency
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    log_security_event("REGISTER_SUCCESS", new_user.email, f"Role: {new_user.role}", request.client.host if request.client else "127.0.0.1")
    access_token = create_access_token(subject=new_user.email)
    return Token(access_token=access_token, token_type="bearer", user=new_user)

@router.post("/login", response_model=Token)
def login_user(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    auth_rate_limiter.check_rate_limit(request)
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        log_security_event("LOGIN_FAILED", form_data.username, "Invalid password or email", request.client.host if request.client else "127.0.0.1")
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    log_security_event("LOGIN_SUCCESS", user.email, "JWT token issued", request.client.host if request.client else "127.0.0.1")
    access_token = create_access_token(subject=user.email)
    return Token(access_token=access_token, token_type="bearer", user=user)

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
