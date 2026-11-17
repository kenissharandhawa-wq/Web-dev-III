# Assignment 3 — Inventory and Data Management System

**Course:** Web Dev III | **Unit:** 3

A RESTful backend built using Node.js, Express.js, MongoDB, Mongoose and dotenv.

## Setup

1. Install Node.js and start your local MongoDB server.
2. Open this folder in VS Code.
3. Run `npm install` in the terminal.
4. Copy `.env.example` to `.env` (Windows: `copy .env.example .env`).
5. Run `npm start`.
6. Open `http://localhost:5000/` to check the server.
7. Test endpoints in Postman using **Body > raw > JSON** and `Content-Type: application/json`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/products` | Create product |
| GET | `/api/products` | List, filter, sort, paginate |
| GET | `/api/products/:id` | Get product by ID |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id/stock` | Increase/decrease stock safely |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/low-stock` | Low-stock report |
| GET | `/api/products/summary` | Category-wise aggregation |

## Example POST body

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

Add another product for low-stock testing:

```json
{
  "name": "Study Table",
  "sku": "FURN-TB-812",
  "category": "Furniture",
  "price": 3999,
  "quantity": 2,
  "reorderLevel": 4,
  "supplier": "IKEA India"
}
```

For the ID routes, replace `:id` with the actual `_id` returned by POST.

## Examples

- Filter by category: `GET /api/products?category=Stationery`
- Search name: `GET /api/products?search=pen`
- Price range: `GET /api/products?minPrice=100&maxPrice=5000`
- Sort and paginate: `GET /api/products?sortBy=price&order=asc&page=1&limit=5`
- Restock: `PATCH /api/products/:id/stock` with `{ "change": 10 }`
- Sale: `PATCH /api/products/:id/stock` with `{ "change": -2 }`
- Update: `PUT /api/products/:id` with `{ "price": 140, "quantity": 60 }`

## Validation and error handling

Required name, SKU, category, price and quantity; unique SKU; non-negative price/quantity/reorderLevel; integer quantity/reorderLevel. Invalid input returns 400, duplicate SKU returns 409, missing product returns 404. Stock decreases use an atomic conditional update to prevent negative inventory.

## Evidence for submission

Run the server and use Postman to capture your own screenshots of POST, GET, PUT, DELETE, PATCH stock, GET low-stock, GET summary, and a filtered/paginated GET request. These are real results from your local MongoDB database; screenshots are not included because the API has not been run on your machine.
