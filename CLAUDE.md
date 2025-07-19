# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15.4.2 dashboard application using TypeScript, Tailwind CSS, and shadcn/ui components. The app includes a main dashboard page displaying project statistics and a settings page with form validation.

## Tech Stack

- **Framework**: Next.js 15.4.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x with CSS variables
- **UI Components**: shadcn/ui with Radix UI primitives
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Font**: Inter (via next/font)

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Install dependencies
npm install
```

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx         # Root layout with header
│   ├── page.tsx           # Dashboard overview page
│   └── settings/page.tsx  # Settings form page (client component)
├── components/
│   └── ui/                # shadcn/ui components
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── table.tsx
└── lib/
    └── utils.ts           # Helper utilities (cn function)
```

## Key Architecture Notes

- **App Router**: Uses Next.js 15 App Router with RSC (React Server Components)
- **Path Aliases**: `@/*` maps to `./src/*`
- **Client Components**: Settings page uses `"use client"` for form interactivity
- **Styling**: Tailwind CSS with CSS variables defined in `globals.css`
- **Form Pattern**: Uses React Hook Form with Zod schema validation

## Component Patterns

- **shadcn/ui**: All UI components follow shadcn/ui patterns with class-variance-authority
- **Form Handling**: Settings page demonstrates complete form pattern with validation
- **Layout**: Root layout includes persistent header with user avatar
- **Responsive**: Uses Tailwind's responsive utilities (mobile-first)

## Development Notes

- Server components are default (no "use client" directive)
- Form components require client components for interactivity
- CSS variables are configured for theming in `globals.css`
- All components use TypeScript with proper type definitions