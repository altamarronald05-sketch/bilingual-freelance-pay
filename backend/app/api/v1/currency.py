from fastapi import APIRouter
from app.schemas.schemas import CurrencyRatesResponse, CurrencyConvertRequest
from app.services.currency_service import get_exchange_rates, convert_amount

router = APIRouter(prefix="/currency", tags=["Currency Converter"])

@router.get("/rates", response_model=CurrencyRatesResponse)
async def fetch_rates(base: str = "USD"):
    rates_data = await get_exchange_rates(base=base)
    return CurrencyRatesResponse(base=rates_data["base"], rates=rates_data["rates"])

@router.post("/convert")
async def convert_currency(req: CurrencyConvertRequest):
    rates_data = await get_exchange_rates(base="USD")
    rates = rates_data.get("rates", {})
    converted = convert_amount(req.amount, req.from_currency, req.to_currency, rates)
    return {
        "from": req.from_currency,
        "to": req.to_currency,
        "original_amount": req.amount,
        "converted_amount": converted
    }
