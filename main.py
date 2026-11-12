from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from decimal import Decimal, ROUND_CEILING, ROUND_HALF_UP
from datetime import datetime, timezone, timedelta
from uuid import uuid4


app = FastAPI(
    title="RupeeLens - Person 1 Pricing API",
    description="Reverse pricing, settlement estimates and quote management",
    version="1.0.0"
)


# -----------------------------------------
# CORS CONFIGURATION
# -----------------------------------------


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------
# CONFIGURATION
# -----------------------------------------


QUOTE_VALID_MINUTES = 15
MAX_FX_RATE_AGE_MINUTES = 15


# Illustrative defaults only.
# Replace these with verified PayPal fee settings.
DEFAULT_TRANSACTION_FEE = Decimal("0.044")
DEFAULT_FIXED_FEE_USD = Decimal("0.30")
DEFAULT_FIXED_FEE_EUR = Decimal("0.35")


# In-memory quote storage for this demonstration
quotes = {}


# -----------------------------------------
# MONEY HELPERS
# -----------------------------------------


def money(value: Decimal) -> Decimal:
    return value.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )


def buyer_money(value: Decimal) -> Decimal:
    # Always round buyer price upward
    return value.quantize(
        Decimal("0.01"),
        rounding=ROUND_CEILING
    )


def now_utc():
    return datetime.now(timezone.utc)


# -----------------------------------------
# REQUEST MODELS
# -----------------------------------------


class PricingRequest(BaseModel):
    target_inr: Decimal = Field(gt=0)
    currency: str = Field(default="USD")

    # INR received per 1 USD or EUR
    reference_rate: Decimal = Field(gt=0)

    transaction_fee_rate: Decimal = Field(
        default=DEFAULT_TRANSACTION_FEE,
        ge=0,
        lt=1
    )

    fixed_fee: Decimal | None = None

    # Example 0.03 = 3% FX markup
    fx_markup: Decimal = Field(
        default=Decimal("0.03"),
        ge=0,
        lt=1
    )

    # Seller safety buffer
    safety_buffer: Decimal = Field(
        default=Decimal("0.05"),
        ge=0,
        lt=1
    )


class QuoteRequest(PricingRequest):
    seller_name: str = "Seller"


class FXRateUpdate(BaseModel):
    reference_rate: Decimal = Field(gt=0)

    source: str = Field(min_length=2)

    timestamp: datetime


# -----------------------------------------
# PRICING ENGINE
# -----------------------------------------


