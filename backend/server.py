import asyncio
from contextlib import suppress
from fastapi import FastAPI, APIRouter, Query, HTTPException, Request, Response, Depends
import bcrypt
import jwt
import stripe
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel
from bson import ObjectId
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Annotated, List
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else str(v))]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    def to_mongo(self) -> dict:
        return self.model_dump(by_alias=True)

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls(**doc)


# One entry per collection: every field a route filters, sorts or dedupes on. Add the index in the same edit as the query.
INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("timestamp", DESCENDING)], name="timestamp_desc"),
    ],
    "quote_requests": [
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ],
    "appointments": [
        IndexModel([("date", ASCENDING)], name="date_asc"),
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ],
    "sell_quotes": [
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ],
    "reviews": [
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
        IndexModel([("approved", ASCENDING)], name="approved_asc"),
    ],
    "users": [
        IndexModel([("email", ASCENDING)], name="email", unique=True),
    ],
    "login_attempts": [
        IndexModel([("identifier", ASCENDING)], name="identifier"),
    ],
    "buy_quotes": [
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ],
    "payment_transactions": [
        IndexModel([("session_id", ASCENDING)], name="session_id", unique=True),
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logging.getLogger(__name__).error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class QuoteRequest(BaseDocument):
    name: str
    phone: str
    email: str = ""
    device: str
    issue: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteCreate(BaseModel):
    name: str
    phone: str
    email: str = ""
    device: str
    issue: str

class QuoteOut(BaseModel):
    id: str
    created_at: datetime

class Appointment(BaseDocument):
    name: str
    phone: str
    email: str = ""
    device: str
    service: str
    date: str
    time: str
    notes: str = ""
    status: str = "requested"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    name: str
    phone: str
    email: str = ""
    device: str
    service: str
    date: str
    time: str
    notes: str = ""

class BuyQuote(BaseDocument):
    name: str
    phone: str
    email: str = ""
    device: str
    storage: str = ""
    carrier: str = ""
    budget: str = ""
    condition: str = ""
    notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BuyQuoteCreate(BaseModel):
    name: str
    phone: str
    email: str = ""
    device: str
    storage: str = ""
    carrier: str = ""
    budget: str = ""
    condition: str = ""
    notes: str = ""

class SellQuote(BaseDocument):
    name: str
    phone: str
    email: str = ""
    device: str
    storage: str = ""
    condition: str
    carrier: str = ""
    notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SellQuoteCreate(BaseModel):
    name: str
    phone: str
    email: str = ""
    device: str
    storage: str = ""
    condition: str = ""
    carrier: str = ""
    notes: str = ""

class AppointmentOut(BaseModel):
    id: str
    date: str
    time: str
    status: str


# Add your routes to the router instead of directly on app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/quote", response_model=QuoteOut)
async def create_quote(input: QuoteCreate):
    data = input.model_dump()
    for field in ("name", "phone", "device", "issue"):
        if not str(data.get(field, "")).strip():
            raise HTTPException(status_code=422, detail="Name, phone, device and issue are required.")
    quote = QuoteRequest(**data)
    await db.quote_requests.insert_one(quote.to_mongo())
    return QuoteOut(id=str(quote.id), created_at=quote.created_at)

APPT_HOURS = {0: (8, 17), 1: (8, 17), 2: (8, 17), 3: (8, 17), 4: (8, 17), 5: (9, 15)}  # weekday() -> open/close hour; Sunday closed


@api_router.post("/appointment", response_model=AppointmentOut)
async def create_appointment(input: AppointmentCreate):
    data = input.model_dump()
    for field in ("name", "phone", "device", "service", "date", "time"):
        if not str(data.get(field, "")).strip():
            raise HTTPException(status_code=422, detail="Name, phone, device, service, date and time are required.")
    try:
        day = datetime.strptime(data["date"], "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid date.")
    if day < datetime.now(timezone.utc).date():
        raise HTTPException(status_code=422, detail="Pick a date in the future.")
    if day.weekday() not in APPT_HOURS:
        raise HTTPException(status_code=422, detail="We're closed on Sundays — pick another day.")
    try:
        t = datetime.strptime(data["time"], "%I:%M %p")
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid time.")
    minutes = t.hour * 60 + t.minute
    open_m, close_m = APPT_HOURS[day.weekday()]
    if minutes < open_m * 60 or minutes > close_m * 60 - 30:
        raise HTTPException(status_code=422, detail="That time is outside our hours for that day.")
    appt = Appointment(**data)
    await db.appointments.insert_one(appt.to_mongo())
    return AppointmentOut(id=str(appt.id), date=appt.date, time=appt.time, status=appt.status)

@api_router.post("/sell-quote")
async def create_sell_quote(input: SellQuoteCreate):
    data = input.model_dump()
    for field in ("name", "phone", "device", "condition"):
        if not str(data.get(field, "")).strip():
            raise HTTPException(status_code=422, detail="Name, phone, device and condition are required.")
    doc = SellQuote(**data)
    await db.sell_quotes.insert_one(doc.to_mongo())
    return {"id": str(doc.id), "status": "received"}

@api_router.post("/buy-quote")
async def create_buy_quote(input: BuyQuoteCreate):
    data = input.model_dump()
    for field in ("name", "phone", "device"):
        if not str(data.get(field, "")).strip():
            raise HTTPException(status_code=422, detail="Name, phone and device are required.")
    doc = BuyQuote(**data)
    await db.buy_quotes.insert_one(doc.to_mongo())
    return {"id": str(doc.id), "status": "received"}

# ---- Stripe payments (Flow A claimable sandbox) ----
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")


class PaymentCreate(BaseModel):
    kind: str = "invoice_payment"  # invoice_payment | phone_full | phone_deposit
    amount: float
    name: str
    phone: str = ""
    email: str = ""
    device: str = ""
    purpose: str = ""
    origin_url: str = ""


@api_router.post("/payments/checkout")
async def create_payment_checkout(req: PaymentCreate):
    cents = int(round(req.amount * 100))
    if cents < 100 or cents > 1_000_000:
        raise HTTPException(status_code=422, detail="Amount must be between $1 and $10,000.")
    if not req.name.strip():
        raise HTTPException(status_code=422, detail="Name is required.")
    if not req.origin_url.strip():
        raise HTTPException(status_code=422, detail="origin_url is required.")
    if req.kind in ("phone_full", "phone_deposit") and (not req.device.strip() or not req.phone.strip()):
        raise HTTPException(status_code=422, detail="Name, phone and device are required.")
    label = req.device.strip() if req.kind != "invoice_payment" else (req.purpose.strip() or "Repair payment")
    if req.kind == "phone_deposit":
        label = f"Deposit — {req.device.strip()}"
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],  # card fields render directly — no method list
            line_items=[{
                "quantity": 1,
                "price_data": {
                    "currency": "usd",
                    "unit_amount": cents,
                    "product_data": {"name": f"iFast Repair+ — {label}"},
                },
            }],
            success_url=f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{req.origin_url}/payment/cancel",
            **({"customer_email": req.email} if req.email.strip() else {}),
            metadata={
                "kind": req.kind, "name": req.name, "phone": req.phone,
                "email": req.email, "device": req.device, "purpose": req.purpose,
            },
        )
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=502, detail=f"Stripe error: {exc.user_message or str(exc)}")
    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "kind": req.kind,
        "name": req.name, "phone": req.phone, "email": req.email,
        "device": req.device, "purpose": req.purpose,
        "amount": cents, "currency": "usd",
        "status": "initiated", "payment_status": "pending",
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    })
    return {"checkout_url": session.url, "session_id": session.id}


