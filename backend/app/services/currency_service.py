import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Fallback conversion rates relative to USD in case external API fails or is offline
FALLBACK_RATES: Dict[str, float] = {
    "USD": 1.0,
    "COP": 4150.0,
    "EUR": 0.92,
    "BTC": 0.000015,
    "ETH": 0.00031,
    "USDT": 1.0
}

async def get_exchange_rates(base: str = "USD") -> Dict[str, Any]:
    """Fetch live currency exchange rates or use reliable fallback rates."""
    base = base.upper()
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"https://open.er-api.com/v6/latest/{base}")
            if response.status_code == 200:
                data = response.json()
                rates = data.get("rates", {})
                # Ensure crypto rates are included
                rates["BTC"] = FALLBACK_RATES["BTC"]
                rates["ETH"] = FALLBACK_RATES["ETH"]
                rates["USDT"] = 1.0
                return {"base": base, "rates": rates}
    except Exception as e:
        logger.warning(f"Error fetching live rates from API: {e}. Using cached rates.")
    
    # Calculate base rates from fallback dictionary
    base_rate_usd = FALLBACK_RATES.get(base, 1.0)
    calculated_rates = {}
    for curr, rate in FALLBACK_RATES.items():
        calculated_rates[curr] = rate / base_rate_usd

    return {"base": base, "rates": calculated_rates}

def convert_amount(amount: float, from_curr: str, to_curr: str, rates: Dict[str, float]) -> float:
    from_curr = from_curr.upper()
    to_curr = to_curr.upper()
    
    if from_curr == to_curr:
        return amount
        
    rate_from = rates.get(from_curr, FALLBACK_RATES.get(from_curr, 1.0))
    rate_to = rates.get(to_curr, FALLBACK_RATES.get(to_curr, 1.0))
    
    # Convert from source to USD then to target currency
    amount_in_usd = amount / rate_from if rate_from else amount
    converted = amount_in_usd * rate_to
    return round(converted, 2) if to_curr in ["USD", "COP", "EUR"] else round(converted, 6)
