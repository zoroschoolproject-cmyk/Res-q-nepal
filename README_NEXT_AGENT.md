# Handover Guide — ResQ Nepal Next Agent Readme

This document serves as the guide for the next engineering agent working on **ResQ Nepal** (CityAlert SOS). It summarizes the codebase architecture, database models, component relationships, and styling system.

---

## 1. Project Overview

ResQ Nepal is a Next.js (version 16.2.9) web application that serves as a community emergency and civic platform for Nepal. It features:
- **Public User-Facing Modules (No Authentication)**: 8 features (Home, PulseLine emergency numbers, RapidDispatch reports, VoiceBox complaints & boards, AidDrop registry, SafeLink checklists/manuals, SafeShield insurance plans, Charity fundraising campaigns).
- **Admin Control Room Panel (Authentication Protected)**: Accessible via `/admin` dashboard. It manages the content directories, monitors reports, approves donor listings, uploads safety guides, registers insurance policies, manages notice board bulletins, and handles charity campaigns.

---

## 2. Directory Layout & Architecture

```
resq-nepal/
├── public/
│   ├── data/                 # Seed JSON files (contacts.json, links.json)
│   └── docs/                 # Evacuation maps & first aid PDF guides
├── src/
│   ├── app/
│   │   ├── admin/            # Control Room sub-router (protected layout)
│   │   │   ├── dashboard/    # Main Admin analytics dashboard
│   │   │   ├── aiddrop/      # Donor moderation & money campaign admin
│   │   │   ├── charity/      # Charity fund campaigns admin
│   │   │   ├── notices/      # Notices bulletin board admin
│   │   │   ├── pulseline/    # Contacts directory admin
│   │   │   ├── rapiddispatch/# Accident & dispatch dispatcher panel
│   │   │   ├── safelink/     # Documents & info links portal admin
│   │   │   ├── safeshield/   # Insurance group listings admin
│   │   │   ├── layout.tsx    # Sidebar layout & session validation
│   │   │   └── page.tsx      # Admin login form view
│   │   ├── api/              # Full SQLite REST CRUD API endpoints
│   │   ├── aiddrop/          # Public blood/organ registry & listings board
│   │   ├── charity/          # Public charity contribution page
│   │   ├── pulseline/        # Public contacts quick-dial directory
│   │   ├── rapiddispatch/    # Public emergency incident reporting forms
│   │   ├── safelink/         # Public PDF safety resources & guides
│   │   ├── safeshield/       # Online-only insurance catalog
│   │   ├── voicebox/         # Public complaints & discussions boards
│   │   ├── layout.tsx        # Global desktop navbar & mobile bottom navbar layout
│   │   └── page.tsx          # Public Home dashboard & notice list
│   ├── components/           # Custom re-usable elements (Navbar, Bell, Logo)
│   ├── lib/
│   │   ├── db.ts             # SQLite initialization, tables schema, & seed data
│   │   └── utils.ts          # NPT date formats & Tailwind utility classes
│   └── globals.css           # Global Tailwind & design system styles
├── package.json              # Next.js 16 + React 19 + SWR 2 + SQLite 12
└── README_NEXT_AGENT.md      # Handover Guide (This document)
```

---

## 3. Database Schema (`src/lib/db.ts`)

The database is built on local SQLite via `better-sqlite3`. Table definitions are:
- `contacts`: `id`, `name`, `number`, `category`, `description`
- `incident_reports`: `id`, `type`, `location`, `description`, `severity`, `status`, `created_at`, `reference_number`, `photo_path`
- `complaints`: `id`, `subject`, `category`, `description`, `status`, `complaint_id`, `admin_response`, `created_at`
- `discussion_posts`: `id`, `content`, `category`, `is_anonymous`, `upvotes`, `created_at`
- `discussion_replies`: `id`, `post_id`, `content`, `created_at`
- `donors`: `id`, `type` (blood/organ/item), `name`, `contact`, `blood_group`, `city`, `organs` (JSON string), `items` (JSON string), `quantity`, `pickup_location`, `status` (Pending/Approved/Rejected), `created_at`
- `money_campaigns`: `id`, `title`, `description`, `target`, `raised`, `end_date`, `is_active`
- `money_donations`: `id`, `campaign_id`, `donor_name`, `amount`, `message`, `created_at`
- `info_links`: `id`, `name`, `url`, `description`, `category`
- `documents`: `id`, `name`, `file_path`, `category`, `file_size`
- `insurance_companies`: `id`, `name`, `logo_path` (Base64 or url), `description`, `plans` (JSON array of policies), `affiliate_link`, `is_active`
- `charity_campaigns`: `id`, `title`, `description`, `target`, `raised`, `end_date`, `is_active`, `is_archived`
- `charity_donations`: `id`, `campaign_id`, `donor_name`, `amount`, `message`, `created_at`
- `notices`: `id`, `title`, `content`, `is_pinned`, `created_at`
- `notifications`: `id`, `title`, `message`, `type`, `is_read`, `created_at`
- `admin_session`: `id`, `username`, `password` (seeded to `admin` / `resqnepal123` on startup)

