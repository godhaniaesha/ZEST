# Zest Restaurant Backend

This is the backend for the Zest Restaurant management system, built with Node.js, Express, and MongoDB.

## Setup Instructions

1. **Install MongoDB**: Make sure MongoDB is installed and running locally on your machine (or update the MONGODB_URI in .env to use a cloud instance like MongoDB Atlas).
2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Seed the database (optional)**: To populate with initial data from the frontend mock data:
   ```bash
   npm run seed
   ```
4. **Start the server**:
   ```bash
   npm start
   ```
   The server will be running on http://localhost:5000

## API Endpoints

The following REST API endpoints are available:

- `/api/menu` - Menu items (GET, POST, PUT, DELETE)
- `/api/orders` - Orders (GET, POST, PUT, DELETE)
- `/api/tables` - Tables (GET, POST, PUT, DELETE)
- `/api/staff` - Staff (GET, POST, PUT, DELETE)
- `/api/inventory` - Inventory (GET, POST, PUT, DELETE)
- `/api/reservations` - Reservations (GET, POST, PUT, DELETE)
- `/api/users` - Users (GET, POST, PUT, DELETE)
