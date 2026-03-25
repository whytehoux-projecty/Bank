# Admin Interface — Cloudflare Deployment Guide

**Service:** JP Heritage Bank Admin Interface
**Framework:** Fastify 4 + EJS templates (Node.js SSR)
**Port:** 3003

---

## Why Cloudflare Pages/Workers Won't Work

The admin interface is a full Node.js server that uses:

| Requirement | Cloudflare Workers Support |
|---|---|
| Prisma ORM (native query engine) | **No** — Workers cannot load `.node` native binaries |
| `bcrypt` (native module) | **No** — native addons not supported in V8 isolate |
| Real filesystem (EJS views, uploads) | **No** — Workers `fs` is a polyfill with no real disk |
| `child_process` (Prisma engine) | **No** — stub only, throws at runtime |
| 128 MB memory limit | Prisma alone exceeds this on initialization |

**Cloudflare Pages** runs on the same Workers runtime — same limitations apply. Fastify is not a supported Pages framework.

**Solution:** Deploy the admin on **Render** (same region as the backend) and expose it publicly through **Cloudflare Tunnel** (`cloudflared`). This gives you Cloudflare's DDoS protection, SSL termination, and Cloudflare Access (Zero Trust) authentication in front of the admin panel — with zero application code changes.

---

## Architecture

```
Internet
   │
   ▼
Cloudflare Edge  (DDoS protection, SSL, WAF, Cloudflare Access)
   │
   │  Cloudflare Tunnel (cloudflared daemon)
   ▼
Render Web Service: heritage-admin (Node.js, port 3003)
   │                          │
   │ DATABASE_URL             │ API_URL
   ▼                          ▼
Render Postgres       Render Web Service: heritage-core-api (port 3001)
Render Redis          │
                      ▼
                  Render Postgres (shared)
                  Render Redis (shared)

E-Banking Portal (Netlify)  ──► heritage-core-api
Corporate Website (Netlify) ──► (static, no API calls)
```

---

## Step 1 — Deploy Admin Interface to Render

### 1.1 Create the Render Web Service

1. Go to **Render Dashboard → New → Web Service**
2. Connect your GitHub repository
3. Set **Root Directory** to `admin-interface`
4. Configure:

| Setting | Value |
|---|---|
| **Name** | `heritage-admin` |
| **Region** | Oregon (same as `heritage-core-api` and Postgres) |
| **Runtime** | Node |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `node dist/server.js` |
| **Plan** | Starter |
| **Health Check Path** | `/api/health` |

### 1.2 Set Environment Variables in Render Dashboard

Go to **Service → Environment** and add every variable below.
Variables marked `sync: false` must be set manually — they are never auto-synced.

