# 🔧 Render Environment Variables Setup

## Required Environment Variables for Backend Deployment

Copy these **exact values** into your Render service's Environment Variables section:

### 1. Database Connection (Supabase)

```bash
DATABASE_URL=postgresql://postgres.lhojbfhsmfalhfpfhjvw:78901234%40UHI_Portal@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. Direct Database URL (for migrations)

```bash
DIRECT_URL=postgresql://postgres:78901234%40UHI_Portal@db.lhojbfhsmfalhfpfhjvw.supabase.co:5432/postgres?sslmode=require
```

### 3. JWT Secret (CRITICAL - Use the generated key)

```bash
JWT_SECRET=NmcAZMNQEbE9yePLmCk86JzjF7ZDHYReDKGl6uTE8dY=
```

### 4. Application Port

```bash
PORT=3000
```

### 5. Node Environment

```bash
NODE_ENV=production
```

### 6. Redis (Optional - Leave Empty for Now)

```bash
# Don't add REDIS_URL unless you create a Redis instance
# The app will run without it after the code fix
```

### 7. CORS Origin (Update after Vercel deployment)

```bash
CORS_ORIGIN=*
```

**Note:** Change this to your actual Vercel URL once deployed (e.g., `https://uhi-admin.vercel.app`)

---

## ⚠️ Important Notes

### Database Password Special Characters

Your Supabase password is: `78901234@UHI_Portal`

The `@` symbol **MUST** be URL-encoded as `%40` in connection strings:

- ✅ Correct: `78901234%40UHI_Portal`
- ❌ Wrong: `78901234@UHI_Portal`

### Connection String Differences

- **DATABASE_URL**: Uses the **pooler** (port 6543) for connection pooling
- **DIRECT_URL**: Uses **direct connection** (port 5432) for migrations

### Redis is Now Optional

After the code fix I just made, the app will:

- ✅ Run without Redis if `REDIS_URL` is not set
- ✅ Log a warning and continue if Redis connection fails
- ✅ Only attempt Redis connection if explicitly configured

---

## 🚀 Deployment Steps

1. **Go to Render Dashboard** → Your Backend Service → **Environment**
2. **Delete all existing variables** (to avoid conflicts)
3. **Add each variable above** one by one
4. **Click "Save Changes"** (this triggers auto-redeploy)
5. **Wait for deployment** to complete (~2-3 minutes)

---

## 🔍 Verification

After deployment, check the logs for:

- ✅ `Redis not configured, running without cache` (expected)
- ✅ `Server started on port 3000` (success!)
- ❌ `Authentication failed` (DATABASE_URL is wrong)
- ❌ `JWT_SECRET environment variable is not set` (missing variable)

---

## 🆘 If Database Still Fails

If you still see `Authentication failed against database server`:

1. **Verify your Supabase password:**
   - Go to Supabase Dashboard → Settings → Database
   - Click "Reset database password"
   - Copy the new password
   - URL-encode special characters (use this tool: <https://www.urlencoder.org/>)

2. **Update both DATABASE_URL and DIRECT_URL** in Render with the new password

3. **Double-check the region:**
   - Your connection string says `aws-0-eu-central-1`
   - Verify this matches your Supabase project region in Settings → General

---

**Created:** 2026-02-02  
**Last Updated:** After Redis optional fix
