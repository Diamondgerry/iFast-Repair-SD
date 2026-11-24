# iFast Repair+ — Full-Stack Website

Phone/computer repair shop website: React (Create React App + TailwindCSS) frontend, FastAPI + MongoDB backend, Stripe card payments (embedded card form), appointment booking with business-hours enforcement, and a private JWT-protected admin dashboard.

## Project structure (one section per feature)

```
frontend/
  src/
    pages/          ← one file per page
      Home.jsx          /          landing page + repair quote form
      ServicesPage.jsx  /services  all repair services
      BookPage.jsx      /book      appointment booking
      SellPage.jsx      /sell      sell-your-phone cash offers
      BuyPage.jsx       /buy       buy-a-phone price requests
      PayPage.jsx       /pay       pay any invoice by card
      CheckoutPage.jsx  /checkout  pay for a phone (full / 50% deposit)
      ReviewsPage.jsx   /reviews   customer reviews + submit form
      VisitPage.jsx     /visit     map, hours, contact, why-us, social, FAQ
      AdminPage.jsx     /admin     private owner dashboard (login required)
      PaymentSuccess.jsx / PaymentCancel.jsx
    components/     ← shared building blocks (Header, Footer, Hero, forms, map…)
    App.js          ← routes + smooth scrolling
    index.css       ← theme colors, fonts, shared styles
backend/
  server.py        ← the entire API: quotes, bookings, payments, reviews, admin auth
  requirements.txt ← Python dependencies
public/            ← favicon + static files
```

## Prerequisites

- Node.js 18+ with yarn (`npm i -g yarn`) or npm
- Python 3.10+
- A MongoDB database — a free MongoDB Atlas cluster works: https://www.mongodb.com/atlas
- A Stripe account (test keys are fine to start): https://dashboard.stripe.com/apikeys

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then open .env and fill in your values
uvicorn server:app --reload --port 8001
```

Backend runs at http://localhost:8001 — API docs at http://localhost:8001/docs

## 2. Frontend setup

```bash
cd frontend
yarn install                    # or: npm install
cp .env.example .env            # then fill in your values
yarn start                      # opens http://localhost:3000
```

## 3. Environment variables

### backend/.env
| Variable | What it is |
|---|---|
| MONGO_URL | Your MongoDB Atlas connection string |
| DB_NAME | Database name (e.g. ifast) |
| JWT_SECRET | Random 64-char hex: `python -c "import secrets;print(secrets.token_hex(32))"` |
| ADMIN_EMAIL | Login email for /admin |
| ADMIN_PASSWORD | Login password for /admin |
| FRONTEND_URL | http://localhost:3000 |
| STRIPE_SECRET_KEY | sk_test_… / sk_live_… from dashboard.stripe.com/apikeys |
| STRIPE_WEBHOOK_SECRET | whsec_… (optional — payments verify without it) |

### frontend/.env
| Variable | What it is |
|---|---|
| REACT_APP_BACKEND_URL | http://localhost:8001 |
| REACT_APP_STRIPE_PUBLISHABLE_KEY | pk_test_… / pk_live_… |

## 4. Admin dashboard

Visit http://localhost:3000/admin — sign in with ADMIN_EMAIL / ADMIN_PASSWORD.
Tabs: Payments, Sell quotes, Buy quotes, Bookings, Reviews (delete reviews there).

## 5. Stripe notes

- The site charges cards with a PaymentIntent + embedded card form (endpoints /api/payments/create-intent and /api/payments/verify).
- Webhooks are optional: point a Stripe webhook at /api/stripe/webhook if you want server-side event sync; payments are verified by polling Stripe otherwise.
- Test card: 4242 4242 4242 4242, any future expiry, any CVC.
- Going live: replace test keys with live keys and claim/activate your Stripe account.
