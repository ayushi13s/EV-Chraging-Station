# EV Charging Slot Booking System - Complete Backend Edition

A fully functional EV charging slot booking system with an independent Node.js backend, SQLite database, and responsive web frontend. **No Firebase or external dependencies required!**

## ✨ Features

### User Features
- ✅ User registration and login with JWT authentication
- ✅ Google Maps integration to view charging stations
- ✅ Real-time slot availability checking
- ✅ Easy slot booking with date/time selection
- ✅ View complete booking history
- ✅ Cancel bookings
- ✅ Password reset functionality
- ✅ Distance calculation to stations

### Admin Features
- ✅ Secure admin authentication
- ✅ Add new charging stations
- ✅ Manage charging bunk details
- ✅ Delete charging stations
- ✅ Update available slots
- ✅ View all bookings
- ✅ Dashboard statistics

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js + Express.js |
| Database | SQLite3 |
| Authentication | JWT (JSON Web Tokens) |
| Security | bcryptjs password hashing |
| Frontend | Vanilla JavaScript + HTML + CSS |
| Maps | Google Maps API |
| Cross-Origin | CORS Enabled |

## 📁 Project Structure

```
ev_vehicles/
├── server.js              # Main Express backend server
├── script.js              # Frontend JavaScript (API calls & UI)
├── index.html             # User booking interface
├── admin.html             # Admin management panel
├── style.css              # Styling for all pages
├── package.json           # NPM dependencies
├── .env                   # Environment configuration
├── ev_charging.db         # SQLite database (auto-created)
└── README.md              # This file
```

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Google Maps API Key** (optional but recommended)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- express (web server)
- sqlite3 (database)
- cors (cross-origin requests)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- dotenv (environment variables)

### Step 2: Start the Server

```bash
npm start
```

You should see:
```
✓ EV Charging Server running on http://localhost:3000
✓ Serving frontend from your_directory
```

### Step 3: Access the Application

**User Interface (Booking Page):**
```
http://localhost:3000/index.html
```

**Admin Panel (Management Page):**
```
http://localhost:3000/admin.html
```

## 🗄️ Database Schema

The system automatically creates these tables on first run:

### users
```sql
id (INTEGER PRIMARY KEY)
email (TEXT UNIQUE)
password (TEXT)
role (TEXT) -- 'user' or 'admin'
created_at (DATETIME)
```

### bunks
```sql
id (INTEGER PRIMARY KEY)
name (TEXT)
address (TEXT)
mobile (TEXT)
total_slots (INTEGER)
available_slots (INTEGER)
lat (REAL)
lng (REAL)
created_at (DATETIME)
```

### bookings
```sql
id (INTEGER PRIMARY KEY)
user_id (INTEGER FOREIGN KEY)
bunk_id (INTEGER FOREIGN KEY)
booking_date (DATE)
booking_time (TEXT)
status (TEXT) -- 'confirmed' or 'cancelled'
duration_hours (INTEGER)
created_at (DATETIME)
```

### password_resets
```sql
id (INTEGER PRIMARY KEY)
user_id (INTEGER FOREIGN KEY)
token (TEXT UNIQUE)
expires_at (DATETIME)
created_at (DATETIME)
```