@api_router.post("/payments/create-intent")
async def create_payment_intent(req: PaymentCreate):
    cents = int(round(req.amount * 100))
    if cents < 100 or cents > 1_000_000:
        raise HTTPException(status_code=422, detail="Amount must be between $1 and $10,000.")
    if not req.name.strip():
        raise HTTPException(status_code=422, detail="Name is required.")
    if req.kind in ("phone_full", "phone_deposit") and (not req.device.strip() or not req.phone.strip()):
        raise HTTPException(status_code=422, detail="Name, phone and device are required.")
    label = req.device.strip() if req.kind != "invoice_payment" else (req.purpose.strip() or "Repair payment")
    if req.kind == "phone_deposit":
        label = f"Deposit — {req.device.strip()}"
    try:
        intent = stripe.PaymentIntent.create(
            amount=cents,
            currency="usd",
            automatic_payment_methods={"enabled": True},
            metadata={"kind": req.kind, "name": req.name, "phone": req.phone, "email": req.email, "device": req.device, "purpose": req.purpose},
        )
    except stripe.error.StripeError as exc:
        raise HTTPException(status_code=502, detail=f"Stripe error: {exc.user_message or str(exc)}")
    await db.payment_transactions.insert_one({
        "session_id": intent.id,
        "payment_intent_id": intent.id,
        "kind": req.kind,
        "name": req.name, "phone": req.phone, "email": req.email,
        "device": req.device, "purpose": req.purpose,
        "amount": cents, "currency": "usd",
        "status": "initiated", "payment_status": "pending",
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    })
    return {"client_secret": intent.client_secret, "payment_intent_id": intent.id, "amount": cents}


