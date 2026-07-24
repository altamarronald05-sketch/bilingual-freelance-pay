import uuid
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any

def process_sandbox_payment(milestone_id: int, amount: float, currency: str, payment_method: str) -> Dict[str, Any]:
    """Simulate instant Sandbox payment for Stripe Credit Card or Crypto Wallet (BTC/ETH/USDT)."""
    tx_uuid = str(uuid.uuid4())
    
    if payment_method.startswith("crypto"):
        # Generate simulated blockchain transaction hash (0x...)
        hash_input = f"{tx_uuid}:{milestone_id}:{amount}:{datetime.now(timezone.utc).isoformat()}"
        tx_hash = "0x" + hashlib.sha256(hash_input.encode('utf-8')).hexdigest()
    else:
        # Generate simulated Stripe charge ID (ch_3M...)
        tx_hash = f"ch_sandbox_{tx_uuid[:16]}"
        
    return {
        "status": "completed",
        "tx_hash": tx_hash,
        "amount": amount,
        "currency": currency,
        "payment_method": payment_method,
        "milestone_id": milestone_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
