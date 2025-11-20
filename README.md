# RapidEat – Restaurant Discovery Platform

A modern restaurant discovery application inspired by Zomato/Swiggy, built with Next.js 16 and featuring real-time search, advanced filtering, authentication, and MongoDB integration.

## 🚀 Features

### 🔍 Search & Filtering
- **Real-time Search**: Search restaurants by name, description, locality, or cuisine
- **Multi-Select Cuisine Filter**: Filter by one or multiple cuisines (38+ cuisine types available)
- **Rating Filter**: Minimum rating slider (0-5 stars)
- **Cost Filter**: Maximum cost for two with slider (₹0-₹2000) and quick presets (₹300, ₹600, ₹1000, ₹1500)
- **Smart Filtering**: All filters work together (AND logic) for precise results
- **Active Filter Badges**: Visual indicators showing applied filters with easy removal

### 📊 Sorting Options
- **Relevance**: Default sorting
- **Top Rated**: Highest rated restaurants first
- **Fastest Delivery**: Sort by delivery time
- **Price: Low to High**: Sort by cost for two

### 🎨 User Interface
- **Infinite Scroll**: Automatically loads 12 restaurants per batch as you scroll
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Loading States**: Skeleton placeholders during data fetch
- **Stats Dashboard**: View total restaurants, top-rated count, pure veg count, and available cuisines

### 🔐 Authentication System
- **User Registration**: 
  - Email validation with Zod schema
  - Password strength requirement (minimum 8 characters)
  - Password confirmation matching
  - Automatic login after successful registration
- **User Login**: 
  - Email and password authentication
  - Session token rotation for security
  - Automatic redirect to home page
- **Session Management**:
  - Secure HTTP-only cookies
  - HMAC-SHA256 token hashing
  - Configurable session expiry (default: 7 days)
  - MongoDB-backed session storage
- **Access Control**:
  - Protected routes with server-side guards
  - Role-based access (user, admin)
  - Automatic redirects for unauthenticated/unauthorized users
- **Logout**: Secure session destruction and cookie cleanup

### 📦 Data Management
- **MongoDB Integration**: Full CRUD support with cached connections
- **Fallback System**: Automatic fallback to JSON data if MongoDB unavailable
- **21 Sample Restaurants**: Curated dataset with diverse cuisines and ratings
- **Type Safety**: Full TypeScript support with shared type definitions

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Node.js driver
- **Authentication**: bcryptjs for password hashing
- **Validation**: Zod for schema validation
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## 📋 Prerequisites

- Node.js 18+ (20.19+ recommended for MongoDB driver)
- MongoDB instance (optional - app works with fallback data)
- npm or yarn

## 🏃 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration (Optional)
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net"
MONGODB_DB="resto-app"
MONGODB_COLLECTION="restaurants"

# Authentication Configuration
AUTH_SECRET="your-random-32-character-secret-key-here"
AUTH_SESSION_COOKIE="rapideat_session"
AUTH_SESSION_TTL_DAYS="7"

# Optional: Custom Collection Names
AUTH_USERS_COLLECTION="users"
AUTH_SESSIONS_COLLECTION="sessions"
```

**Note**: If MongoDB is not configured, the app will automatically use the bundled JSON dataset (`data/restaurants.json`).

### 3. Seed Database (Optional)

If you have MongoDB configured, seed the database with sample data:

```bash
npm run seed
```

This will:
- Clear existing restaurant data
- Insert 21 sample restaurants from `data/restaurants.json`

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
resto-app/
├── app/
│   ├── actions/
│   │   ├── auth.ts          # Server actions for register/login/logout
│   │   └── auth-state.ts    # Auth form state types
│   ├── api/
│   │   └── restaurants/
│   │       └── route.ts      # REST API endpoint with filtering
│   ├── auth/
│   │   ├── layout.tsx        # Auth pages layout
│   │   ├── login/            # Login page and form
│   │   ├── register/         # Registration page and form
│   │   └── logout/           # Logout handler
│   ├── page.tsx              # Home page (protected route)
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   └── home/
│       └── home-client.tsx    # Main restaurant listing component
├── data/
│   ├── restaurants.json      # Sample restaurant data (21 items)
│   └── restaurants.ts        # TypeScript wrapper for data
├── lib/
│   ├── auth.ts               # Authentication utilities
│   └── mongodb.ts            # MongoDB connection helpers
├── scripts/
│   └── seed.mjs              # Database seeding script
└── types/
    ├── restaurant.ts         # Restaurant type definitions
    └── user.ts               # User and session types
```

## 🔑 Authentication Flow

### Registration (`/auth/register`)
1. User fills form (name, email, password, confirm password)
2. Client-side validation with Zod schema
3. Server action validates and hashes password with bcryptjs
4. User created in MongoDB `users` collection
5. Session created and cookie set
6. User redirected to home page

### Login (`/auth/login`)
1. User enters email and password
2. Server action validates credentials
3. Password verified against stored hash
4. New session token generated (token rotation)
5. Session stored in MongoDB `sessions` collection
6. Cookie set and user redirected to home page

### Protected Routes
- Home page (`/`) requires authentication
- Only users with `user` or `admin` roles can access
- Unauthenticated users redirected to `/auth/login?reason=unauthenticated`
- Unauthorized users redirected to `/auth/login?reason=unauthorised`

### Logout (`/auth/logout`)
1. Server action destroys session in MongoDB
2. Cookie cleared
3. Page revalidated
4. User redirected to login page

## 🔍 Filtering System

### API Endpoint: `/api/restaurants`

**Query Parameters:**
- `q` - Search query (matches name, description, locality, cuisines)
- `cuisine` - Cuisine filter (can be multiple: `?cuisine=Italian&cuisine=Pizza`)
- `minRating` - Minimum rating (0-5)
- `maxCost` - Maximum cost for two (₹)

**Example:**
```
GET /api/restaurants?q=pizza&cuisine=Italian&minRating=4.0&maxCost=600
```

### Client-Side Filtering
- Filters applied in real-time as user interacts
- Results update instantly without page reload
- All filters combined with AND logic
- Page resets to 1 when filters change
- Infinite scroll works with filtered results

## 🚢 Deployment

### Environment Variables
Set all environment variables in your hosting provider:
- Vercel: Project Settings → Environment Variables
- Other platforms: Follow their environment variable configuration

### Build & Start
```bash
npm run build
npm start
```

### MongoDB Connection
- Ensure MongoDB URI is accessible from your hosting provider
- Whitelist your hosting provider's IP in MongoDB Atlas (if using Atlas)
- App gracefully falls back to JSON data if MongoDB unavailable

### Recommended Platforms
- **Vercel**: Optimized for Next.js, automatic deployments
- **Netlify**: Good Next.js support
- **Railway**: Easy MongoDB integration
- **Render**: Full-stack deployment support

## 📊 Sample Data

The app includes 21 sample restaurants with:
- Diverse cuisines (38 unique types)
- Ratings from 4.0 to 4.9
- Cost range: ₹200 - ₹900
- Mix of pure veg and non-veg options
- Various delivery times and locations

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed MongoDB with sample data

## 📝 Notes

- The app works without MongoDB using the bundled JSON dataset
- All authentication features require MongoDB
- Session cookies are HTTP-only and SameSite=Lax for security
- Password hashing uses bcryptjs with salt rounds of 10
- Infinite scroll loads 12 items per batch
- Filtering works on both MongoDB and JSON fallback data

## 🤝 Contributing

This is a learning project. Feel free to fork and modify for your own use.

## 📄 License

This project is for educational purposes.