class PaymentVerify(BaseModel):
    payment_intent_id: str


@api_router.post("/payments/verify")
async def verify_payment(input: PaymentVerify):
    try:
        pi = stripe.PaymentIntent.retrieve(input.payment_intent_id)
    except stripe.error.StripeError:
        raise HTTPException(status_code=502, detail="Couldn't verify the payment with Stripe.")
    if pi.status == "succeeded":
        await db.payment_transactions.update_one(
            {"payment_intent_id": input.payment_intent_id, "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": "paid", "updated_at": datetime.now(timezone.utc)}},
        )
        return {"status": "paid"}
    return {"status": pi.status}


class Review(BaseDocument):
    name: str
    rating: int = Field(ge=1, le=5)
    text: str
    device: str = ""
    approved: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    name: str
    rating: int = Field(ge=1, le=5)
    text: str
    device: str = ""

class ReviewOut(BaseModel):
    id: str
    name: str
    rating: int
    text: str
    device: str = ""
    created_at: datetime


@api_router.post("/reviews", response_model=ReviewOut)
async def create_review(input: ReviewCreate):
    if not input.name.strip() or not input.text.strip():
        raise HTTPException(status_code=422, detail="Name and review text are required.")
    review = Review(**input.model_dump())
    await db.reviews.insert_one(review.to_mongo())
    return ReviewOut(id=str(review.id), name=review.name, rating=review.rating, text=review.text, device=review.device, created_at=review.created_at)

@api_router.get("/reviews", response_model=List[ReviewOut])
async def get_reviews(limit: int = Query(50, ge=1, le=100)):
    docs = await db.reviews.find({"approved": {"$ne": False}}).sort("created_at", -1).limit(limit).to_list(limit)
    return [
        ReviewOut(id=str(d["_id"]), name=d["name"], rating=d["rating"], text=d["text"], device=d.get("device", ""), created_at=d["created_at"])
        for d in docs
    ]

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    if record.get("payment_status") != "paid":
        # Webhook fallback: webhooks can be delayed or unreachable — ask Stripe directly.
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid", "updated_at": datetime.now(timezone.utc)}},
                )
                record = await db.payment_transactions.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass  # transient Stripe error — fall through to whatever's in the DB
    return {"session_id": record["session_id"], "status": record["status"], "payment_status": record["payment_status"]}


