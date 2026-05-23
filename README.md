# C.O.R.E. (Compliance & Offline Records Engine)

**Enterprise-Grade Microfinance Data Sync & Compliance Platform for Sierra Leone's 2026 Data Regulatory Framework**

## Overview

C.O.R.E. is a full-stack, offline-first platform designed for microfinance institutions in Sierra Leone. It enables field officers to capture client data seamlessly, even without internet connectivity, while maintaining enterprise-grade compliance, security, and audit trails.

## Architecture

```
core-microfinance-platform/
├── mobile/                          # React Native + Expo (Offline-First)
├── web-dashboard/                   # React + Tailwind CSS (Executive Portal)
├── backend/                         # Supabase PostgreSQL + Node.js utilities
├── shared/                          # Shared types, constants, utilities
├── docs/                            # Documentation & setup guides
└── infra/                           # Database schema, RLS policies, migrations
```

## Tech Stack

- **Frontend (Mobile)**: React Native, Expo, AsyncStorage, SQLite
- **Frontend (Web)**: React 18, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL), Node.js
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Encryption**: TweetNaCl.js for sensitive data
- **Design System**: Fortress Palette (Navy #0B2545, Trust Blue #133C55, Slate White #F8F9FA, Compliance Red #D90429)

## Modules

### Module 1: Branding & Authentication
- Secure Email/Password login
- 3 user roles: Field Officer, Branch Manager, Executive
- Row-Level Security (RLS) policies
- Session management

### Module 2: Mobile Field Capture App (Offline-First)
- Seamless offline functionality
- Client registration form with photo upload (<150KB)
- Digital signature capture
- Background sync engine
- Network state listener

### Module 3: Backend Compliance & Cleaning Engine
- Phone number normalization (+232 format)
- Duplicate NIN fraud detection
- Comprehensive audit trail
- Encryption at rest for sensitive fields
- Compliance metadata attachment

### Module 4: Executive Web Dashboard
- Real-time metric cards
- Searchable, paginated data table
- Client profile modals with photo & signature
- Approve/Reject workflow
- Compliance status indicators

## Fortress Palette (Design System)

| Color | Hex | Usage |
|-------|-----|-------|
| Enterprise Navy | #0B2545 | Primary headers, sidebars |
| Trust Blue | #133C55 | Accent buttons, links |
| Slate White | #F8F9FA | Background, cards |
| Compliance Red | #D90429 | Alerts, high-risk flags |
| Success Green | #10B981 | Approved status |
| Warning Yellow | #F59E0B | Pending review |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (for mobile development)
- Supabase account

### Environment Setup

1. Clone the repository
2. Copy `.env.example` files to `.env.local` in each directory
3. Configure Supabase credentials
4. Run database migrations

### Installation

```bash
# Install root dependencies
npm install

# Install mobile dependencies
cd mobile && npm install && cd ..

# Install web dashboard dependencies
cd web-dashboard && npm install && cd ..

# Install backend utilities
cd backend && npm install && cd ..
```

### Development

```bash
# Mobile (Expo)
cd mobile && npm start

# Web Dashboard
cd web-dashboard && npm start

# Backend (Node.js utilities)
cd backend && npm run dev
```

## Database Schema

See `infra/schema.sql` for complete PostgreSQL schema with RLS policies.

## Security & Compliance

- All sensitive data (NIN, signatures) encrypted at rest
- Row-level security enforces data access boundaries
- Comprehensive audit trail for regulatory compliance
- Phone numbers normalized for data consistency
- Duplicate detection for fraud prevention

## Deployment

- **Mobile**: Expo EAS Build → App Store / Google Play
- **Web**: Vercel / Netlify
- **Backend**: Supabase (serverless)

## License

Proprietary - Microfinance Institution Use Only

## Support

For issues or questions, contact the development team.
