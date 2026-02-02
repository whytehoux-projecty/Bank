# 🔧 Supabase Connection String Fix

## The Issue

Your Render deployment is failing with:

```
Error querying the database: FATAL: Tenant or user not found
```

This means the **username or region** in your `DATABASE_URL` is incorrect.

## ✅ Solution: Use Direct Connection (Session Mode)

Instead of the connection pooler, use the **direct connection** which is more reliable:

### Update These Environment Variables on Render

```bash
# Option 1: Direct Connection (Recommended for Render)
DATABASE_URL=postgresql://postgres:78901234%40UHI_Portal@db.lhojbfhsmfalhfpfhjvw.supabase.co:5432/postgres

# Keep DIRECT_URL the same
DIRECT_URL=postgresql://postgres:78901234%40UHI_Portal@db.lhojbfhsmfalhfpfhjvw.supabase.co:5432/postgres
```

---

## 🔍 How to Get the Correct Connection String from Supabase

If the above still doesn't work, get the exact connection string from Supabase:

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Settings"** (gear icon) → **Database**
3. **Scroll down to "Connection String"**
4. **Select "URI"** tab
5. **Copy the connection string**
6. **Replace `[YOUR-PASSWORD]` with your actual password**
7. **URL-encode special characters:**
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `?` becomes `%3F`
   - etc.

### Example

If your password is `78901234@UHI_Portal`, the encoded version is `78901234%40UHI_Portal`

---

## 🎯 Quick Fix Steps

1. **Update `DATABASE_URL` on Render** to use the direct connection (port 5432, not 6543)
2. **Save Changes** (Render will auto-redeploy)
3. **Check logs** for `Server started on port 3000`

---

## 🆘 If Direct Connection Also Fails

Try this diagnostic:

### Option A: Get Fresh Credentials

1. Go to Supabase → Settings → Database
2. Click **"Reset database password"**
3. Copy the new password
4. URL-encode it
5. Update both `DATABASE_URL` and `DIRECT_URL` in Render

### Option B: Verify Region

Your project ID is `lhojbfhsmfalhfpfhjvw`.

Check if your Supabase region matches:

- Go to Supabase → Settings → General
- Look for "Region" (e.g., `eu-central-1`, `us-east-1`, etc.)
- The hostname should be `db.lhojbfhsmfalhfpfhjvw.supabase.co` (not region-specific)

---

**TL;DR:** Change your Render `DATABASE_URL` to:

```
postgresql://postgres:78901234%40UHI_Portal@db.lhojbfhsmfalhfpfhjvw.supabase.co:5432/postgres
```
