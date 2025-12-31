# samjourn.al

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.x-f9f1e1?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19.x-61dafb?logo=react)](https://react.dev)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify)](https://fastify.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169e1?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker)](https://www.docker.com)
[![Build Status](https://img.shields.io/github/actions/workflow/status/cedrugs/samjourn.al/ci.yml?branch=main)](https://github.com/cedrugs/samjourn.al/actions)

A minimalist personal journaling web application with a dark, calm, intentional design. Built for reflections and quiet time entries with optional audio attachments.

**Live:** [https://samjourn.al](https://samjourn.al)

**Repository:** [https://github.com/cedrugs/samjourn.al](https://github.com/cedrugs/samjourn.al)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [License](#license)

---

## Features

- Two content categories: **Journal** and **Quiet Time**
- Rich text editor with formatting toolbar (Tiptap)
- Audio file uploads with custom waveform player
- Date-based URLs (`/journal/2025-01-01`, `/quiet-time/2025-01-01`)
- Draft and published post states
- Search, filter, and sort functionality
- Google OAuth authentication with allowlist-based access control
- Admin-only user seeding via environment variables
- Dynamic sitemap generation for SEO
- Open Graph and Twitter card meta tags
- Fully responsive dark theme with muted green accents
- Single Docker image deployment with Caddy reverse proxy

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Backend | Fastify |
| Frontend | React 19, Vite |
| Database | PostgreSQL 17 |
| ORM | Drizzle ORM |
| Authentication | Better Auth |
| Styling | Tailwind CSS v4 |
| Rich Text | Tiptap |
| Object Storage | S3-compatible (for audio files) |
| Reverse Proxy | Caddy |
| Containerization | Docker |

---

## Architecture

```
                    +------------------+
                    |      Caddy       |
                    |   (Port 80/443)  |
                    +--------+---------+
                             |
          +------------------+------------------+
          |                                     |
          v                                     v
+-------------------+               +-------------------+
|  Static Files     |               |   /api/*          |
|  (Frontend SPA)   |               |   /sitemap.xml    |
|  /frontend/dist   |               |                   |
+-------------------+               +--------+----------+
                                             |
                                             v
                                    +-------------------+
                                    |  Fastify Backend  |
                                    |   (Port 3000)     |
                                    +--------+----------+
                                             |
                         +-------------------+-------------------+
                         |                                       |
                         v                                       v
                +-------------------+               +-------------------+
                |   PostgreSQL      |               |   S3 Storage      |
                |   (Port 5432)     |               |   (Audio Files)   |
                +-------------------+               +-------------------+
```

---

## Prerequisites

- [Bun](https://bun.sh) v1.x
- [Docker](https://www.docker.com) and Docker Compose
- PostgreSQL 17 (or use Docker Compose)
- S3-compatible storage (AWS S3, Cloudflare R2, MinIO)
- Google Cloud Console project with OAuth 2.0 credentials

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/cedrugs/samjourn.al.git
cd samjourn.al
```

### 2. Start the database

```bash
docker compose up db -d
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your credentials:

```env
DATABASE_URL=postgresql://samjournal:samjournal@localhost:5432/samjournal
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AUTH_SECRET=generate-a-random-32-char-string
S3_ENDPOINT=https://your-s3-endpoint
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=auto
FRONTEND_URL=http://localhost:5173
```

### 4. Install dependencies

```bash
cd backend && bun install
cd ../frontend && bun install
```

### 5. Run database migrations

```bash
cd backend && bun run drizzle-kit push
```

### 6. Seed admin user

```bash
ADMIN_EMAIL=your@email.com ADMIN_NAME="Your Name" bun run src/seed.ts
```

### 7. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:5173/auth/callback`
4. Copy Client ID and Client Secret to your `.env` file

### 8. Start development servers

Terminal 1 (Backend):

```bash
cd backend && bun run src/index.ts
```

Terminal 2 (Frontend):

```bash
cd frontend && bun run dev
```

Access the application at `http://localhost:5173`

---

## Production Deployment

### Using Docker Compose

1. Create a `.env` file in the project root:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AUTH_SECRET=your-production-secret-min-32-chars
S3_ENDPOINT=https://your-s3-endpoint
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=auto
FRONTEND_URL=https://yourdomain.com
ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Admin
```

2. Update Google OAuth redirect URI to: `https://yourdomain.com/auth/callback`

3. Build and run:

```bash
docker compose up --build -d
```

The application will be available on port 80.

### Using Docker directly

```bash
# Build the image
docker build -t samjournal .

# Run with environment variables
docker run -p 80:80 --env-file .env samjournal
```

### Startup Process

On container start, the following happens automatically:

1. Database migrations run via `drizzle-kit push`
2. Admin user is seeded if `ADMIN_EMAIL` is set
3. Fastify backend starts on port 3000
4. Caddy starts and proxies requests on port 80

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `AUTH_SECRET` | Yes | Secret for signing auth tokens (min 32 chars) |
| `S3_ENDPOINT` | Yes | S3-compatible storage endpoint URL |
| `S3_BUCKET` | Yes | S3 bucket name for audio files |
| `S3_ACCESS_KEY` | Yes | S3 access key |
| `S3_SECRET_KEY` | Yes | S3 secret key |
| `S3_REGION` | No | S3 region (default: `auto`) |
| `FRONTEND_URL` | Yes | Public URL of the frontend |
| `ADMIN_EMAIL` | No | Email for seeded admin user |
| `ADMIN_NAME` | No | Name for seeded admin user (default: `Admin`) |

---

## Database Schema

### Users

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| email | TEXT | Unique email address |
| name | TEXT | Display name |
| image | TEXT | Profile image URL |
| emailVerified | BOOLEAN | Email verification status |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Posts

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (UUID) |
| category | ENUM | `journal` or `quiet-time` |
| date | DATE | Date string (YYYY-MM-DD) |
| title | TEXT | Optional post title |
| content | TEXT | JSON content from Tiptap rich text editor |
| audioUrl | TEXT | URL to uploaded audio file |
| status | ENUM | `draft` or `published` |
| publishedAt | TIMESTAMP | Publication timestamp |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

Unique constraint on `(category, date)` ensures one post per category per day.

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all posts (supports `?status=published`) |
| GET | `/api/posts/:category/:date` | Get post by category and date |
| GET | `/sitemap.xml` | Dynamic sitemap for SEO |

### Protected Endpoints (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/:id` | Get post by ID |
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/audio` | Upload audio file |

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/get-session` | Get current session |
| POST | `/api/auth/sign-in/social` | Initiate Google OAuth |
| POST | `/api/auth/sign-out` | Sign out |

### Request/Response Examples

#### Create Post

```bash
POST /api/posts
Content-Type: application/json

{
  "category": "journal",
  "date": "2025-01-01",
  "title": "New Year Reflections",
  "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Today I...\"}]}]}",
  "status": "published"
}
```

#### Upload Audio

```bash
POST /api/posts/:id/audio
Content-Type: multipart/form-data

file: [audio file]
```

Supported formats: mp3, wav, ogg, m4a, aac, flac, webm

Maximum file size: 50MB

---

## Authentication

Authentication uses [Better Auth](https://better-auth.com) with Google OAuth.

### Access Control

Only users that exist in the database can sign in. New users are blocked at the OAuth callback. To grant access:

1. Seed a user via `ADMIN_EMAIL` environment variable on startup
2. Or manually insert a user into the `users` table

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to APIs and Services > Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URIs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
6. Copy Client ID and Client Secret to environment variables

### Session Management

- Sessions are stored in PostgreSQL via Better Auth
- Cookies are httpOnly and secure in production
- Automatic session refresh on API calls
- Sessions expire based on Better Auth defaults

---

## Project Structure

```
samjourn.al/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts          # Database connection
│   │   │   └── schema.ts         # Drizzle schema definitions
│   │   ├── lib/
│   │   │   ├── auth.ts           # Better Auth configuration
│   │   │   └── s3.ts             # S3 upload utility
│   │   ├── routes/
│   │   │   └── posts.ts          # Posts API routes
│   │   ├── index.ts              # Fastify server entry point
│   │   └── seed.ts               # Admin user seeding script
│   ├── drizzle.config.ts         # Drizzle ORM configuration
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   ├── favicon.svg           # Cross favicon
│   │   ├── og-image.svg          # Open Graph image
│   │   └── robots.txt            # Robots configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── AdminLayout.tsx   # Admin layout wrapper
│   │   │   ├── AudioPlayer.tsx   # Custom waveform audio player
│   │   │   ├── DatePicker.tsx    # Custom date picker
│   │   │   ├── Editor.tsx        # Tiptap rich text editor
│   │   │   ├── Layout.tsx        # Public layout wrapper
│   │   │   └── PostContent.tsx   # Post content renderer
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Authentication context
│   │   ├── lib/
│   │   │   ├── api.ts            # API client functions
│   │   │   └── auth-client.ts    # Better Auth client
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminEditor.tsx
│   │   │   │   └── AdminPosts.tsx
│   │   │   ├── AuthCallback.tsx
│   │   │   ├── AuthError.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── PostPage.tsx
│   │   ├── styles/
│   │   │   └── global.css        # Tailwind and theme configuration
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript type definitions
│   │   ├── App.tsx               # React router configuration
│   │   ├── main.tsx              # Application entry point
│   │   └── vite-env.d.ts         # Vite environment types
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── Caddyfile                     # Caddy reverse proxy configuration
├── docker-compose.yml            # Docker Compose configuration
├── Dockerfile                    # Multi-stage Docker build
├── start.sh                      # Container startup script
└── README.md
```

---

## Troubleshooting

### Common Issues

**OAuth Redirect Error**

- Ensure `FRONTEND_URL` matches your domain
- Verify Google OAuth redirect URI matches `{FRONTEND_URL}/auth/callback`
- Check that the user exists in the database before attempting login

**Database Connection Issues**

- Verify PostgreSQL is running and accessible
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Run migrations: `bun run drizzle-kit push`

**S3 Upload Failures**

- Verify S3 credentials and bucket permissions
- Check S3_ENDPOINT format (include https://)
- Ensure bucket exists and is accessible

**Docker Port Issues**

- Docker exposes port 80, not 3000
- Use `http://localhost` (not `http://localhost:3000`) for Docker
- Check Caddy configuration in `Caddyfile`

### Development vs Production

| Environment | Frontend URL | Backend Port | Access URL |
|-------------|--------------|--------------|------------|
| Development | `http://localhost:5173` | 3000 | `http://localhost:5173` |
| Docker | `http://localhost` | 3000 (internal) | `http://localhost` |
| Production | `https://yourdomain.com` | 3000 (internal) | `https://yourdomain.com` |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature description"`
5. Push to your fork: `git push origin feature-name`
6. Create a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Author:** [@cedrugs](https://github.com/cedrugs)

**Repository:** [https://github.com/cedrugs/samjourn.al](https://github.com/cedrugs/samjourn.al)
