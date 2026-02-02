# 🔍 Render Environment Variables - Complete Checklist

Your server keeps timing out because it's crashing during startup. Here's **every environment variable** you need in Render.

## ✅ Required Environment Variables

Copy these **exact values** into Render → Your Service → Environment:

### 1. DATABASE_URL (CRITICAL)

```
postgresql://postgres:78901234%40UHI_Portal@db.lhojbfhsmfalhfpfhjvw.supabase.co:5432/postgres
```

**Important:**

- ✅ Starts with `postgresql://` (not `postgres://`)
- ✅ Password has `%40` (not `@`)
- ✅ Port is `:5432`
- ✅ **NO quotes** when pasting into input field
- ✅ **NO trailing spaces**

### 2. JWT_SECRET (CRITICAL)

```
NmcAZMNQEbE9yePLmCk86JzjF7ZDHYReDKGl6uTE8dY=
```

**Important:**

- ✅ Must be at least 32 characters (this one is 44, perfect)
- ✅ Copy exactly as shown

### 3. PORT

```
3000
```

### 4. NODE_ENV

```
production
```

### 5. CORS_ORIGIN

```
*
```

**Note:** Change this to your actual frontend URL later (e.g., `https://yourapp.vercel.app`)

---

## 🚫 DO NOT ADD These (Optional/Not Needed)

- ❌ **DO NOT** add `REDIS_URL` (app runs without it)
- ❌ **DO NOT** add `SMTP_*` variables (not needed for testing)
- ❌ **DO NOT** add `STRIPE_*` variables (not needed for testing)

---

## 📋 Verification Steps

After adding the variables above:

1. **Go to Render Dashboard** → Your Service → **Environment**
2. **Verify you have exactly 5 variables:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT`
   - `NODE_ENV`
   - `CORS_ORIGIN`
3. **Click "Save Changes"**
4. **Wait for auto-redeploy** (~2 minutes)

---

## 🔍 How to See What's Actually Failing

1. Go to Render → Your Service → **Logs**
2. Look for error messages after `Running 'npm start'`
3. Share the error message if it still fails

**Common errors to look for:**

- `❌ Environment validation failed` → Check JWT_SECRET is correct
- `❌ Failed to start server: FATAL:` → Check DATABASE_URL format
- `Error: EADDRINUSE` → Port conflict (shouldn't happen on Render)

---

## 🆘 If It Still Fails After This

Share the **exact error message** from the Render logs (the lines after `npm start`). The error will tell us exactly what's wrong.

---

## ✨ What Success Looks Like

When it works, you'll see in the logs:

```
{"level":"info","message":"Redis not configured, running without cache"}
{"level":"info","message":"✅ Connected to database"}
{"level":"info","message":"🚀 Server running on port 3000"}
```

And Render will show:

```
==> Your service is live 🎉
```

---

**TL;DR:** Add exactly 5 environment variables (DATABASE_URL, JWT_SECRET, PORT, NODE_ENV, CORS_ORIGIN) with the exact values above, no quotes, no spaces.
