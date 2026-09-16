# For My Pookie (❤️)

> A modern, cinematic apology & romantic relationship web platform built with Next.js 13, Tailwind CSS, Framer Motion, and Supabase.

---

## ✨ Features

- **💌 Cinematic Love Experience (`/love/[token]`)**:
  - Interactive wax seal & envelope opening animation
  - Personalized boyfriend court: *"The People vs. Your Boy"*
  - Polaroid memory timeline with photos, dates, and captions
  - Inside jokes & funny memories carousel
  - Love reasons cards & interactive love meter
  - Mini quiz & *"If I could rewind time"* section
  - Final proposal invitation (YES / MAYBE / NO) with celebration confetti & date picker

- **💬 Real-Time 1-on-1 Chat**:
  - Private instant messaging between sender and receiver powered by Supabase Realtime
  - Unread message indicators & read receipts
  - Romantic glassmorphism UI

- **🔐 Robust Multi-Role Authentication**:
  - Email/Password authentication & Google OAuth integration
  - Role-based routing for **Sender** (boyfriend), **Receiver** (girlfriend), and **Admin**
  - Protected routes with PKCE auth code exchange & safe internal redirect guards

- **🎨 Multi-Dashboard Experience**:
  - **Sender Dashboard**: Create romantic experiences, generate custom QR codes & share links, manage memories/jokes/gallery, monitor responses, and chat.
  - **Receiver Dashboard**: View received experiences, review love letters, and private chat.
  - **Admin Dashboard**: System analytics, user moderation, relationship oversight, and audit logs.

- **🛡️ Enterprise Security**:
  - Strict Row Level Security (RLS) across all 11 database tables
  - Trigger-enforced privilege escalation protection on user profiles
  - Secure media upload/delete policies in Supabase Storage

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- A [Supabase](https://supabase.com) project

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pookie.git
cd pookie

# Install dependencies
npm install
```

### 3. Setup Database Schema

1. Go to your Supabase project dashboard → **SQL Editor**.
2. Open `supabase/migrations/20260916000000_pookie_master_schema.sql` from this repository.
3. Paste the entire SQL script and click **Run**.

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui + Lucide Icons
- **Animations**: Framer Motion + Canvas Confetti
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **QR Code**: qrcode.react
- **TypeScript**: Strict type checking

---

## 📄 License

MIT License. Designed with ❤️ for lovers everywhere.
