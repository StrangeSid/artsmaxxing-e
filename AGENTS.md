# AGENTS.md

This file defines the authoritative instructions for AI coding agents working in this repository.

Agents must treat this project as a real, production-grade web application with long-term maintenance expectations and real users.

Human-facing explanations belong in README.md.
This file exists exclusively for agents.

## Project Purpose

This repository contains a **structured creative sharing platform** designed for school-aged users.

The product exists to support creative expression **without social pressure**.

Core intent:
- allow users to share creative work safely
- remove competitive comparison
- support privacy, anonymity, and personal archives
- keep interaction calm, predictable, and structured

This is not a social network.
This is not a portfolio marketplace.
This is not an engagement-driven platform.

## Non-Negotiable Product Principles

Agents must not introduce features that violate these rules.

Explicitly disallowed:
- likes, reactions, follower counts
- public metrics or rankings
- algorithmic amplification
- popularity sorting
- competitive language or gamification
- growth hacking mechanics

If a feature encourages comparison or pressure, it does not belong.

## Design Authority (Design 4)

All UI work must align with **Design 4**, as shown in the design references and screenshots.

The `llms/reference-code/` directory exists for **visual alignment only**.
It is not expected to function and must not be treated as a codebase.

Agents must not invent new layouts or navigation systems.

Design characteristics to preserve:
- fixed top navigation
- grid-based layouts
- white content surfaces on light gray backgrounds
- restrained blue / teal accents
- clear typographic hierarchy
- card-based content previews
- calm, academic presentation

No experimental layouts.
No expressive motion.
No decorative animation.

## Core Screens (Do Not Expand Scope)

The application is limited to these conceptual areas:

- Home / Library view
- Categorized library views
- Upload flow with visibility controls
- Feedback views with structured sections
- Personal workspace / dashboard

Do not add new sections unless explicitly instructed.

## Tech Stack (Fixed)

Agents must use the following stack only:

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- Firebase
  - Authentication
  - Firestore
  - Storage
- Node.js
- ESLint
- Git + GitHub

No alternative frameworks.
No experimental libraries without approval.


## Repository Structure

Agents must respect the existing structure.

Expected layout:

- `src/`
  - `app/` — Next.js routes
  - `components/` — reusable UI components
  - `lib/` — Firebase config, shared utilities, types
  - `hooks/` — custom hooks
- `public/` — static assets
- `llms/` — agent context, reference designs
- `AGENTS.md` — this file
- `README.md` — human-facing overview

Do not reorganize folders unless instructed.

## Build and Development Commands

Agents may rely on the following commands:
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

Rules:
- npm run build must always pass
- lint failures are blocking
- broken builds are unacceptable

⸻

Coding Standards
- TypeScript only
- functional React components
- no any types
- no unused imports
- no commented-out code
- no speculative abstractions

Formatting:
- 2-space indentation
- Tailwind utility classes for all styling
- no inline styles unless unavoidable

Code must be readable without explanation.

UI & Interaction Rules

Agents must enforce:
- obvious navigation at all times
- clear action states
- predictable flows
- visible safety and privacy cues

Users must never wonder:
- where they are
- what an action does
- whether something is public or private

All feedback systems must:
- support anonymity
- feel optional
- avoid escalation
- avoid judgmental framing

Privacy & Safety

Visibility controls are first-class features.

Allowed visibility states:
- Private (archive only)
- Anonymous public
- Public with identity

Anonymous means anonymous.
No indirect exposure.
No metadata leaks.

Agents must default to safety.

Performance Expectations
- fast page loads on mid-range hardware
- optimized images and assets
- minimal client-side state
- prefer server or static rendering where possible

Boring, stable performance is success.

MCP Tooling Context

This project may be developed using MCP-enabled tools.

Available MCP servers may include:
- GitHub MCP
- Firebase MCP
- Context memory tools
- Next.js DevTools MCP
- Chrome DevTools MCP

When using MCP tools:
- avoid destructive actions
- do not silently refactor
- reflect intent through commits
- preserve context integrity


Version Control Rules
- small, scoped commits
- imperative commit messages
- no sweeping refactors without explanation
- assume commit history matters

Examples:
- “Add visibility toggle to upload form”
- “Refine library card layout spacing”

Decision Rules

When uncertain, agents must choose:
- simplicity over cleverness
- clarity over density
- safety over engagement
- predictability over novelty

If a feature needs justification to exist, it likely should not exist.

When Uncertain

Agents must not guess.

If unsure:
- stop
- surface trade-offs
- ask for clarification

Incorrect assumptions are worse than slower progress.

Completion Criteria

A task is complete only when:
- the build passes
- lint passes
- UI matches Design 4
- product intent is preserved
- no unnecessary complexity was added

If any condition fails, the task is not complete.
