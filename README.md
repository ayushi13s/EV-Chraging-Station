# ⚡ EV Charging Station Booking System

A smart and efficient **EV Charging Management System** that allows users to find charging stations and book slots seamlessly. The system includes a **User Interface**, **Admin Panel**, and a **Backend Server** to manage operations.

---

## 🌐 Live Flow of Application

```text
User Login → View Stations → Check Availability → Book Slot → Confirmation
                             ↓
                        Admin Control Panel
                             ↓
              Manage Stations & Monitor Bookings
```

---

## 🎯 Key Features

### 👤 User Side

* 🔐 Secure Login System
* 📍 View EV Charging Stations
* ⚡ Check Slot Availability
* 📅 Book Charging Slots
* ❌ Cancel Bookings
* 📊 Track Booking Details

---

### 🛠️ Admin Panel

* ➕ Add Charging Stations
* ✏️ Edit Station Details
* ❌ Delete Stations
* ⚙️ Manage Charging Slots
* 👀 Monitor User Bookings

---

### 🔙 Backend System

* 🔒 Authentication & Authorization
* 📦 Database Management (SQLite)
* 🔗 API Handling via Express.js
* 🔄 Real-time Slot Updates

---

## 🧑‍💻 Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** SQLite (`ev_charging.db`)

---

## 📂 Project Structure

```bash
EV_VEHICLES/
│
├── .vscode/                # VS Code settings
├── node_modules/          # Dependencies
│
├── .env                   # Environment variables
├── .gitignore             # Git ignored files
│
├── index.html             # User Panel
├── admin.html             # Admin Panel
├── style.css              # Styling
├── script.js              # Frontend logic
│
├── server.js              # Backend server
├── setup-admin.js         # Admin setup script
│
├── ev_charging.db         # SQLite database
│
├── package.json           # Project metadata
├── README.md              # Documentation
├── QUICK_START.txt        # Quick guide
├── SETUP_GUIDE.md         # Setup instructions
└── start.bat              # Run script (Windows)
```

---

## ⚙️ Setup Instructions

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Run the Server

```bash
node server.js
```

### 3️⃣ Open in Browser

* User Panel → `index.html`
* Admin Panel → `admin.html`

---

## 🔐 Environment Variables (.env)

```env
PORT=5000
```

---

## 💡 How It Works

* User logs in → selects charging station
* Available slots are fetched from database
* Booking is stored in SQLite database
* Admin can manage all stations and bookings

---

## 🔥 Unique Highlights

* ⚡ Lightweight (No heavy frameworks)
* 🧠 Real-time slot logic
* 🛠️ Separate Admin + User system
* 💾 Local database (SQLite for simplicity)

---

## 🚀 Future Improvements

* 📍 Google Maps integration
* 💳 Payment gateway (Razorpay/Stripe)
* 🔔 Email/SMS notifications
* 📱 Fully responsive UI
* 🤖 AI-based station recommendation

---

## 👩‍💻 Author

**Ayushi Sonkhiya**
💡 Passionate about Full Stack & AI Development

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
