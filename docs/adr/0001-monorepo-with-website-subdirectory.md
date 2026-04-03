# ADR-1: Monorepo with Website subdirectory

**Date:** 2026-03-25
**Status:** Accepted

## Context

The repository contains two separate Next.js applications: a public corporate website and an internal operations dashboard. Both are maintained by the same small team and share some dependencies (Next.js, Tailwind, Lucide icons).

Options considered:
1. Two separate repositories
2. Monorepo with both apps at root level (npm workspaces)
3. Monorepo with one app in a subdirectory

## Decision

Place the website in `Website/` as a subdirectory within the dashboard repository. Each app has its own `package.json`, `node_modules`, and build pipeline.

## Consequences

- **Pro:** Single repo to manage, one Git remote, simpler access control
- **Pro:** Vercel can target `Website/` as the root directory for deployment
- **Con:** Two separate `node_modules` — duplicated dependencies, larger repo size
- **Con:** CI must be aware of the working directory (`cd Website`)
- **Con:** The root `package.json` and `Website/package.json` can cause confusion
