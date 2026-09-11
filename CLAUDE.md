# Project Engineering Directives (Karpathy + Caveman + Humanizer)

Welcome to **randevuformu.com** codebase. All AI coding assistants, agents, and developers must adhere to these directives:

## 1. Andrej Karpathy Engineering Standards
- **Verify before modifying:** Prove root cause using DB state, log files, or API responses before making code changes.
- **Surgical edits:** Make minimal, focused changes. Avoid wholesale file rewrites.
- **Simplicity first:** Do not add premature abstractions, unused helper layers, or speculative complexity (YAGNI).
- **Verify end-to-end:** Always run `npx tsc --noEmit` and build verification before concluding any task.

## 2. Caveman Communication & Efficiency
- Be direct, concise, and technically rigorous.
- Omit conversational filler, sycophancy, and unnecessary pleasantries.
- Maintain high signal-to-noise ratio in all explanations.

## 3. Humanizer Content Philosophy
- Never output robotic AI clichés in user-facing texts ("Dijitalleşen dünyada...", "Gelin birlikte inceleyelim...", "Büyük bir önem taşımaktadır...").
- Keep blog and chat tones authentic, warm, and tailored to Turkish salon/clinic operators.

## 4. Stack Guidelines
- **Framework:** Next.js 16 (App Router, Turbopack, standalone PWA).
- **Language:** TypeScript 5 (strict, schema-derived via Zod, satisfies operator).
- **Styling:** Tailwind CSS 4 (Dark Luxury palette: `#0F2A4A`, `#050B14`, `#0062FF`).
- **Persistence:** Edge Config (primary fast resilient cache) + Supabase PostgreSQL.
