# Student Management System

## Overview

A web-based Student Management System converted from a Python tkinter desktop app. Built as a full-stack React + Vite frontend with an Express API backend and PostgreSQL database.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/student-management)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

- **Dashboard** — Overview with attendance summary stats (total, present, absent, late), searchable/filterable student table with color-coded status badges, inline edit, and delete
- **Registrations** — Register new students with full name, email, phone, and year level
- **Student Report** — Submit/update a student's block, course, room, status (IN/OUT/N/A), and remarks (PRESENT/ABSENT/LATE)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/students.ts` — Students table schema
- `artifacts/api-server/src/routes/students.ts` — CRUD + stats API routes
- `artifacts/student-management/src/` — React frontend with pages: Dashboard, Register, Report

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
