# Setup Guide - EV Charging Slot Booking System

Complete step-by-step guide to get the system up and running.

## Prerequisites Checklist

- [ ] Windows/Mac/Linux computer
- [ ] Internet connection
- [ ] Node.js installed (v14+)
- [ ] About 5-10 minutes of setup time

## Installation Steps

### 1️⃣ Install Node.js (if not already installed)

**Windows:**
- Visit https://nodejs.org/
- Download LTS version (Recommended)
- Run installer and follow prompts
- Verify installation in Command Prompt:
```bash
node --version
npm --version
```

**Mac:**
```bash
# Using Homebrew
brew install node
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install nodejs npm

# CentOS
sudo yum install nodejs npm
```

### 2️⃣ Navigate to Project Directory

**Windows Command Prompt:**
```bash
cd Desktop\ev_vehicles
# or
cd c:\Users\YOUR_USERNAME\OneDrive\Desktop\ev_vehicles
```

**Mac/Linux Terminal:**
```bash
cd ~/Desktop/ev_vehicles
```

### 3️⃣ Install Dependencies

```bash
npm install
```

This will install:
- Express.js (web server)
- SQLite3 (database)
- JWT & bcryptjs (authentication & security)
- CORS (cross-origin support)
- dotenv (configuration)

**Installation takes 1-2 minutes**

### 4️⃣ Start the Server

**Option A - Windows Users (Easiest):**
Double-click `start.bat` file

**Option B - Command Line:**
```bash
npm start
```

**Option C - Development Mode (with auto-restart):**
```bash
npm run dev
```

### 5️⃣ Verify Server is Running

You should see:
```
✓ EV Charging Server running on http://localhost:3000
✓ Serving frontend from C:\Users\...\ev_vehicles
```

## Access the Application

### User Booking Interface
```
http://localhost:3000/index.html
```

### Admin Management Panel
```
http://localhost:3000/admin.html
```

## Create Admin User

### Method 1: Using Setup Script (Recommended)

**Windows:**
```bash
node setup-admin.js
```

**Mac/Linux:**
```bash
node setup-admin.js
```

Follow the prompts to create admin credentials.

### Method 2: Manual Database Edit

1. Install SQLite Browser: https://sqlitebrowser.org/
2. Open `ev_charging.db` file
3. Find your user in the `users` table
4. Change `role` column from "user" to "admin"
5. Save changes

### Method 3: Via Node REPL

```javascript
// In terminal, run node
node

// Then paste this:
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ev_charging.db');
db.run("UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com'", () => {
  console.log('Admin created!');
  db.close();
});
```

## First Time Usage

### 1. Create User Account

**On http://localhost:3000/index.html:**
- Click "Register"
- Enter email: `user@example.com`
- Enter password: `password123`
- Click "Register"
- Confirm login message appears

### 2. View Charging Stations

After login:
- Click "View Stations on Map"
- Allow location permission when prompted
- See the map load

### 3. Create Admin Account

Run setup script to create admin:
```bash
node setup-admin.js
```

Enter:
- Email: `admin@example.com`
- Password: `admin123`

### 4. Add Charging Stations (as Admin)

On **http://localhost:3000/admin.html:**
- Login with admin credentials
- Fill in station details:
  - Name: "Delhi Charging Hub"
  - Address: "New Delhi, India"
  - Mobile: "9876543210"
  - Slots: "10"
- Click "Save Bunk"

Add 2-3 stations for testing.

### 5. Test Booking (as User)

Back on **http://localhost:3000/index.html:**
- Click "Book Slots"
- Select a station you just created
- Click "Book Now"
- Choose date and time
- Confirm booking

## Verify Installation

Checklist to confirm everything works:

- [ ] Server starts without errors
- [ ] Can access http://localhost:3000/index.html
- [ ] Can access http://localhost:3000/admin.html
- [ ] Maps load on user page
- [ ] Can register user account
- [ ] Can login
- [ ] Can create admin account
- [ ] Can add charging station as admin
- [ ] Can book a slot as user

## Stop the Server

Press `Ctrl + C` in the terminal/command prompt where server is running.

## Restart the Server

```bash
npm start
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module 'express'" | Run `npm install` |
| "Port 3000 already in use" | Change PORT in `.env` to 3001 |
| "Database not found" | Restart server, it will auto-create |
| "Maps not loading" | Check internet, allow location permission |
| "Cannot connect to server" | Ensure server is running on http://localhost:3000 |
| "Admin login fails" | Make sure role is set to 'admin' in database |

## File Locations

```
Desktop/
└── ev_vehicles/
    ├── server.js              ← Backend server
    ├── script.js              ← Frontend code
    ├── index.html             ← User page
    ├── admin.html             ← Admin page
    ├── style.css              ← Styling
    ├── package.json           ← Dependencies
    ├── .env                   ← Configuration
    ├── start.bat              ← Windows startup
    ├── ev_charging.db         ← Database (auto-created)
    └── README_NEW.md          ← Full documentation
```

## Directory Path by OS

**Windows:**
```
C:\Users\YOUR_USERNAME\OneDrive\Desktop\ev_vehicles
```

**Mac:**
```
~/Desktop/ev_vehicles
```

**Linux:**
```
~/Desktop/ev_vehicles
```

## Testing Credentials

After setup:

**Test User:**
- Email: user@example.com
- Password: password123

**Test Admin:**
- Email: admin@example.com  
- Password: admin123

## Next Steps

1. ✅ Setup complete!
2. Create test users and bookings
3. Explore all features
4. Customize styling in `style.css`
5. Add more features as needed
6. Deploy to production (see README_NEW.md)

## Need Help?

1. Check README_NEW.md for detailed documentation
2. Check browser console for errors (F12)
3. Check terminal for server errors
4. Verify all files exist in project folder
5. Try restarting Node server

## Configuration

### Change Server Port

Edit `.env`:
```
PORT=3001
```

### Change JWT Secret (Important for Production)

Edit `.env`:
```
JWT_SECRET=your_secure_key_here
```

### Update API URL (if using different server)

Edit `script.js`:
```javascript
const API_URL = 'http://your-ip:3000/api';
```

## Clean Restart

If something goes wrong:

1. **Delete database:**
```bash
del ev_charging.db
```

2. **Reinstall dependencies:**
```bash
del /Q node_modules
npm install
```

3. **Restart server:**
```bash
npm start
```

## Production Deployment

For deploying to a live server:

1. Update `.env` with production settings
2. Use process manager (PM2, systemd)
3. Setup SSL certificate
4. Configure proper firewall rules
5. Enable CORS for your domain

See README_NEW.md for full deployment guide!

---

**Setup Status**: ✅ Ready to use!

**Support**: Check README_NEW.md for full documentation
