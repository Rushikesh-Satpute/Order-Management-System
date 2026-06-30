# Multi-Store Order Management System

A full-stack order management system built with **Next.js**, **Express.js**, **MongoDB**, and **Socket.IO** for real-time updates.

## Features

### Order Management
- Create orders by selecting a store and food items from dropdowns
- View orders with store filtering and pagination
- Update order status (PLACED → PREPARING → COMPLETED)

### Real-Time Updates
- Socket.IO for instant UI updates without page refresh
- Store-based room filtering for targeted events
- Auto-reconnect on connection drops

### Analytics & Archival
- Orders per day aggregation
- Revenue per store
- Top 5 selling items by quantity
- Archive orders older than 30 days

### Normalized Database Design
- 3-collection structure: `stores`, `foodItems`, `storeFoodItems`
- No food item duplication across stores
- Auto-calculated order totals from item prices
- Validates food item availability per store

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| State Management | React Query (TanStack Query) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Real-time | Socket.IO |
| Validation | Zod |
| Language | TypeScript |

---

## Project Structure

```
Order-Management-System/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── order.controller.ts
│   │   │   ├── store.controller.ts
│   │   │   ├── analytics.controller.ts
│   │   │   └── archive.controller.ts
│   │   ├── models/
│   │   │   ├── Order.ts
│   │   │   ├── OrderArchive.ts
│   │   │   ├── Store.ts
│   │   │   ├── FoodItem.ts
│   │   │   └── StoreFoodItem.ts
│   │   ├── routes/
│   │   │   ├── order.routes.ts
│   │   │   ├── store.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── schemas/
│   │   │   └── order.schema.ts
│   │   ├── sockets/
│   │   │   └── socket.ts
│   │   ├── middlewares/
│   │   │   ├── validate.ts
│   │   │   └── errorHandler.ts
│   │   ├── seed.ts
│   │   └── server.ts
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── page.tsx              # Dashboard
    │   ├── create/
    │   │   └── page.tsx          # Create Order
    │   ├── orders/
    │   │   ├── page.tsx          # Orders List
    │   │   └── [id]/
    │   │       └── page.tsx      # Order Detail
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   └── Input.tsx
    │   ├── orders/
    │   │   ├── StatusBadge.tsx
    │   │   └── StatusSelect.tsx
    │   ├── Navbar.tsx
    │   └── Providers.tsx
    ├── hooks/
    │   ├── useOrders.ts
    │   ├── useStores.ts
    │   └── useAnalytics.ts
    ├── lib/
    │   ├── api.ts
    │   └── socket.ts
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- **Node.js** >= 18
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Order-Management-System
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/Order-Management-System/

# Seed the database with stores and food items
npm run seed

# Start development server
npm run dev
```

The backend will start on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`.

### 4. Open the Application
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Documentation

### Store Endpoints

#### Get All Stores
```http
GET /stores
```

#### Get Store Food Items
```http
GET /stores/:storeId/food-items
```

Returns store info along with all food items available at that store.

### Order Endpoints

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "store_id": "store_1",
  "items": [
    { "item_id": "food_1", "qty": 2 },
    { "item_id": "food_7", "qty": 3 }
  ]
}
```

Total amount is auto-calculated from food item prices. Items are validated against the store's available menu.

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": { "_id": "...", "store_id": "store_1", "total_amount": 740, "status": "PLACED", ... }
}
```

#### Get Orders (with pagination)
```http
GET /orders?store_id=store_1&page=1&limit=10
```

Returns orders enriched with `store_name` and food item `name`/`price`.

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

#### Get Single Order
```http
GET /orders/:id
```

#### Update Order Status
```http
PATCH /orders/:id/status
Content-Type: application/json

{
  "status": "PREPARING"
}
```

Valid statuses: `PLACED`, `PREPARING`, `COMPLETED`

### Analytics Endpoints

#### Orders Per Day
```http
GET /orders-per-day
```

#### Revenue Per Store
```http
GET /revenue-per-store
```

Returns revenue with store names.

#### Top 5 Selling Items
```http
GET /top-items
```

Returns top items with names and calculated revenue.

#### Archive Old Orders
```http
POST /archive-old-orders
```

Moves orders older than 30 days to the `orders_archive` collection.

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `new_order` | Server → Client | New order created |
| `order_status_updated` | Server → Client | Order status changed |
| `join_store` | Client → Server | Join store-specific room |
| `leave_store` | Client → Server | Leave store-specific room |
| `store_new_order` | Server → Client | Store-specific new order |
| `store_order_status_updated` | Server → Client | Store-specific status update |

---

## Database Design

### Collections

**stores**
```
{ store_id, name, type }
```

**foodItems**
```
{ food_id, name, category, price }
```

**storeFoodItems** (mapping table)
```
{ store_id, food_items: [food_id, ...] }
```

**orders**
```
{ store_id, items: [{ item_id, qty }], total_amount, status, created_at }
```

**orders_archive**
```
{ store_id, items, total_amount, status, created_at, archived_at }
```

**Indexes:** `store_id` and `created_at` are indexed for query performance.

---

## 🧪 Evaluation Criteria Coverage

| Criteria | Implementation |
|----------|---------------|
| **Code Quality** | Modular structure, TypeScript, reusable components |
| **Backend Design** | Express routes → Controllers → Models, Zod validation, error middleware |
| **Database Design** | Mongoose schemas with proper indexing, aggregation pipelines |
| **Frontend Quality** | React Query for state, Tailwind CSS, clean component architecture |
| **Scalability** | Pagination, lean queries, Socket.IO rooms for store filtering |
| **Bonus: TypeScript** | Full TypeScript across frontend and backend |

---

## 📝 License

MIT