---

## 4. UI/UX Styling & Conventions

Keep styling consistent with the following rules in `globals.css`:
- **Theme Colors**: Main background `#F7F8FA`. Primary button `#D72638` (red), hover: bg opacity reduction. Secondary button `#E4E7EC` border, white background. Form inputs hover focus outline `#1B4FD8`.
- **Badges**:
  - `Submitted` or `Pending` -> Yellow (`bg-[#FEF3C7] text-[#D97706] border-yellow-200`)
  - `Under Review` -> Blue (`bg-[#DBEAFE] text-[#1B4FD8] border-blue-200`)
  - `Resolved` or `Approved` -> Green (`bg-[#DCFCE7] text-[#16A34A] border-green-200`)
  - `Rejected` -> Red (`bg-red-50 text-[#D72638] border-red-200`)
- **Monospace Text**: Use `font-mono` (mapped to JetBrains Mono) for status labels, dates, currencies, and reference codes (`RQ-YYYYMMDD-XXXX`, `CV-YYYYMMDD-XXXX`).
- **Layout Max Width**: Centered grid layouts constrained to `max-w-[1080px]`.
- **Animations**: Static and smooth transitions (except SOS pulse ring ring effect in home screen).

---

## 5. Verification Checklist & Launch Commands

### Database Seeding
Verify that `src/db/database.sqlite` gets successfully populated. Default admin logins:
- **Username**: `admin`
- **Password**: `resqnepal123`

### Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to browse user-facing pages, and `http://localhost:3000/admin` to manage dashboards.

### Build and Verify Compiles
```bash
npm run build
```
Verify that Next.js successfully compiles pages without typescript issues or layout defects.

---

## 6. Deployment Guide & Credentials

### Setting up Turso Database
1. Register/Login to [Turso Console](https://turso.tech/).
2. Create a new database:
   ```bash
   turso db create resq-nepal
   ```
3. Get your Database URL:
   ```bash
   turso db show resq-nepal --url
   ```
4. Get your Authentication Token:
   ```bash
   turso db tokens create resq-nepal
   ```

### Vercel Deployment & Environment Variables
When deploying the application to Vercel, configure the following Environment Variables in the project settings:
*   `TURSO_DATABASE_URL`: Your Turso database connection URL (e.g., `libsql://resq-nepal-username.turso.io`).
*   `TURSO_AUTH_TOKEN`: The generated authentication token for the database.

### Running Seed After Deployment
Database initialization and seeding are done dynamically on the first request once `TURSO_DATABASE_URL` is set.
Additionally, you can trigger database schema updates or seed resets at any time by calling:
*   **API Endpoint**: `/api/seed` (callable via HTTP GET to initialize/re-seed).

### Credentials Logins
Use these default credentials to test user roles and administrator systems:

#### Admin Control Room (Control Panel)
*   **URL**: `/admin`
*   **Username**: `Titans`
*   **Password**: `ASM`

#### Regular User (Public Protected Portals)
*   **URL**: `/login`
*   **Credentials Option 1**:
    *   **Username**: `user1`
    *   **Password**: `asm`
*   **Credentials Option 2**:
    *   **Username**: `user2`
    *   **Password**: `asm`
*   **Credentials Option 3**:
    *   **Username**: `ramesh`
    *   **Password**: `password123`

