# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 15.4.2 dashboard application using TypeScript, Tailwind CSS, and shadcn/ui components. The app features:
- A main dashboard page for project statistics.
- A settings page with form validation.
- An interactive learning platform with dynamic content, progress tracking, and navigation.

## Tech Stack

- **Framework**: Next.js 15.4.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x with CSS variables
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: Zustand for global state (learning progress)
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
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard overview page
│   ├── learn/             # Learning platform pages
│   │   └── [language]/[chapterId]/[sectionId]/page.tsx
│   └── settings/page.tsx  # Settings form page
├── components/
│   ├── LearnNavBar.tsx    # Navigation bar for the learning platform
│   ├── LearningPlatform.tsx # Main component for the learning UI
│   └── ui/                # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       └── tooltip.tsx
├── lib/
│   └── utils.ts           # Helper utilities (cn function)
├── store/
│   └── learningStore.ts   # Zustand store for learning state
└── types/
    └── index.ts           # TypeScript type definitions
```

## Key Architecture Notes

- **App Router**: Uses Next.js 15 App Router with RSC (React Server Components).
- **State Management**: Global state for the learning platform is managed by `zustand` with persistence.
- **Dynamic Routing**: The learning platform uses dynamic segments for language, chapter, and section.
- **Path Aliases**: `@/*` maps to `./src/*`.
- **Client Components**: Components requiring interactivity (forms, learning platform) use `"use client"`.
- **Styling**: Tailwind CSS with CSS variables defined in `globals.css`.

## Component Patterns

- **LearnNavBar**: A dedicated navigation component for the learning pages. It includes language selection, section navigation controls, progress display, and is connected to the `learningStore`.
- **shadcn/ui**: All UI components follow shadcn/ui patterns with class-variance-authority.
- **Form Handling**: Settings page demonstrates complete form pattern with validation.
- **Layout**: The learning page uses a two-part layout with a fixed header (`LearnNavBar`) and a scrollable content area.
- **Responsive**: Uses Tailwind's responsive utilities (mobile-first).

## Development Notes

- Server components are default (no "use client" directive).
- Form and state-driven components require client components for interactivity.
- CSS variables are configured for theming in `globals.css`.
- All components use TypeScript with proper type definitions.