def calculate_price(data: PricingRequest):

    currency = data.currency.upper()

    if currency not in ["USD", "EUR"]:
        raise HTTPException(
            status_code=400,
            detail="Currency must be USD or EUR"
        )

    fixed_fee = data.fixed_fee

    if fixed_fee is None:
        fixed_fee = (
            DEFAULT_FIXED_FEE_USD
            if currency == "USD"
            else DEFAULT_FIXED_FEE_EUR
        )

    if fixed_fee < 0:
        raise HTTPException(
            status_code=400,
            detail="Fixed fee cannot be negative"
        )

    # STEP 1: Calculate effective and safe exchange rates

    effective_rate = (
        data.reference_rate *
        (Decimal("1") - data.fx_markup)
    )

    safe_rate = (
        effective_rate *
        (Decimal("1") - data.safety_buffer)
    )

    # STEP 2: Calculate required buyer payment

    required_after_fee = data.target_inr / safe_rate

    gross = (
        required_after_fee + fixed_fee
    ) / (
        Decimal("1") - data.transaction_fee_rate
    )

    recommended_price = buyer_money(gross)

    # STEP 3: Calculate transaction fees

    percentage_fee = (
        recommended_price * data.transaction_fee_rate
    )

    transaction_fee = percentage_fee + fixed_fee

    after_transaction_fee = (
        recommended_price - transaction_fee
    )

    # STEP 4: Calculate currency conversion

    reference_conversion_inr = (
        after_transaction_fee * data.reference_rate
    )

    fx_markup_inr = (
        reference_conversion_inr * data.fx_markup
    )

    estimated_settlement = (
        reference_conversion_inr - fx_markup_inr
    )

    # STEP 5: Calculate settlement range

    settlement_low = (
        estimated_settlement *
        (Decimal("1") - data.safety_buffer)
    )

    settlement_high = (
        estimated_settlement *
        (Decimal("1") + data.safety_buffer)
    )

    # STEP 6: Return complete payment waterfall

    return {
        "currency": currency,

        "target_inr": money(data.target_inr),

        "recommended_buyer_price": recommended_price,

        "payment_waterfall": {
            "buyer_pays": recommended_price,

            "percentage_transaction_fee": money(
                percentage_fee
            ),

            "fixed_transaction_fee": money(
                fixed_fee
            ),

            "total_transaction_fee": money(
                transaction_fee
            ),

            "amount_after_transaction_fee": money(
                after_transaction_fee
            ),

            "reference_exchange_rate": data.reference_rate,

            "reference_conversion_inr": money(
                reference_conversion_inr
            ),

            "estimated_fx_markup_inr": money(
                fx_markup_inr
            ),

            "estimated_final_settlement_inr": money(
                estimated_settlement
            )
        },

        "reference_rate": data.reference_rate,

        "effective_fx_rate": effective_rate,

        "safe_fx_rate_used_for_pricing": safe_rate,

        "transaction_fee_rate": data.transaction_fee_rate,

        "fixed_fee": money(fixed_fee),

        "estimated_transaction_fee": money(
            transaction_fee
        ),

        "amount_after_transaction_fee": money(
            after_transaction_fee
        ),

        "estimated_fx_markup_in_inr": money(
            fx_markup_inr
        ),

        "estimated_settlement_inr": money(
            estimated_settlement
        ),

        "settlement_range_inr": {
            "low": money(settlement_low),
            "high": money(settlement_high)
        },

        "safety_buffer": data.safety_buffer,

        "calculation_timestamp": now_utc(),

        "disclaimer": (
            "All values are estimates. Actual PayPal fees, "
            "conversion rates and settlement amounts may vary."
        )
    }


# -----------------------------------------
# HEALTH & HOME
# -----------------------------------------


