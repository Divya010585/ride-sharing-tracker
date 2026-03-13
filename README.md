# 🚗 Real-Time Ride Sharing Tracker

A full-stack real-time ride sharing application where users can create trips, share room codes, and track each other's live GPS location on an interactive map.

## 🌟 Features

- 🔐 JWT Authentication (Register/Login)
- 🚗 Create trips with unique room codes
- 🔗 Join trips using room codes
- 📍 Real-time live location tracking
- 👥 Participant count display
- 👻 Ghost mode (go invisible)
- 📋 Copy room code button
- 🗺️ Interactive map with live markers

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router DOM
- Socket.io Client
- Leaflet.js / React Leaflet
- Axios

### Backend
- Node.js
- Express.js
- Socket.io
- MySQL
- JWT (jsonwebtoken)
- bcryptjs

## 📁 Project Structure
```
ride-sharing-tracker/
├── server/                  → Backend
│   ├── config/db.js         → MySQL connection
│   ├── controllers/         → Business logic
│   ├── middleware/          → JWT auth middleware
│   ├── routes/              → API routes
│   ├── socket/              → Socket.io logic
│   └── index.js             → Entry point
└── client/                  → Frontend
    └── src/
        ├── components/      → Reusable components
        ├── pages/           → Page components
        └── socket.js        → Socket.io client
```

## 🔗 API Routes

| Method | Route | Description | Protected |
|--------|-------|-------------|-----------|
| POST | /api/auth/register | Register user | ❌ |
| POST | /api/auth/login | Login + get token | ❌ |
| POST | /api/trips/create | Create trip | ✅ |
| POST | /api/trips/join | Join trip | ✅ |
| GET | /api/trips/:roomCode | Get trip details | ✅ |

## 🗄️ Database Schema
```sql
users              → stores user accounts
trips              → stores trip info + room code
trip_participants  → stores who joined which trip
```

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Divya010585/ride-sharing-tracker.git
cd ride-sharing-tracker
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file in server folder:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ridesharing
JWT_SECRET=your_secret_key
```

### 3. Setup MySQL Database
```sql
CREATE DATABASE ridesharing;
USE ridesharing;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_code VARCHAR(20) UNIQUE,
  created_by INT,
  status ENUM('active', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE trip_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT,
  user_id INT,
  is_ghost TINYINT DEFAULT 0,
  FOREIGN KEY (trip_id) REFERENCES trips(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. Setup Frontend
```bash
cd ../client
npm install
```

### 5. Run the Application
```bash
# Terminal 1 - Backend
cd server
node index.js

# Terminal 2 - Frontend
cd client
npm start
```

## 🌍 Usage

1. Register an account
2. Login with your credentials
3. Click **"Create New Trip"** to start a trip
4. Share the room code with friends
5. Friends join using **"Join Trip"**
6. See each other's live location on the map!

## 👩‍💻 Developer

Built by **Divya** — 3rd Year CS Student