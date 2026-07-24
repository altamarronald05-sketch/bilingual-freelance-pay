import time
from collections import defaultdict
from fastapi import HTTPException, status, Request
from typing import Dict, List

class InMemoryRateLimiter:
    """Rate Limiter en memoria para prevenir ataques de fuerza bruta y DDoS en endpoints sensibles."""
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def check_rate_limit(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Filtrar peticiones fuera de la ventana de tiempo
        timestamps = [t for t in self.requests[client_ip] if now - t < self.window_seconds]
        self.requests[client_ip] = timestamps
        
        if len(timestamps) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Demasiadas peticiones desde tu IP ({client_ip}). Intenta nuevamente en {self.window_seconds} segundos."
            )
            
        self.requests[client_ip].append(now)

auth_rate_limiter = InMemoryRateLimiter(max_requests=100, window_seconds=60)
