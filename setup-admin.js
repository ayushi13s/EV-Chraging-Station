#!/usr/bin/env node

/**
 * Admin Setup Helper
 * This script creates an admin user in the database
 * Usage: node setup-admin.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(q) {
    return new Promise(resolve => rl.question(q, resolve));
}

async function main() {
    console.log('\n========================================');
    console.log('admin Setup Helper');
    console.log('========================================\n');

    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 6 chars): ');

    if (!email || email.trim().length === 0) {
        console.error('❌ Error: Email cannot be empty');
        rl.close();
        return;
    }

    if (password.length < 6) {
        console.error('❌ Error: Password must be at least 6 characters');
        rl.close();
        return;
    }

    const db = new sqlite3.Database('./ev_charging.db', (err) => {
        if (err) {
            console.error('❌ Error: Cannot connect to database');
            console.error(err.message);
            rl.close();
            return;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        db.run(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, 'admin'],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        console.error('❌ Error: This email already exists');
                    } else {
                        console.error('❌ Error:', err.message);
                    }
                    db.close();
                    rl.close();
                    return;
                }

                console.log('\n✓ Admin user created successfully!\n');
                console.log('Email:', email);
                console.log('Password:', password);
                console.log('\nYou can now login to the admin panel at:');
                console.log('http://localhost:3000/admin.html\n');

                db.close();
                rl.close();
            }
        );
    });
}

main();
