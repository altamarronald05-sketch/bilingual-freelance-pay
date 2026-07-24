import logging
import os
from datetime import datetime, timezone

# Configure dedicated audit log file
log_dir = os.path.join(os.getcwd(), "logs")
os.makedirs(log_dir, exist_ok=True)
audit_log_path = os.path.join(log_dir, "security_audit.log")

audit_logger = logging.getLogger("security_audit")
audit_logger.setLevel(logging.INFO)

file_handler = logging.FileHandler(audit_log_path, encoding="utf-8")
formatter = logging.Formatter("[%(asctime)s UTC] AUDIT | %(levelname)s | %(message)s")
file_handler.setFormatter(formatter)
audit_logger.addHandler(file_handler)

def log_security_event(event_type: str, user_email: str, details: str, ip_address: str = "127.0.0.1"):
    """Log immutable security event with ISO timestamp."""
    timestamp = datetime.now(timezone.utc).isoformat()
    log_msg = f"Event: {event_type} | User: {user_email} | IP: {ip_address} | Details: {details}"
    audit_logger.info(log_msg)
    # Use ASCII safe print to avoid Windows console UnicodeEncodeError (cp1252)
    print(f"[AUDIT LOG] {log_msg}")
