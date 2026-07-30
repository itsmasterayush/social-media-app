# 🚀 Production-Ready Full-Stack Social Media Posts Application

A modern, high-performance, scalable, and bug-free full-stack social posting platform built with Node.js, Express, MongoDB Atlas, React (Vite), JWT authentication, and Tailwind CSS.

---

## 🌟 Features

- 🔐 **Authentication & Security**
  - Secure JWT-based user authentication.
  - Registration with strict password complexity (minimum 8 characters, uppercase, lowercase, number, and special character).
  - Bcrypt password hashing & automatic JWT persistence.
  - Protected private routes & automatic unauthorized redirect.
  - Security headers via **Helmet**, **CORS**, **Express Rate Limiting**, and **MongoDB Query Injection Sanitization**.

- 📝 **Post Management (CRUD)**
  - **Create Posts**: Title & content validation with instant publishing.
  - **Read Posts**: Paginated community feed with server-side pagination (10 posts/page).
  - **View Details**: Automatic **view counter increment** (+1) upon opening any post.
  - **Update Posts**: Owner-only post editing capabilities.
  - **Delete Posts**: Owner-only post deletion protected by a confirmation modal dialog.

- ❤️ **Interactive Like System**
  - Reactive Like/Unlike toggle.
  - Rule enforcement: Users cannot like posts twice (clicking again removes like).
  - Instant UI update & like counts.
  - Owners can also like their own posts.

- 🏆 **Leaderboard (Top Posts)**
  - Ranked by Engagement Score formula: `Score = Likes + Views`.
  - Gold, Silver, and Bronze trophy badges for top-performing posts.

- 📊 **Creator Dashboard**
  - Personal stats overview: Total posts created, Total likes received across all posts, Total views received across all posts.
  - List of user's published posts with inline edit and delete actions.

- 🔍 **Real-Time Search & Sorting**
  - Live instant debounced search by **Title** or **Author Name**.
  - Server-side sorting options:
    - *Newest First*
    - *Oldest First*
    - *Most Liked*
    - *Most Viewed*
    - *Highest Engagement*

- 🎨 **Modern Responsive UI / UX**
  - Glassmorphic dark aesthetic styled with Tailwind CSS.
  - Shimmer Skeleton Loaders, Loading Spinners, Empty States, and Error States.
  - Responsive mobile drawer navigation menu.
  - Toast notifications via **React Hot Toast**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios (with Request & Response Interceptors)
- **Form Management**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas / Mongoose ORM
- **Security**: JWT, Bcryptjs, Helmet, CORS, Express Rate Limit, Express Mongo Sanitize
- **Validation**: Express Validator
- **Logging**: Morgan

---

## 📁 Project Folder Structure

```
Project/
├── server/                   # Backend Express Application
│   ├── config/               # Database Connection Config
│   │   └── db.js
│   ├── controllers/          # Business Logic Controllers
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/           # Express Custom Middlewares
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── validateMiddleware.js
│   ├── models/               # Mongoose Schemas (User, Post)
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/               # Express API Route Handlers
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── utils/                # Utilities (asyncWrapper)
│   │   └── asyncWrapper.js
│   ├── validators/           # Express Validator Rules
│   │   ├── authValidator.js
│   │   └── postValidator.js
│   ├── .env.example
│   ├── index.js              # Express Entrypoint
│   └── package.json
├── client/                   # Frontend React Application
│   ├── src/
│   │   ├── assets/           # Static Assets
│   │   ├── components/       # Reusable UI Components (Navbar, PostCard, Skeleton, Modal, etc.)
│   │   ├── context/          # Auth Context Provider
│   │   ├── hooks/            # Custom Hooks (useAuth)
│   │   ├── layouts/          # Page Layouts (MainLayout)
│   │   ├── pages/            # Application Pages (Home, PostDetail, TopPosts, Dashboard, Login, Register)
│   │   ├── services/         # Axios API Services
│   │   ├── utils/            # Helper utilities
│   │   ├── App.jsx           # App Routes & Lazy Suspense
│   │   ├── main.jsx
│   │   └── index.css         # Tailwind & Custom Glassmorphism CSS
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
├── README.md
└── package.json              # Root package orchestrator
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/social_app
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or MongoDB Atlas connection URI)

### 1. Install Dependencies
In the root directory, run:
```bash
npm run install:all
```
*Or install inside `server/` and `client/` manually:*
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Files
- Create `server/.env` based on `server/.env.example`.
- Create `client/.env` based on `client/.env.example`.

### 3. Run Development Servers

**Run Server & Client concurrently (from root):**
```bash
# Terminal 1: Backend
npm run server:dev

# Terminal 2: Frontend
npm run client
```

- Backend API running at: `http://localhost:5000`
- Frontend App running at: `http://localhost:5173`

---

## 📡 API Documentation

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch current logged-in user profile | **Yes** |

### Posts Endpoints (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Fetch paginated posts (Query: `page`, `limit`, `search`, `sort`) | No |
| `GET` | `/api/posts/top` | Fetch Top Posts leaderboard ranked by engagement score | No |
| `GET` | `/api/posts/dashboard/user` | Fetch logged-in user stats & personal posts | **Yes** |
| `GET` | `/api/posts/:id` | Fetch single post & increment view count (+1) | No |
| `POST` | `/api/posts` | Create a new post | **Yes** |
| `PUT` | `/api/posts/:id` | Update post (Owner only) | **Yes** |
| `DELETE` | `/api/posts/:id` | Delete post (Owner only) | **Yes** |
| `POST` | `/api/posts/:id/like` | Toggle Like/Unlike on a post | **Yes** |

---

## 📦 Build & Deployment Instructions

### Frontend Build
To create a production-optimized build of the React app:
```bash
cd client
npm run build
```
The production bundle will be generated in `client/dist`.

### Deployment Platforms
- **Frontend**: Deploy on **Vercel** or **Render** (Static Site). Set root directory to `client`, build command to `npm run build`, and publish directory to `dist`. Set `VITE_API_BASE_URL` to your production backend URL.
- **Backend**: Deploy on **Render** (Web Service). Set root directory to `server`, build command to `npm install`, and start command to `npm start`. Configure production environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`).
- **Database**: Host on **MongoDB Atlas**.

---

## 🔒 Security Practices Implemented
1. **HTTP Security Headers**: Powered by `helmet()`.
2. **CORS Policy**: Configured to restrict origin requests.
3. **Password Security**: Salted and hashed using `bcryptjs` (10 rounds). Passwords stripped from responses automatically.
4. **JWT Safeguards**: Tokens verified on all protected endpoints with authorization headers.
5. **NoSQL Injection Defense**: Sanitized inputs using `express-mongo-sanitize`.
6. **API Rate Limiting**: Prevents brute-force and DDoS attempts using `express-rate-limit`.

---

## 📄 License
This project is licensed under the ISC License.
