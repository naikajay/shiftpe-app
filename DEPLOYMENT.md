# ShiftPe Deployment Notes

## Backend

Recommended MVP hosts: Render or Railway.

Set these environment variables:

- `NODE_ENV=production`
- `PORT`
- `MONGO_URI` as a MongoDB Atlas SRV URI, for example `mongodb+srv://<username>:<password>@<cluster-url>/shiftpe?retryWrites=true&w=majority`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `RATE_LIMIT_MAX`
- `FIREBASE_SERVICE_ACCOUNT_PATH` or platform secret file equivalent
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `PLATFORM_FEE_PERCENT`

Production command:

```bash
npm install
npm start
```

Use MongoDB Atlas, not a local MongoDB instance. For true MongoDB transactions, use an Atlas replica set or sharded cluster.

## Mobile

Use Expo EAS Build.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

Set Expo env:

- `EXPO_PUBLIC_API_BASE_URL=https://your-backend.example.com/api`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Admin Panel

The mobile app now has a minimal admin dashboard for admin users.

For a separate production admin panel, create a Next.js or React Admin app that consumes:

- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId`
- `GET /api/admin/tasks`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:reportId`
- `GET /api/admin/payments`
- `GET /api/admin/verifications`
- `PATCH /api/admin/verifications/:verificationId`
