<div align="center">
  <h1>🚀 Rigcraft - The Ultimate Custom PC Builder & eCommerce Platform</h1>
  <p>
    <strong>A next-generation platform for building custom PCs, exploring prebuilt rigs, and purchasing PC components.</strong>
  </p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-rigcraft--chi.vercel.app-0052FF?style=for-the-badge)](https://rigcraft-chi.vercel.app/)
  [![Built with React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
</div>

<br />

## 🌟 Overview

**Rigcraft** is a comprehensive full-stack eCommerce application specifically tailored for PC enthusiasts. It bridges the gap between buying individual components and purchasing fully assembled systems by providing an interactive, intelligent **Custom PC Builder**, alongside a traditional storefront for components and accessories.

### 🔗 Live Preview
👉 **[Experience Rigcraft Live](https://rigcraft-chi.vercel.app/)**

---

## ✨ Core Features

### 🛠️ Intelligent Custom PC Builder
- Step-by-step interactive builder guiding users through compatible parts (CPU, GPU, Motherboard, RAM, etc.).
- Real-time compatibility checks (socket types, form factors, wattage).
- Instant total price calculation and wattage estimation.
- **AI Chatbot Assistant:** Integrated AI to help users pick parts, understand specs, and resolve compatibility issues.

### 🛒 Robust eCommerce Storefront
- **Prebuilt PCs:** Browse expertly assembled systems for gaming, workstations, and office use.
- **Component Catalog:** Filter components by brand, price, rating, and detailed technical specifications.
- **Deals & Bundles:** Dedicated sections for active discounts, hot deals, and combo bundles with live countdown timers.
- **Cart & Wishlist System:** Persistent cart/wishlist for both guest users (localStorage) and authenticated users (MongoDB).
- **Checkout & Payments:** Secure payment integration flow.

### 👤 User Management & Dashboards
- Secure JWT-based Authentication (Login, Register, Password Reset).
- **Customer Dashboard:** Track order history, manage saved PC builds, and request warranty support.
- **Support & Warranty:** Submit support tickets or RMA claims directly from the dashboard.

### 👑 Admin Portal
- Comprehensive dashboard to manage Products, Prebuilt PCs, Orders, Users, and Support Tickets.
- Dynamic Deal Management (set active sales, coupons, and promotional banners).

---

## 💻 Tech Stack

### Frontend
- **React.js (Vite)** - Fast, modern UI library
- **Tailwind CSS** - Utility-first styling for beautiful, responsive design
- **Framer Motion** - Smooth page transitions and micro-interactions
- **React Router v6** - Client-side routing and protected routes
- **TanStack Query (React Query)** - Powerful asynchronous state management and caching
- **Material UI Icons** - Standardized iconography

### Backend
- **Node.js & Express.js** - Scalable, event-driven server environment
- **MongoDB & Mongoose** - Flexible NoSQL database and ODM for complex product schemas
- **JSON Web Tokens (JWT)** - Secure, stateless authentication
- **Multer** - File and image upload handling
- **Stripe/Razorpay** - (Configurable) Payment gateway integration

---

## 🚀 Local Setup & Installation

Follow these instructions to run Rigcraft on your local machine.

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local instance or MongoDB Atlas cluster)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/rigcraft.git
cd rigcraft
\`\`\`

### 2. Setup the Backend
\`\`\`bash
cd server
npm install
\`\`\`
Create a `.env` file in the `server` directory:
\`\`\`env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
# Add other keys (Cloudinary, Stripe, etc.) as required
\`\`\`
Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Setup the Frontend
Open a new terminal window:
\`\`\`bash
cd client
npm install
\`\`\`
Create a `.env` file in the `client` directory:
\`\`\`env
VITE_API_URL=http://localhost:5000/api/v1
\`\`\`
Start the Vite development server:
\`\`\`bash
npm run dev
\`\`\`

The app will be running at `http://localhost:5173`.

---

## 📚 API Documentation (v1)

The backend exposes a RESTful API located at `/api/v1`. Below are the primary resource endpoints.

### 🔐 Authentication (`/auth`)
- `POST /auth/register` - Register a new customer/admin
- `POST /auth/login` - Authenticate user & receive JWT
- `GET /auth/me` - Get current logged-in user profile
- `POST /auth/forgot-password` - Initiate password reset

### 📦 Products & Components (`/products`)
- `GET /products` - Fetch paginated, filterable components
- `GET /products/:id` - Get detailed product specifications
- `POST /products` - (Admin) Create a new component
- `PUT /products/:id` - (Admin) Update a component
- `DELETE /products/:id` - (Admin) Delete a component

### 🖥️ Prebuilt PCs (`/prebuilt-pcs`)
- `GET /prebuilt-pcs` - List all prebuilt systems
- `GET /prebuilt-pcs/:id` - Get prebuilt PC details

### 🛠️ Custom Builds (`/builds`)
- `POST /builds` - Save a custom PC build configuration
- `GET /builds/my-builds` - Fetch all saved builds for the logged-in user
- `DELETE /builds/:id` - Delete a saved build

### 🛒 Cart & Checkout (`/cart` & `/orders`)
- `GET /cart` - Retrieve current user's cart
- `POST /cart/add` - Add item (component or prebuilt) to cart
- `DELETE /cart/remove/:itemId` - Remove item from cart
- `POST /orders` - Create a new order (Checkout)
- `GET /orders/myorders` - List user's order history

### 🏷️ Deals & Promotions (`/deals` & `/coupons`)
- `GET /deals` - Fetch active deals, bundles, and discounts
- `POST /coupons/validate` - Validate a discount code during checkout

### 🎧 Support & Warranty (`/support`)
- `POST /support` - Submit a new support/warranty ticket
- `GET /support/my-tickets` - View user's submitted tickets
- `PUT /support/:id/status` - (Admin) Update ticket status

---

## 📁 Project Structure

\`\`\`
rigcraft/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── admin/          # Admin Dashboard Panels
│   │   ├── api/            # Axios API Client configurations
│   │   ├── components/     # Reusable UI components (Cards, Navbar, Chatbot)
│   │   ├── context/        # React Context (Auth, Cart, Wishlist)
│   │   ├── pages/          # Full page views (Home, PCBuilder, Deals, Error)
│   │   ├── sections/       # Page-specific block sections (DealsHero, Catalog)
│   │   ├── services/       # Abstracted API calls
│   │   └── App.jsx         # Main Router & Layout wrapper
│   └── tailwind.config.js  # Tailwind theme definitions
│
├── server/                 # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/    # Business logic & request handling
│   │   ├── models/         # Mongoose Schemas (User, Product, Order)
│   │   ├── routes/         # Express Route definitions
│   │   ├── middleware/     # Auth, Error handling, File uploads
│   │   └── config/         # Database & environment configurations
│   └── index.js            # Server entry point
└── README.md
\`\`\`

---

## 🚀 Future Roadmap
- [ ] **Social Sharing:** Allow users to generate unique links to share their custom PC builds.
- [ ] **Advanced AI:** Deeper integration with AI to automatically build PCs based on a user's target framerate and budget.
- [ ] **Benchmark Estimates:** Display estimated FPS in popular games based on the selected CPU & GPU combo.

---

## 📜 License
This project is proprietary. All rights reserved by **Rigcraft**.

<div align="center">
  <p>Built for PC Enthusiasts.</p>
  <p>Developed by Team D Penoft PIP-04</p>
</div>