## 🔐 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
POST   /api/auth/forgot-password   - Request password reset
```

### Bunk (Charging Station) Endpoints
```
GET    /api/bunks                  - Get all bunks
GET    /api/bunks/:id              - Get specific bunk
POST   /api/bunks                  - Create bunk (admin only)
PUT    /api/bunks/:id              - Update bunk (admin only)
DELETE /api/bunks/:id              - Delete bunk (admin only)
PUT    /api/bunks/:id/slots        - Update slots (admin only)
```

### Booking Endpoints
```
POST   /api/bookings               - Create booking
GET    /api/bookings               - Get user's bookings
DELETE /api/bookings/:id           - Cancel booking
GET    /api/admin/bookings         - Get all bookings (admin only)
GET    /api/bunks/:id/availability/:date - Check slot availability
```

### Admin Endpoints
```
GET    /api/admin/stats            - Dashboard statistics (admin only)
```

## 👤 User Guide

### For Users

**1. Register Account:**
- Go to http://localhost:3000/index.html
- Click "Register"
- Enter email and password (min 6 characters)
- Click "Register" button

**2. Login:**
- Click "Login" on the same page
- Enter email and password
- Click "Login" button

**3. View Charging Stations:**
- Click "View Stations on Map" button
- See all nearby charging stations on the map
- Zoom and pan to explore

**4. Book a Charging Slot:**
- Click "Book Slots" button
- Select a charging station from the list
- Click "Book Now"
- Choose booking date and time
- Click "Confirm Booking"

**5. Check Booking History:**
- Click "Booking History" button
- See all your bookings
- Click "Cancel" to cancel any booking

**6. Reset Password:**
- Click "Forgot Password?" link
- Enter your email
- Click "Send Reset Email"

### For Admin

**1. Admin Login:**
- Go to http://localhost:3000/admin.html
- Enter admin email and password
- Click "Login"

**2. Add New Charging Station:**
- Fill in:
  - Station Name (min 3 characters)
  - Address (min 5 characters)
  - Number of Slots (1-100)
  - Mobile Number (10 digits)
- Click "Save Bunk"
- System automatically gets coordinates from address

**3. Manage Slots:**
- Select a station from dropdown
- Enter new available slots count
- Click "Update Slots"

**4. Delete Station:**
- Find station in the list
- Click "Delete" button
- Confirm deletion

## 🧪 Testing the System

### Create Test User
```
Email: user@example.com
Password: password123
```

### Create Test Admin
1. First, register a user with email: admin@example.com
2. In SQLite database, run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Or via Node.js REPL:
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ev_charging.db');
db.run("UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'", function() {
  console.log('Admin created');
  db.close();
});
```

### Create Test Stations
- Login as admin
- Add stations with addresses like:
  - "New Delhi, India"
  - "Mumbai, India"
  - "Bangalore, India"
- Add 10-20 slots per station

## ⚙️ Configuration

### Environment Variables (.env)
```
PORT=3000                           # Server port
JWT_SECRET=your_secret_key_here     # JWT signing key
NODE_ENV=development                # development or production
```

### Update API URL (if running on different machine)
In `script.js`, change:
```javascript
const API_URL = 'http://localhost:3000/api';
```
to your server's IP/domain:
```javascript
const API_URL = 'http://192.168.1.100:3000/api';
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Role-based access control (Admin/User)
- ✅ CORS enabled for cross-origin requests
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention with parameterized queries

## 📊 Database Operations

### Backup Database
```bash
# On Windows
copy ev_charging.db ev_charging.backup.db

# On Linux/Mac
cp ev_charging.db ev_charging.backup.db
```

### Reset Database
```bash
# Delete the database file and restart server
rm ev_charging.db
npm start
```

## 🚨 Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### Issue: "Port 3000 is already in use"
**Solution:** Change PORT in .env file
```
PORT=3001
```

### Issue: "Maps not loading"
**Solution:**
- Check internet connection
- Verify Google Maps API key is valid
- Open browser console (F12) for errors
- Ensure location permission is granted

### Issue: "Cannot connect to server"
**Solution:**
- Ensure server is running
- Check API_URL in script.js matches server address
- Check firewall settings
- Try http://localhost:3000 directly in browser

### Issue: "Database lock error"
**Solution:**
- Close any other instances
- Restart server
- Delete db file if corrupted

## 📈 Performance Tips

1. **Enable Database Indexing:**
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_booking_user ON bookings(user_id);
CREATE INDEX idx_booking_date ON bookings(booking_date);
```

2. **Implement Caching** for static bunk data
3. **Use Connection Pooling** in production
4. **Enable Compression** with gzip middleware

## 🌐 Deployment Guide

### Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku account and app

```bash
heroku login
heroku create your-app-name
heroku config:set JWT_SECRET=your_secure_key
git push heroku main
```

### Deploy to AWS/Google Cloud

1. Set up EC2/Compute instance
2. Install Node.js
3. Clone repository
4. Run `npm install && npm start`
5. Configure SSL with Let's Encrypt

## 📝 API Request Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bunk_id":1,
    "booking_date":"2024-12-20",
    "booking_time":"14:30",
    "duration_hours":2
  }'
```

### Get All Bunks
```bash
curl http://localhost:3000/api/bunks
```

## 📄 License

MIT License - Free to use and modify

## 🤝 Contributing

Feel free to fork and submit pull requests for improvements!

## ✉️ Support

For issues:
1. Check troubleshooting section above
2. Check browser console for errors (F12)
3. Check server logs for API errors
4. Ensure all dependencies are installed

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2024  
**Fully Functional**: Yes - No Firebase Required!
