🚀 **RapidEat — Next.js 16 (Turbopack) Project**

A production-ready restaurant listing and ordering web application built using Next.js 16, Turbopack, TypeScript, and Tailwind CSS.

**Live Demo:** [https://rapideat.onrender.com/](https://rapideat.onrender.com/)

---

### 📦 Tech Stack

* Next.js 16 (App Router)
* Turbopack
* TypeScript
* Tailwind CSS
* MongoDB
* NextAuth

---

### 📁 Project Structure

```
/
├── app/
│   ├── register/
│   ├── login/
│   ├── dashboard/
│   └── layout.tsx
├── components/
├── lib/
├── public/
├── styles/
├── next.config.ts
└── README.md
```

---

### ⚙️ Environment Variables

Create a `.env.local` file:

```
DATABASE_URL=your_mongodb_or_postgres_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

---

### ▶️ Running the Project

1. Install dependencies
   `npm install`

2. Run Dev Server (Turbopack)
   `npm run dev`

3. Optional: Run Dev with Webpack
   `npm run dev -- --webpack`

4. Build for production
   `npm run build`

5. Start production
   `npm start`

---

### 🔧 next.config.ts (Used in this project)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  turbopack: {},
};

export default nextConfig;
```

---

### 🔐 Authentication Flow

* `/register` → Create Account
* `/login` → Login
* `/dashboard` or homepage

Logged-in users cannot access `/login` or `/register`.

---

### 📸 Image Loading

Images allowed from:
`images.unsplash.com`

---

### 🛠 Scripts

* `npm run dev`
* `npm run build`
* `npm start`

---

### 📜 License

This project is free to use and modify.
