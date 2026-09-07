# E-commerce REST API Backend

A production-ready E-commerce REST API built using **Node.js, Express, MongoDB, Mongoose, Zod**.

## Tech Stack
*   **Runtime Environment**: Node.js (ES Modules syntax: `"type": "module"`)
*   **Web Framework**: Express
*   **Database**: MongoDB (Object modeling via Mongoose)
*   **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` for secure password hashing
*   **Validation**: Zod (incoming request schema parsing)
*   **Security**: `helmet` (secure HTTP headers), `cors` (Cross-Origin Resource Sharing), and `express-rate-limit` (DDoS/Brute-force protection)

---

## Folder Structure
```text
├── postman/
│   └── ecommerce-api.postman_collection.json  # Complete Postman Collection
├── src/
│   ├── config/
│   │   └── database.js                       # MongoDB connection setup
│   ├── controllers/
│   │   └── auth.controller.js                # Registration & JWT Login
│   ├── middleware/
│   │   ├── admin.middleware.js               # Role-based admin check
│   │   ├── auth.middleware.js                # JWT verification
│   │   ├── error.middleware.js               # Centralized error handler
│   │   └── validate.middleware.js            # Schema validation middleware
│   ├── models/
│   │   └── User.js                           # User model schema with password hooks
│   ├── routes/
│   │   └── auth.routes.js                    # Auth router
│   ├── seed/
│   │   └── admin.seed.js                     # Idempotent Admin seeder script
│   ├── utils/
│   │   └── ApiError.js                       # Standardized custom API error class
│   ├── validations/
│   │   └── schemas.js                        # Zod schemas for input validation
│   ├── app.js                                # Express app configuration & middlewares
│   └── server.js                             # HTTP server entry point
├── .env.example                              # Template environment variables
├── package.json
└── README.md
```

---

## Installation & Setup

### 1. 
Ensure you have **Node.js (v20+)** and **MongoDB** installed and running on your system.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Configuration
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce-backend
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=7d

# Admin account seeding credentials
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

### 4. Seed the Admin Account
Run the idempotent admin seeder script to populate the database with a preconfigured administrator:
```bash
npm run seed:admin
```

### 5. Run the Server
*   **Development Mode (Nodemon)**:
    ```bash
    npm run dev
    ```
*   **Production Mode**:
    ```bash
    npm start
    ```

---