#### Required Variables

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `3003` | Render injects this automatically; set for clarity |
| `HOST` | `0.0.0.0` | Must bind to all interfaces on Render |
| `LOG_LEVEL` | `info` | |
| `DATABASE_URL` | `postgresql://jp_heritage_postgres_user:PASS@dpg-xxxx-a:5432/jp_heritage_postgres` | Render **internal** URL — same DB as core-api |
| `REDIS_URL` | `redis://red-xxxx:6379` | Render **internal** URL — same Redis as core-api |
| `JWT_SECRET` | *(generate below)* | Admin tokens only. **Must differ** from core-api's `JWT_SECRET` |
| `JWT_EXPIRES_IN` | `24h` | |
| `COOKIE_SECRET` | *(generate below)* | Cookie encryption key |
| `ADMIN_SESSION_TIMEOUT` | `86400000` | 24 hours in ms |
| `BCRYPT_ROUNDS` | `12` | |
| `CORS_ORIGIN` | `https://admin.jpheritagebank.com` | Your Cloudflare-proxied admin domain |
| `API_URL` | `https://heritage-core-api.onrender.com` | Core API public URL (Render services don't share a private network) |
| `RATE_LIMIT_MAX` | `100` | |
| `RATE_LIMIT_WINDOW` | `900000` | 15 minutes in ms |
| `MAX_FILE_SIZE` | `10485760` | 10 MB |
| `UPLOAD_DIR` | `./uploads` | |

#### Optional Variables

| Key | Value | Notes |
|---|---|---|
| `SMTP_HOST` | *(your SMTP host)* | If blank, emails are `console.info` only |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` | *(your SMTP user)* | |
| `SMTP_PASS` | *(your SMTP password)* | |
| `STAFF_PORTAL_API_URL` | *(webhook URL)* | External staff portal webhook receiver |
| `WEBHOOK_SECRET` | *(generate below)* | HMAC-SHA256 signing key for webhooks |

### 1.3 Generate Secrets

Run these locally and paste the output as variable values:

```bash
# JWT_SECRET (admin tokens — different from core-api JWT_SECRET)
openssl rand -base64 32

# COOKIE_SECRET
openssl rand -base64 32

# WEBHOOK_SECRET (optional)
openssl rand -base64 32
```

> **Important:** The admin's `JWT_SECRET` must be different from the Core API's `JWT_SECRET`.
> They operate separate authentication domains. Using the same secret would allow
> admin tokens to be accepted by the customer-facing API, which is a security flaw.

### 1.4 Database — Same PostgreSQL, No Migration Needed

The admin interface shares the same PostgreSQL instance and Prisma schema as the Core API.
Use the identical `DATABASE_URL` (including the `:5432` port) that the Core API uses:

```
postgresql://jp_heritage_postgres_user:PASSWORD@dpg-d7182jsr85hc739kh8c0-a:5432/jp_heritage_postgres
```

The admin does NOT run its own migrations — the Core API build runs `prisma migrate deploy`.

---

## Step 2 — Expose via Cloudflare Tunnel

Cloudflare Tunnel (`cloudflared`) creates an outbound-only encrypted connection from your Render service to Cloudflare's edge. No inbound firewall ports are opened.

### 2.1 Prerequisites

- A Cloudflare account with your domain (`jpheritagebank.com`) added
- `cloudflared` installed on the machine that will run the tunnel daemon

For Render (where there is no persistent process), run `cloudflared` on a separate lightweight VPS (e.g., a $4/month Hetzner or DigitalOcean instance). Alternatively, use **Cloudflare Tunnel via Docker** or run it locally for testing.

### 2.2 Install cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux (Debian/Ubuntu)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Docker
docker pull cloudflare/cloudflared:latest
```

### 2.3 Authenticate and Create the Tunnel

```bash
# 1. Authenticate — opens browser for Cloudflare login
cloudflared tunnel login

# 2. Create tunnel — outputs a Tunnel UUID, copy it
cloudflared tunnel create heritage-admin

# 3. List tunnels to confirm
cloudflared tunnel list
```

The command creates a credentials file at:
```
~/.cloudflared/<TUNNEL-UUID>.json
```

### 2.4 Create the Config File

Create `~/.cloudflared/config.yml` (replace `<TUNNEL-UUID>` and `admin.jpheritagebank.com`):

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /root/.cloudflared/<TUNNEL-UUID>.json

ingress:
  # Admin interface
  - hostname: admin.jpheritagebank.com
    service: http://localhost:3003

  # Catch-all
  - service: http_status:404
```

If the admin runs on Render (not localhost), change the `service` URL to the Render public URL:

```yaml
ingress:
  - hostname: admin.jpheritagebank.com
    service: https://heritage-admin.onrender.com
    originRequest:
      noTLSVerify: false
  - service: http_status:404
```

### 2.5 Create DNS Record

```bash
cloudflared tunnel route dns heritage-admin admin.jpheritagebank.com
```

This automatically creates a CNAME record in your Cloudflare DNS:
```
admin.jpheritagebank.com  CNAME  <TUNNEL-UUID>.cfargotunnel.com
```

### 2.6 Run the Tunnel

```bash
# Foreground (testing)
cloudflared tunnel run heritage-admin

# As a systemd service (production — Linux)
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### 2.7 Docker Compose Option (if running locally)

Add this to your `docker-compose.yml`:

```yaml
cloudflared:
  image: cloudflare/cloudflared:latest
  command: tunnel --config /etc/cloudflared/config.yml run
  volumes:
    - ./admin-interface/.cloudflared:/etc/cloudflared
  restart: unless-stopped
  depends_on:
    - admin
```

---

## Step 3 — Lock Down the Admin with Cloudflare Access (Zero Trust)

This adds a login screen in front of the admin panel at the Cloudflare edge — before any request reaches your server. Without this, anyone who knows the URL can attempt to reach the admin login page.

1. Go to **Cloudflare Dashboard → Zero Trust → Access → Applications**
2. Click **Add an application → Self-hosted**
3. Configure:
   - **Application name:** Heritage Admin Panel
   - **Application domain:** `admin.jpheritagebank.com`
   - **Session duration:** 24 hours
4. Add a **Policy** → Allow → Include: Emails ending in `@jpheritagebank.com`
5. Save

Now any visitor to `admin.jpheritagebank.com` must authenticate via Cloudflare Access (email OTP, Google SSO, etc.) before the request is forwarded to your Fastify server.

---

## Step 4 — Verify All Service Connections

After deployment, verify each connection:

### Admin → Core API
The admin calls `GET /api/portal/health` and `POST /api/portal/status` on the Core API.

```bash
# Test from admin service (replace with your Render URLs)
curl https://heritage-admin.onrender.com/api/health
# Expected: {"status":"ok","service":"heritage-admin"}

curl https://heritage-core-api.onrender.com/api/health
# Expected: {"status":"ok","uptime":...}
```

### Admin → Database
The admin uses its own Prisma client connecting to the same PostgreSQL.
Check that the admin's `DATABASE_URL` matches the Core API's (same host, same db name).

### E-Banking Portal → Core API
```bash
curl https://heritage-core-api.onrender.com/api/portal/health
# Portal reads this to display the "system status" badge on the login page
```

### Corporate Website → Login Redirect
The corporate site redirects to `https://jpheritagevault.netlify.app/login`.
No API calls — this is a static site.

---

## Environment Variable Reference — Complete

### Admin Interface (`heritage-admin`)

| Variable | Required | Example Value | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Runtime environment |
| `PORT` | Yes | `3003` | HTTP port (Render injects this) |
| `HOST` | Yes | `0.0.0.0` | Bind address |
| `LOG_LEVEL` | No | `info` | `debug` / `info` / `warn` / `error` |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/db` | Same DB as Core API |
| `REDIS_URL` | No | `redis://red-xxxx:6379` | Same Redis as Core API |
| `JWT_SECRET` | **Yes** | *(32+ char secret)* | Admin-only JWT signing key |
| `JWT_EXPIRES_IN` | No | `24h` | Admin token lifetime |
| `COOKIE_SECRET` | **Yes** | *(32+ char secret)* | Cookie encryption |
| `ADMIN_SESSION_TIMEOUT` | No | `86400000` | Session TTL in ms |
| `BCRYPT_ROUNDS` | No | `12` | Password hash rounds |
| `CORS_ORIGIN` | Yes | `https://admin.jpheritagebank.com` | Allowed origin |
| `API_URL` | Yes | `https://heritage-core-api.onrender.com` | Core API URL |
| `RATE_LIMIT_MAX` | No | `100` | Requests per window |
| `RATE_LIMIT_WINDOW` | No | `900000` | Window size in ms |
| `MAX_FILE_SIZE` | No | `10485760` | Max upload (10 MB) |
| `UPLOAD_DIR` | No | `./uploads` | Upload storage path |
| `SMTP_HOST` | No | `smtp.sendgrid.net` | Email server |
| `SMTP_PORT` | No | `587` | Email port |
| `SMTP_USER` | No | `apikey` | SMTP username |
| `SMTP_PASS` | No | *(SMTP password)* | SMTP password |
| `STAFF_PORTAL_API_URL` | No | *(webhook URL)* | Outbound webhook target |
| `WEBHOOK_SECRET` | No | *(32+ char secret)* | Webhook HMAC signing key |

### Cross-Service URL Map (Production)

| Service | Public URL | Used By |
|---|---|---|
| Core API | `https://heritage-core-api.onrender.com` | Admin (`API_URL`), E-Banking Portal (`NEXT_PUBLIC_API_URL`) |
| Admin Interface | `https://admin.jpheritagebank.com` (via Cloudflare Tunnel) | Internal staff only |
| E-Banking Portal | `https://jpheritagevault.netlify.app` | Customers; referenced in `CORS_ORIGINS` on Core API |
| Corporate Website | `https://jpheritagebank.netlify.app` | Public; redirects to portal login |

### Core API — Additional Variables Needed When Admin Is Live

Add to the Core API's Render environment:

| Key | Value |
|---|---|
| `CORS_ORIGINS` | `https://jpheritagevault.netlify.app,https://admin.jpheritagebank.com` |

---

## Quick Reference — Deployment Checklist

### Render (heritage-admin service)
- [ ] Service created, root dir = `admin-interface`
- [ ] Build command: `npm install --include=dev && npm run build`
- [ ] Start command: `node dist/server.js`
- [ ] Health check path: `/api/health`
- [ ] `DATABASE_URL` set (same as core-api, with `:5432`)
- [ ] `REDIS_URL` set (same as core-api)
- [ ] `JWT_SECRET` generated and set (different from core-api's)
- [ ] `COOKIE_SECRET` generated and set
- [ ] `API_URL` set to `https://heritage-core-api.onrender.com`
- [ ] `CORS_ORIGIN` set to your admin domain
- [ ] `HOST` set to `0.0.0.0`

### Cloudflare Tunnel
- [ ] `cloudflared` installed
- [ ] `cloudflared tunnel login` completed
- [ ] Tunnel created: `cloudflared tunnel create heritage-admin`
- [ ] `~/.cloudflared/config.yml` written with correct tunnel UUID
- [ ] DNS route created: `cloudflared tunnel route dns heritage-admin admin.jpheritagebank.com`
- [ ] Tunnel running as a service or Docker container

### Cloudflare Access (optional but recommended)
- [ ] Zero Trust application created for `admin.jpheritagebank.com`
- [ ] Policy restricts to `@jpheritagebank.com` emails
- [ ] Session duration set to 24h

### Core API (`heritage-core-api`) — Update Required
- [ ] `CORS_ORIGINS` updated to include `https://admin.jpheritagebank.com`

---

## Troubleshooting

### Admin service crashes on Render (exit code 1)
Check that `DATABASE_URL` includes `:5432` and the host is the internal Render hostname (not the external `.oregon-postgres.render.com` hostname — internal is faster and free).

### CORS errors in admin browser console
`CORS_ORIGIN` on the admin service must exactly match the origin the browser sends (including `https://` and no trailing slash). Also update `CORS_ORIGINS` on the Core API.

### Cloudflare Tunnel shows "Bad Gateway"
The tunnel can reach Cloudflare but the origin is down. Check:
1. The Render admin service is running (`/api/health` responds)
2. The `service` URL in `config.yml` is correct
3. Run `cloudflared tunnel info heritage-admin` to see connection status

### Admin cannot reach Core API (portal status calls fail)
`API_URL` on the admin must point to the live Core API URL. On Render, services on different plans/regions don't share an internal network — use the public `onrender.com` URL.

### JWT token rejected between admin and core API
The admin and core-api use **different** JWT secrets by design. The admin authenticates admin users against the `AdminUser` table using its own `JWT_SECRET`. Customer-facing tokens use the core-api's `JWT_SECRET`. These must never be the same value.
