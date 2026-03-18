const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./ev_charging.db', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to SQLite database');
});

// Initialize database with tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Bunks (charging stations) table
        db.run(`
            CREATE TABLE IF NOT EXISTS bunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                mobile TEXT NOT NULL,
                total_slots INTEGER NOT NULL,
                available_slots INTEGER NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Bookings table
        db.run(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                bunk_id INTEGER NOT NULL,
                booking_time TEXT NOT NULL,
                booking_date DATE NOT NULL,
                status TEXT DEFAULT 'confirmed',
                duration_hours INTEGER DEFAULT 2,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (bunk_id) REFERENCES bunks(id)
            )
        `);

        // Password reset tokens table
        db.run(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        console.log('Database tables initialized');
    });
}

// Initialize database on startup
initializeDatabase();

// Helper function to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Helper function to check admin role
const verifyAdmin = (req, res, next) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, row) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                reject(err);
            } else if (row && row.role === 'admin') {
                next();
                resolve();
            } else {
                res.status(403).json({ error: 'Admin access required' });
                reject(new Error('Not admin'));
            }
        });
    });
};

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register endpoint
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
        return res.status(400).json({ error: 'Valid email and password (min 6 chars) required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, 'user'],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already registered' });
                }
                return res.status(500).json({ error: 'Registration failed' });
            }

            const token = jwt.sign({ userId: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ 
                userId: this.lastID,
                email, 
                token,
                message: 'User registered successfully'
            });
        }
    );
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    db.get('SELECT id, email, password, role FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Login failed' });
        }

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            userId: user.id,
            email: user.email,
            role: user.role,
            token,
            message: 'Login successful'
        });
    });
});

// Password reset request
app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err || !user) {
            // Always return success for security
            return res.json({ message: 'If email exists, reset link sent' });
        }

        // In a real app, send email. For now, just generate token
        const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        const expiresAt = new Date(Date.now() + 3600000).toISOString();

        db.run(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, resetToken, expiresAt],
            (err) => {
                if (err) console.error('Error storing reset token:', err);
                res.json({ message: 'If email exists, reset link sent' });
            }
        );
    });
});

// ==================== BUNK (CHARGING STATION) ENDPOINTS ====================

// Get all bunks
app.get('/api/bunks', (req, res) => {
    db.all('SELECT * FROM bunks ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch bunks' });
        }
        res.json(rows || []);
    });
});

// Get specific bunk
app.get('/api/bunks/:id', (req, res) => {
    db.get('SELECT * FROM bunks WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch bunk' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Bunk not found' });
        }
        res.json(row);
    });
});

// Create bunk (admin only)
app.post('/api/bunks', verifyToken, verifyAdmin, (req, res) => {
    const { name, address, mobile, total_slots, lat, lng } = req.body;

    if (!name || !address || !mobile || !total_slots || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'All fields required' });
    }

    db.run(
        'INSERT INTO bunks (name, address, mobile, total_slots, available_slots, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, address, mobile, total_slots, total_slots, lat, lng],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create bunk' });
            }
            res.json({
                id: this.lastID,
                name,
                address,
                mobile,
                total_slots,
                available_slots: total_slots,
                lat,
                lng
            });
        }
    );
});

// Update bunk (admin only)
app.put('/api/bunks/:id', verifyToken, verifyAdmin, (req, res) => {
    const { name, address, mobile, total_slots } = req.body;

    db.get('SELECT * FROM bunks WHERE id = ?', [req.params.id], (err, bunk) => {
        if (err || !bunk) {
            return res.status(404).json({ error: 'Bunk not found' });
        }

        const newName = name || bunk.name;
        const newAddress = address || bunk.address;
        const newMobile = mobile || bunk.mobile;
        const newTotal = total_slots !== undefined ? total_slots : bunk.total_slots;

        db.run(
            'UPDATE bunks SET name = ?, address = ?, mobile = ?, total_slots = ? WHERE id = ?',
            [newName, newAddress, newMobile, newTotal, req.params.id],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update bunk' });
                }
                res.json({ message: 'Bunk updated successfully' });
            }
        );
    });
});

// Delete bunk (admin only)
app.delete('/api/bunks/:id', verifyToken, verifyAdmin, (req, res) => {
    db.run('DELETE FROM bunks WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete bunk' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Bunk not found' });
        }
        res.json({ message: 'Bunk deleted successfully' });
    });
});

// Update available slots
app.put('/api/bunks/:id/slots', verifyToken, verifyAdmin, (req, res) => {
    const { available_slots } = req.body;

    if (available_slots === undefined) {
        return res.status(400).json({ error: 'Available slots required' });
    }

    db.run(
        'UPDATE bunks SET available_slots = ? WHERE id = ?',
        [available_slots, req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update slots' });
            }
            res.json({ message: 'Slots updated successfully' });
        }
    );
});