@app.get("/")
def home():
    return {
        "project": "RupeeLens",
        "module": "Person 1 - Pricing Engine & Core API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


# -----------------------------------------
# CALCULATE PRICE
# -----------------------------------------


@app.post("/api/v1/pricing/calculate")
def calculate_endpoint(data: PricingRequest):
    return calculate_price(data)


# -----------------------------------------
# CREATE QUOTE
# -----------------------------------------


@app.post("/api/v1/quotes")
def create_quote(data: QuoteRequest):

    result = calculate_price(data)

    quote_id = str(uuid4())

    created_at = now_utc()
    expires_at = created_at + timedelta(
        minutes=QUOTE_VALID_MINUTES
    )

    quote = {
        "quote_id": quote_id,
        "seller_name": data.seller_name,
        "status": "active",
        "created_at": created_at,
        "expires_at": expires_at,
        "request": data.model_dump(mode="json"),
        "pricing": result
    }

    quotes[quote_id] = quote

    return quote


# -----------------------------------------
# GET QUOTE
# -----------------------------------------


@app.get("/api/v1/quotes/{quote_id}")
def get_quote(quote_id: str):

    quote = quotes.get(quote_id)

    if quote is None:
        raise HTTPException(
            status_code=404,
            detail="Quote not found"
        )

    if now_utc() >= quote["expires_at"]:
        quote["status"] = "expired"

    return quote


# -----------------------------------------
# REFRESH QUOTE
# -----------------------------------------


# -----------------------------------------
# REFRESH QUOTE USING UPDATED FX RATE
# -----------------------------------------


@app.post("/api/v1/quotes/{quote_id}/refresh")
def refresh_quote(
    quote_id: str,
    fx_update: FXRateUpdate
):

    old_quote = quotes.get(quote_id)

    if old_quote is None:
        raise HTTPException(
            status_code=404,
            detail="Quote not found"
        )

    # STEP 1: Validate FX timestamp

    current_time = now_utc()
    rate_timestamp = fx_update.timestamp

    if rate_timestamp.tzinfo is None:
        raise HTTPException(
            status_code=400,
            detail="FX timestamp must include timezone"
        )

    if rate_timestamp > current_time + timedelta(minutes=1):
        raise HTTPException(
            status_code=400,
            detail="FX timestamp cannot be in the future"
        )

    if current_time - rate_timestamp > timedelta(
        minutes=MAX_FX_RATE_AGE_MINUTES
    ):
        raise HTTPException(
            status_code=400,
            detail="FX rate is too old. Request a fresh rate."
        )

    # STEP 2: Load the original quote inputs

    data = QuoteRequest.model_validate(
        old_quote["request"]
    )

    # STEP 3: Replace old FX rate with updated rate

    data.reference_rate = fx_update.reference_rate

    # STEP 4: Recalculate pricing

    new_pricing = calculate_price(data)

    created_at = now_utc()

    expires_at = created_at + timedelta(
        minutes=QUOTE_VALID_MINUTES
    )

    # STEP 5: Mark original quote as refreshed

    old_quote["status"] = "refreshed"

    # STEP 6: Create a new quote

    new_quote_id = str(uuid4())

    new_quote = {
        "quote_id": new_quote_id,
        "seller_name": old_quote["seller_name"],
        "status": "active",
        "created_at": created_at,
        "expires_at": expires_at,

        "request": data.model_dump(mode="json"),

        "pricing": new_pricing,

        "fx_rate_details": {
            "reference_rate": fx_update.reference_rate,
            "source": fx_update.source,
            "timestamp": rate_timestamp
        },

        "refreshed_from": quote_id
    }

    quotes[new_quote_id] = new_quote

    return new_quote


# -----------------------------------------
# LIST QUOTES
# -----------------------------------------


@app.get("/api/v1/quotes")
def list_quotes():

    for quote in quotes.values():
        if now_utc() >= quote["expires_at"]:
            if quote["status"] == "active":
                quote["status"] = "expired"

    return {
        "total": len(quotes),
        "quotes": list(quotes.values())
    }


# -----------------------------------------
# DELETE QUOTE
# -----------------------------------------


@app.delete("/api/v1/quotes/{quote_id}")
def delete_quote(quote_id: str):

    if quote_id not in quotes:
        raise HTTPException(
            status_code=404,
            detail="Quote not found"
        )

    del quotes[quote_id]

    return {
        "message": "Quote deleted",
        "quote_id": quote_id
    }


@app.get("/demo")
def demo():
    data = PricingRequest(
        target_inr=Decimal("10000"),
        currency="USD",
        reference_rate=Decimal("83"),
        transaction_fee_rate=Decimal("0.044"),
        fixed_fee=Decimal("0.30"),
        fx_markup=Decimal("0.03"),
        safety_buffer=Decimal("0.05")
    )

    return calculate_price(data)


# -----------------------------------------
# DEMO: TEST UPDATED FX RATE
# -----------------------------------------


@app.get("/demo/refresh")
def demo_refresh():

    # Create an original quote at ₹83/USD

    original_data = QuoteRequest(
        target_inr=Decimal("10000"),
        currency="USD",
        reference_rate=Decimal("83"),
        transaction_fee_rate=Decimal("0.044"),
        fixed_fee=Decimal("0.30"),
        fx_markup=Decimal("0.03"),
        safety_buffer=Decimal("0.05"),
        seller_name="Demo Seller"
    )

    original_quote = create_quote(original_data)

    # Simulate Person 2 providing a fresh rate of ₹84/USD

    updated_fx = FXRateUpdate(
        reference_rate=Decimal("84"),
        source="Person 2 FX Demo",
        timestamp=now_utc()
    )

    # Refresh the original quote

    return refresh_quote(
        original_quote["quote_id"],
        updated_fx
    )