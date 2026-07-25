<div align="center">
  <h1>TalentOS.AI (HireFlow AI)</h1>
  <p>A comprehensive, AI-driven Human Resources SaaS platform built to automate, analyze, and streamline modern HR workflows.</p>
</div>

---

## 🌟 Overview

TalentOS.AI is a premium, full-stack HR Management SaaS platform. It leverages Artificial Intelligence to rank candidates, automate tedious HR tasks, provide a real-time smart assistant, and deliver deep analytics. From handling candidate pipelines to managing billing and custom email templates, TalentOS.AI serves as an all-in-one operating system for modern HR teams.

## ✨ Key Features

- 🤖 **AI Assistant**: Intelligent chat assistant to help with HR queries and candidate summaries.
- 🏆 **Smart Candidate Ranking**: Automatically ranks candidates based on AI analysis of resumes and job descriptions.
- 📊 **Advanced Analytics**: Beautiful, interactive charts powered by Recharts to track company growth, hiring metrics, and platform usage.
- ⚡ **Workflow Automations**: Create and manage automated HR tasks and sequences.
- 📧 **Dynamic Email Templates**: Built-in customizable email templating system for sending invites, notifications, and candidate updates.
- 🕒 **Attendance & Audit Logs**: Track employee attendance and maintain a secure audit trail of all system actions.
- 💳 **Integrated Billing**: Seamless subscription management and checkout using Stripe.
- 💬 **Real-Time Communication**: Live notifications and real-time updates powered by WebSockets (Socket.io).
- 📁 **Document Vault**: Secure document management and evaluation storage.
- 🔐 **Super Admin Dashboard**: Top-level platform administration to manage tenant companies, subscriptions, and global settings.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Real-time**: [Socket.io Client](https://socket.io/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Payments**: [Stripe API](https://stripe.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **File Processing**: Multer & pdf-parse

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or your preferred database supported by Prisma)
- A Stripe account (for billing features)

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Set up your `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/talentos"
JWT_SECRET="your_jwt_secret"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
PORT=5000
```

Initialize the database using Prisma:
```bash
npx prisma generate
npx prisma db push
```

Start the backend development server:
```bash
npm run dev
```

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Set up your `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_DEMO_MODE=false
```

Start the frontend development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛡️ License & Copyright

© TalentOS.AI / abdullah0-tech. All rights reserved.