// ==================== BOOKING ENDPOINTS ====================

// Create booking
app.post('/api/bookings', verifyToken, (req, res) => {
    const { bunk_id, booking_time, booking_date, duration_hours } = req.body;

    if (!bunk_id || !booking_time || !booking_date) {
        return res.status(400).json({ error: 'Bunk, time, and date required' });
    }

    // Check if slot is already booked
    db.get(
        'SELECT * FROM bookings WHERE bunk_id = ? AND booking_date = ? AND booking_time = ? AND status = ?',
        [bunk_id, booking_date, booking_time, 'confirmed'],
        (err, existingBooking) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (existingBooking) {
                return res.status(400).json({ error: 'This slot is already booked' });
            }

            // Get bunk info
            db.get('SELECT * FROM bunks WHERE id = ?', [bunk_id], (err, bunk) => {
                if (err || !bunk) {
                    return res.status(404).json({ error: 'Bunk not found' });
                }

                if (bunk.available_slots <= 0) {
                    return res.status(400).json({ error: 'No available slots' });
                }

                // Create booking
                db.run(
                    'INSERT INTO bookings (user_id, bunk_id, booking_time, booking_date, duration_hours) VALUES (?, ?, ?, ?, ?)',
                    [req.userId, bunk_id, booking_time, booking_date, duration_hours || 2],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to create booking' });
                        }

                        // Decrease available slots
                        db.run(
                            'UPDATE bunks SET available_slots = available_slots - 1 WHERE id = ?',
                            [bunk_id],
                            (err) => {
                                if (err) console.error('Error updating slots:', err);
                            }
                        );

                        res.json({
                            id: this.lastID,
                            user_id: req.userId,
                            bunk_id,
                            booking_time,
                            booking_date,
                            duration_hours: duration_hours || 2,
                            status: 'confirmed'
                        });
                    }
                );
            });
        }
    );
});

// Get user bookings
app.get('/api/bookings', verifyToken, (req, res) => {
    db.all(
        `SELECT b.*, bn.name, bn.address, bn.mobile 
         FROM bookings b 
         JOIN bunks bn ON b.bunk_id = bn.id 
         WHERE b.user_id = ? 
         ORDER BY b.booking_date DESC, b.booking_time DESC`,
        [req.userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch bookings' });
            }
            res.json(rows || []);
        }
    );
});

// Cancel booking
app.delete('/api/bookings/:id', verifyToken, (req, res) => {
    db.get('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, req.userId], (err, booking) => {
        if (err || !booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        db.run('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', req.params.id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to cancel booking' });
            }

            // Increase available slots
            db.run(
                'UPDATE bunks SET available_slots = available_slots + 1 WHERE id = ?',
                [booking.bunk_id],
                (err) => {
                    if (err) console.error('Error updating slots:', err);
                }
            );

            res.json({ message: 'Booking cancelled successfully' });
        });
    });
});

// Get all bookings (admin)
app.get('/api/admin/bookings', verifyToken, verifyAdmin, (req, res) => {
    db.all(
        `SELECT b.*, u.email, bn.name, bn.address 
         FROM bookings b 
         JOIN users u ON b.user_id = u.id 
         JOIN bunks bn ON b.bunk_id = bn.id 
         ORDER BY b.booking_date DESC, b.booking_time DESC`,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch bookings' });
            }
            res.json(rows || []);
        }
    );
});

// Get bunk availability
app.get('/api/bunks/:id/availability/:date', (req, res) => {
    const { id, date } = req.params;

    db.all(
        'SELECT booking_time FROM bookings WHERE bunk_id = ? AND booking_date = ? AND status = ?',
        [id, date, 'confirmed'],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch availability' });
            }

            const bookedTimes = (rows || []).map(r => r.booking_time);
            res.json({ bookedTimes });
        }
    );
});

// ==================== STATS ENDPOINTS (ADMIN) ====================

// Get dashboard stats
app.get('/api/admin/stats', verifyToken, verifyAdmin, (req, res) => {
    Promise.all([
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM bunks', [], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['user'], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM bookings WHERE status = ?', ['confirmed'], (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        }),
        new Promise((resolve, reject) => {
            db.get('SELECT SUM(available_slots) as total FROM bunks', [], (err, row) => {
                if (err) reject(err);
                else resolve(row.total || 0);
            });
        })
    ]).then(([bunks, users, bookings, availableSlots]) => {
        res.json({
            totalBunks: bunks,
            totalUsers: users,
            totalBookings: bookings,
            totalAvailableSlots: availableSlots
        });
    }).catch(err => {
        res.status(500).json({ error: 'Failed to fetch stats' });
    });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ EV Charging Server running on http://localhost:${PORT}`);
    console.log(`✓ Serving frontend from ${__dirname}`);
});
