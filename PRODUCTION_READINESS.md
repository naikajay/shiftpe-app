# ShiftPe Production Readiness

## Functional Testing

- Auth: OTP login, JWT restore, logout cleanup, invalid-token rejection.
- Worker lifecycle: create profile, add skills, set availability, view nearby tasks, apply, chat, mark complete, see payment, receive rating.
- Customer lifecycle: login, post task, view applicants, approve request, chat, complete/pay/rate.
- Admin lifecycle: list users, list tasks, review worker KYC, inspect payments, moderate reports.
- Duplicate safety: duplicate task applications, duplicate ratings, repeated payment verify calls.

## Device Testing

- Low-end Android with 2GB RAM.
- Poor internet: slow 3G, offline, reconnect while chat is open.
- App background restore after OTP login and active task.
- Push/background behavior once notifications are added.

## Security Testing

- Missing/expired/forged JWTs.
- Role abuse: worker calls provider/admin APIs, provider calls worker-only APIs.
- Request abuse: large payloads, Mongo operator injection, invalid ObjectIds, duplicate requests.
- CORS restricted to production app origins.
- Rate-limit OTP/auth-sensitive routes more aggressively before launch.

## Payments Testing

- Razorpay success signature verification.
- Razorpay invalid signature rejection.
- Worker net amount and platform fee calculations.
- Repeated webhook/client verification idempotency.

## Launch Gates

- No hardcoded secrets in source.
- `.env.example` has every required variable.
- Backend health endpoint passes.
- Lifecycle smoke test passes against staging.
- EAS Android build installed on real devices.
