# Billdex — Billing & Inventory Management System

A clean, minimal backend for managing products and billing for multiple shop owners.

---

## Tech Stack

- **Node.js** + **Express.js** — Server & routing
- **MongoDB** + **Mongoose** — Database & ODM
- **JWT** — Authentication
- **bcryptjs** — Password hashing

---

## Project Structure

```
billdex/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Signup & login logic
│   ├── productController.js   # Product CRUD logic
│   └── billController.js      # Billing logic
├── middleware/
│   └── authMiddleware.js      # JWT protect middleware
├── models/
│   ├── User.js                # User schema
│   ├── Product.js             # Product schema
│   └── Bill.js                # Bill schema
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── productRoutes.js       # /api/products
│   └── billRoutes.js          # /api/bills
├── .env.example               # Environment variable template
├── package.json
└── server.js                  # App entry point
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/billdex
JWT_SECRET=your_super_secret_key
```

### 3. Run the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## API Reference

All protected routes require the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth

#### POST /api/auth/signup
Register a new user.

**Body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "secret123",
  "organisationName": "Ravi Electronics"
}
```

**Response:**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "Ravi Kumar", ... }
}
```

---

#### POST /api/auth/login
Login and get a JWT token.

**Body:**
```json
{
  "email": "ravi@example.com",
  "password": "secret123"
}
```

---

### Products (Protected)

#### POST /api/products
Add a new product.

**Body:**
```json
{
  "name": "USB Cable",
  "category": "Accessories",
  "mrp": 299,
  "sellingPrice": 249,
  "quantity": 50
}
```

---

#### GET /api/products
Get all products for the logged-in user.

---

#### PUT /api/products/:id
Update a product by ID.

**Body:** (any fields to update)
```json
{
  "sellingPrice": 229,
  "quantity": 45
}
```

---

#### DELETE /api/products/:id
Delete a product by ID.

---

### Bills (Protected)

#### POST /api/bills
Create a bill. Stock is automatically reduced.

**Body:**
```json
{
  "items": [
    { "productId": "64abc...", "quantity": 2 },
    { "productId": "64def...", "quantity": 1 }
  ],
  "discount": 10,
  "gst": 18
}
```

**Bill Calculation:**
1. `totalAmount` = sum of (sellingPrice × quantity) for all items
2. `afterDiscount` = totalAmount − (totalAmount × discount / 100)
3. `finalAmount` = afterDiscount + (afterDiscount × gst / 100)

---

#### GET /api/bills
Get all bills for the logged-in user (newest first).

---

## Notes

- Each user's products and bills are completely isolated from other users.
- Product stock is reduced automatically when a bill is created.
- If any product has insufficient stock, the entire bill creation is rejected.
- Prices are stored as a snapshot at the time of sale.
