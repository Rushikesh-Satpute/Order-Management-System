# 🚀 Full Stack Developer Assessment

## Overview

This assignment evaluates your ability to design, build, and optimize a full-stack application using **Next.js, React, Node.js, and a database**.

You are expected to focus on:

- Clean architecture
- Performance and scalability
- Code quality and maintainability

---

# 🧩 Task 1: Multi-Store Order Management System

## Objective

Build a mini order management system supporting multiple stores.

## Backend Requirements (Node.js + Express)

- Create the following APIs:
  - `POST /orders` → Create a new order
  - `GET /orders?store_id=` → Fetch orders by store (with pagination)
  - `PATCH /orders/:id/status` → Update order status

## Order Schema

```ts
{
  id,
  store_id,
  items: [{ item_id, qty }],
  total_amount,
  status: "PLACED" | "PREPARING" | "COMPLETED",
  created_at
}
```

## Database

- Use any: PostgreSQL / MySQL / MongoDB
- Add indexes on:
  - `store_id`
  - `created_at`

## Frontend Requirements (Next.js)

- Page 1: Create Order
- Page 2: Orders List (filter by store)
- Page 3: Update order status

## Expectations

- Proper API validation
- Clean folder structure
- Efficient data fetching

---

# ⚡ Task 2: Real-Time Notification System

## Objective

Implement real-time updates using WebSockets.

## Backend

- Use **Socket.IO or WS**
- Emit events when:
  - New order is created
  - Order status is updated

## Frontend

- Automatically update UI without refresh:
  - New orders should appear instantly
  - Status updates should reflect in real-time

## Bonus

- Handle reconnect logic
- Implement store-based event filtering

## Expectations

- Clean event handling
- Scalable WebSocket architecture

---

# 📊 Task 3: Data Archival & Analytics

## Objective

Test database optimization and analytical queries.

## Requirements

### Data Archival

- Create two tables:

  - `orders`
  - `orders_archive`

- API:

  - `POST /archive-old-orders`
  - Move orders older than 30 days to archive table

### Analytics APIs

- Orders per day
- Total revenue per store
- Top 5 selling items

## Expectations

- Use aggregation queries (GROUP BY / pipelines)
- Optimize for performance

---

# 🧪 Evaluation Criteria

## 1. Code Quality

- Modular structure
- Readability
- Reusability

## 2. Backend Design

- API structure
- Validation (Zod/Joi preferred)
- Error handling

## 3. Database Design

- Proper schema
- Indexing
- Query optimization

## 4. Frontend Quality

- State management (React Query/Zustand preferred)
- UI responsiveness
- Clean component structure

## 5. Scalability & Performance

- Pagination
- Avoiding N+1 queries
- Efficient data handling

## 6. Bonus Points

- TypeScript usage
- Docker setup
- Deployment (Vercel, AWS, etc.)
- Well-written README

---

# 📦 Submission Guidelines

- Share GitHub repository
- Include setup instructions in README
- Provide API documentation
- (Optional) Deployment link
- (Optional) Short walkthrough video

---

# ⏱ Suggested Time

- Expected completion time: 3 **days**

---

# 🎯 Notes

- Focus on quality over quantity
- Write production-ready code where possible
- Clearly document assumptions

---

Good luck! 🚀

