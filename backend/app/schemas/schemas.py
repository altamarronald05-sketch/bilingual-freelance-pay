from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- AUTH & USER ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "freelancer" # "freelancer" | "client"
    preferred_currency: str = "USD"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    preferred_currency: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- MILESTONE ---
class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    currency: str = "USD"
    proof_link: Optional[str] = None
    proof_notes: Optional[str] = None

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdateStatus(BaseModel):
    status: str # "pending", "in_progress", "under_review", "approved"
    proof_link: Optional[str] = None
    proof_notes: Optional[str] = None

class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    status: str
    proof_link: Optional[str] = None
    proof_notes: Optional[str] = None
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- PROJECT ---
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    freelancer_email: Optional[str] = None
    currency: str = "USD"
    milestones: List[MilestoneCreate]

class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    client_id: int
    freelancer_id: Optional[int]
    total_amount: float
    currency: str
    status: str
    created_at: datetime
    milestones: List[MilestoneResponse] = []
    client: Optional[UserResponse] = None
    freelancer: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- PAYMENTS & TRANSACTIONS ---
class PaymentCreate(BaseModel):
    milestone_id: int
    payment_method: str = "stripe" # "stripe", "crypto_btc", "crypto_eth", "crypto_usdt"
    amount: float
    currency: str = "USD"

class TransactionResponse(BaseModel):
    id: int
    milestone_id: int
    project_id: int
    amount: float
    currency: str
    payment_method: str
    status: str
    tx_hash: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- CURRENCY CONVERTER ---
class CurrencyConvertRequest(BaseModel):
    from_currency: str
    to_currency: str
    amount: float

class CurrencyRatesResponse(BaseModel):
    base: str
    rates: dict
