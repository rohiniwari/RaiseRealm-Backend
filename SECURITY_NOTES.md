# Security & Production Checklist

## ⚠️ CRITICAL BEFORE DEPLOYMENT

### 1. Credential Rotation (DO THIS NOW)
Your `.env` file currently contains:
- `STRIPE_SECRET_KEY` - exposed in repository history
- `STRIPE_PUBLISHABLE_KEY` - safe to commit (public)
- `STRIPE_WEBHOOK_SECRET` - sensitive
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - sensitive
- `SUPABASE_URL` / `SUPABASE_KEY` - sensitive
- `JWT_SECRET` - this is your app's signing key

**Action Required:**
1. Go to Stripe Dashboard → Developers → API Keys → Regenerate Secret Key
2. Update your `.env` with the new key
3. Rotate your JWT_SECRET to a new random value (min 32 chars)
4. Rotate Google OAuth credentials
5. Never commit `.env` file (check .gitignore includes it)
6. Add this note to your README: "Credentials are regenerated on every deployment"

### 2. Rate Limiting Added ✅
- `/api/auth` routes now have 20 requests per 15 minutes per IP
- This prevents brute force attacks on login/register

### 3. CORS Configuration ✅
- Updated to include both Netlify and Vercel URLs
- `raise-realm.netlify.app`
- `www.raise-realm.netlify.app`
- `raiserealm.vercel.app`
- `www.raiserealm.vercel.app`

### 4. Environment Variables Best Practices
```bash
# ✅ DO THIS
# In production CI/CD (e.g., Vercel), set these as secrets:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=<random-32-char-string>
SUPABASE_KEY=<your-api-key>

# ❌ DON'T DO THIS
# Don't commit sensitive values
# Don't log them in console
# Don't expose in error messages
```

### 5. SQL Injection Prevention ✅
- All database queries use parameterized queries via Supabase
- User input is never concatenated into SQL

### 6. Authentication ✅
- JWT tokens validated on every protected route
- Passwords hashed with bcrypt (10 salt rounds)
- Token expiration set to 7 days

### 7. Data Validation ✅
- All inputs validated with express-validator
- Schema validation with Zod on frontend

## For Recruiters / Interviews

**What You've Implemented:**
- ✅ Role-based access control (creator vs backer)
- ✅ Secure payment integration (Stripe)
- ✅ Rate limiting on auth endpoints
- ✅ Atomic transactions with RPC functions
- ✅ CORS properly configured for production

**What You Should Say:**
"In production, all credentials are stored as environment secrets in CI/CD (Vercel, for example). The `.env` file is never committed. JWT_SECRET, Stripe keys, and Supabase credentials are all rotated after initial deployment. Rate limiting prevents brute force attacks on login."

**What's Still a Portfolio Project (OK to mention):**
- Notifications are in-memory (real apps use a notification service like Firebase Cloud Messaging)
- No end-to-end encryption (can add in future)
- No 2FA (can add later)
- Success Stories endpoint fetches all data (can add pagination in future)