@app.post("/api/stripe/webhook")  # exact path required by the platform's Stripe registration
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid signature.")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": obj.get("payment_status", "paid"), "updated_at": datetime.now(timezone.utc)}},
        )
    elif t == "payment_intent.succeeded":
        await db.payment_transactions.update_one(
            {"payment_intent_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": "paid", "updated_at": datetime.now(timezone.utc)}},
        )
    elif t == "checkout.session.async_payment_succeeded":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc)}},
        )
    elif t == "checkout.session.async_payment_failed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"status": "failed", "payment_status": "failed", "updated_at": datetime.now(timezone.utc)}},
        )
    elif t == "checkout.session.expired":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"status": "expired", "payment_status": "expired", "updated_at": datetime.now(timezone.utc)}},
        )
    elif t == "charge.refunded":
        await db.payment_transactions.update_one(
            {"stripe_payment_intent_id": obj.get("payment_intent")},
            {"$set": {"status": "refunded", "payment_status": "refunded", "updated_at": datetime.now(timezone.utc)}},
        )
    return {"status": "ok"}


# ---- Private admin auth (single seeded owner account) ----
JWT_SECRET_KEY = os.environ.get("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:  # seed once — never overwrite a password the owner changed
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })


class LoginInput(BaseModel):
    email: str
    password: str


@api_router.post("/auth/login")
async def auth_login(input: LoginInput, request: Request, response: Response):
    email = input.email.strip().lower()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("locked_until") and datetime.now(timezone.utc) < attempt["locked_until"]:
        raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user.get("password_hash", "")):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"failed": 1}, "$set": {"updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
        fresh = await db.login_attempts.find_one({"identifier": identifier})
        if fresh.get("failed", 0) >= MAX_LOGIN_ATTEMPTS:
            await db.login_attempts.update_one(
                {"identifier": identifier},
                {"$set": {"locked_until": datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES), "updated_at": datetime.now(timezone.utc)}},
            )
            raise HTTPException(status_code=429, detail="Too many attempts. Locked for 15 minutes.")
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    await db.login_attempts.delete_one({"identifier": identifier})
    access = create_access_token(str(user["_id"]), user["email"])
    refresh = create_refresh_token(str(user["_id"]))
    response.set_cookie(key="access_token", value=access, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"email": user["email"], "role": user.get("role", "admin")}


@api_router.post("/auth/logout")
async def auth_logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"status": "logged out"}


@api_router.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return {"email": user["email"], "role": user.get("role", "admin")}


@api_router.post("/auth/refresh")
async def auth_refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access = create_access_token(str(user["_id"]), user["email"])
    response.set_cookie(key="access_token", value=access, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    return {"status": "refreshed"}


@api_router.get("/admin/data")
async def get_admin_data(user: dict = Depends(get_current_user)):
    payments = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    sell_quotes = await db.sell_quotes.find({}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    buy_quotes = await db.buy_quotes.find({}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    appointments = await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    review_docs = await db.reviews.find({}).sort("created_at", -1).limit(200).to_list(200)
    reviews = [
        {"id": str(r["_id"]), "name": r.get("name", ""), "rating": r.get("rating", 0), "text": r.get("text", ""), "device": r.get("device", ""), "created_at": r.get("created_at")}
        for r in review_docs
    ]
    return {"payments": payments, "sell_quotes": sell_quotes, "buy_quotes": buy_quotes, "appointments": appointments, "reviews": reviews}


@api_router.delete("/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid review id.")
    result = await db.reviews.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found.")
    return {"status": "deleted"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(limit: int = Query(20, ge=1, le=100)):
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)

    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def start_index_build():
    await seed_admin()  # idempotent: creates the owner account only if missing
    app.state.index_task = asyncio.create_task(ensure_indexes())  # background: a big index build must not block boot

@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()  # stop a build still running before its client closes
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()
