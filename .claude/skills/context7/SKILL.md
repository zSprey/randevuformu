---
name: context7
description: Real-time, version-specific documentation retrieval engine from context7.com. Use when coding with external libraries (Next.js, Drizzle, Stripe, Tailwind, Supabase, etc.) to get up-to-date API references without hallucinations.
allowed-tools: Bash(ctx7:*) Bash(npx:*) Read(*) Write(*)
---

# 📚 Context7: Real-Time Documentation Retrieval Engine
> **Reference:** [context7.com](https://context7.com) — Up-to-date library docs for AI coding agents

Bu yetenek, kodlama sırasında kullanılan 3. parti kütüphanelerin (Next.js App Router, Supabase, Stripe SDK, date-fns, Tailwind CSS v4, Playwright vb.) en son ve güncel dokümantasyonunu gerçek zamanlı olarak çeker.

---

## ⚡ Kullanım Komutları

### 1. Kütüphane ID'sini Bulma (Resolve Library)
```bash
npx ctx7 library "nextjs"
npx ctx7 library "supabase"
npx ctx7 library "stripe"
```

### 2. Belirli Bir Konuda Dokümantasyon ve Kod Örneği Sorgulama
```bash
# Next.js App Router middleware & server actions
npx ctx7 docs /vercel/next.js "middleware session handling"

# Supabase Row Level Security ve auth
npx ctx7 docs /supabase/supabase-js "createServerClient auth cookies"

# Stripe Checkout session creation
npx ctx7 docs /stripe/stripe-node "checkout sessions create"
```

### 3. MCP Sunucusu (Model Context Protocol)
Context7 MCP uç noktası: `https://mcp.context7.com/mcp`
