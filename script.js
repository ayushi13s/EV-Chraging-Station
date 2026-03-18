// ==================== CONFIGURATION ====================
const API_URL = 'http://localhost:3000/api';

// Authentication state
let currentUser = null;
let currentToken = null;

// Map and markers
let map = null;
let userLocation = null;
let mapInitialized = false;
let markers = [];
let selectedBookingBunk = null;

// ==================== DOM REFERENCES ====================

// User auth elements
const authSection = document.getElementById('auth-section');
const mainContent = document.getElementById('main-content');
const userEmailInput = document.getElementById('user-email');
const userPasswordInput = document.getElementById('user-password');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loggedInUserText = document.getElementById('logged-in-user');
const forgotPasswordLink = document.getElementById('forgot-password-link');

// Navigation elements
const viewMapBtn = document.getElementById('view-map-btn');
const bookSlotsBtn = document.getElementById('book-slots-btn');
const bookingHistoryBtn = document.getElementById('booking-history-btn');
const mapSection = document.getElementById('map-section');
const bookSlotsSection = document.getElementById('book-slots-section');
const bookingHistorySection = document.getElementById('booking-history-section');

// Map and lists
const mapDiv = document.getElementById('map');
const bunkListDiv = document.getElementById('bunk-list');
const bookingBunkList = document.getElementById('booking-bunk-list');
const bookingHistoryList = document.getElementById('booking-history-list');

// Modal elements
const bookingModal = document.getElementById('booking-modal');
const passwordResetModal = document.getElementById('password-reset-modal');
const modalCloseBtns = document.querySelectorAll('.close-btn');
const modalBunkDetails = document.getElementById('modal-bunk-details');
const bookingTimeInput = document.getElementById('booking-time');
const confirmBookingBtn = document.getElementById('confirm-booking-btn');
const resetEmailInput = document.getElementById('reset-email');
const sendResetBtn = document.getElementById('send-reset-btn');

// Admin elements
const adminAuthSection = document.getElementById('admin-auth');
const adminDashboard = document.getElementById('admin-dashboard');
const adminEmailInput = document.getElementById('admin-email');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminUserInfo = document.getElementById('admin-user-info');
const bunkNameInput = document.getElementById('bunk-name');
const bunkAddressInput = document.getElementById('bunk-address');
const bunkSlotsInput = document.getElementById('bunk-slots');
const bunkMobileInput = document.getElementById('bunk-mobile');
const saveBunkBtn = document.getElementById('save-bunk-btn');
const addBunkStatus = document.getElementById('add-bunk-status');
const allBunksList = document.getElementById('all-bunks-list');
const bunkSelect = document.getElementById('bunk-select');
const newSlotsInput = document.getElementById('new-slots');
const updateSlotsBtn = document.getElementById('update-slots-btn');
const slotUpdateStatus = document.getElementById('slot-update-status');

// ==================== UTILITY FUNCTIONS ====================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
}

function validateSlots(slots) {
    return !isNaN(slots) && slots > 0 && slots <= 100;
}

function haversine_distance(coords1, coords2) {
    const R = 6371;
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ==================== NOTIFICATIONS ====================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    
    if (type === 'success') {
        toast.style.backgroundColor = '#2ecc71';
    } else if (type === 'error') {
        toast.style.backgroundColor = '#e74c3c';
    } else {
        toast.style.backgroundColor = '#3498db';
    }
    
    toast.style.cssText += `position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 4px; color: white; z-index: 10000; animation: slideIn 0.3s ease-out;`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.showToast = showToast;

// ==================== API HELPER ====================

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (currentToken) {
        options.headers.Authorization = `Bearer ${currentToken}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API error');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTHENTICATION ====================

// User Registration
if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        const email = userEmailInput.value.trim();
        const password = userPasswordInput.value;

        if (!validateEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }
        if (!validatePassword(password)) {
            showToast('Password must be at least 6 characters long.', 'error');
            return;
        }

        try {
            const result = await apiCall('/auth/register', 'POST', { email, password });
            currentUser = { email, id: result.userId };
            currentToken = result.token;
            localStorage.setItem('token', currentToken);
            localStorage.setItem('userEmail', email);
            showToast('User registered and logged in!', 'success');
            updateAuthUI();
        } catch (error) {
            showToast(`Error: ${error.message}`, 'error');
        }
    });
}

// User Login
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = userEmailInput.value.trim();
        const password = userPasswordInput.value;

        if (!validateEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }
        if (!validatePassword(password)) {
            showToast('Password must be at least 6 characters long.', 'error');
            return;
        }

        try {
            const result = await apiCall('/auth/login', 'POST', { email, password });
            currentUser = { email, id: result.userId, role: result.role };
            currentToken = result.token;
            localStorage.setItem('token', currentToken);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', result.role);
            showToast('User logged in!', 'success');
            updateAuthUI();
        } catch (error) {
            showToast(`Error: ${error.message}`, 'error');
        }
    });
}

// User Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        currentToken = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        showToast('Logged out successfully.', 'success');
        updateAuthUI();
    });
}

// Forgot Password
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (passwordResetModal) passwordResetModal.style.display = 'block';
    });
}

if (sendResetBtn) {
    sendResetBtn.addEventListener('click', async () => {
        const email = resetEmailInput.value.trim();
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        try {
            await apiCall('/auth/forgot-password', 'POST', { email });
            showToast('Password reset email sent!', 'success');
            if (passwordResetModal) passwordResetModal.style.display = 'none';
            resetEmailInput.value = '';
        } catch (error) {
            showToast(`Error: ${error.message}`, 'error');
        }
    });
}

// Update UI based on authentication state
function updateAuthUI() {
    if (currentUser && currentToken) {
        if (authSection) authSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        if (loggedInUserText) loggedInUserText.textContent = `Logged in as: ${currentUser.email}`;
        
        if (currentUser.role === 'admin') {
            updateAdminUI();
        } else {
            getUserLocationAndRenderMap();
            fetchBookingHistory();
            setupNavigation();
        }
    } else {
        if (authSection) authSection.style.display = 'block';
        if (mainContent) mainContent.style.display = 'none';
        if (loggedInUserText) loggedInUserText.textContent = '';
        mapInitialized = false;
    }
}

// Check for saved token on page load
window.addEventListener('load', () => {
    const savedToken = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('userEmail');

    if (savedToken && savedEmail) {
        currentToken = savedToken;
        currentUser = { email: savedEmail, role: localStorage.getItem('userRole') };
        updateAuthUI();
    }
});

// ==================== MODALS ====================

// Close modals
if (modalCloseBtns) {
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
}

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// ==================== MAP & BUNKS ====================

function clearMarkers() {
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];
}

window.clearMarkers = clearMarkers;

function initMap() {
    if (!mapDiv || mapInitialized) return;
    
    if (typeof google === 'undefined') {
        mapDiv.innerHTML = '<div style="padding: 20px; color: red;">Google Maps API not loaded</div>';
        return;
    }

    map = new google.maps.Map(mapDiv, {
        zoom: 12,
        center: { lat: 28.7041, lng: 77.1025 },
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
    });
    
    mapInitialized = true;
    console.log('Map initialized');
}

window.initMap = initMap;

async function getUserLocationAndRenderMap() {
    if (mapInitialized) return;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                loadBunksOnMap();
            },
            () => {
                userLocation = { lat: 28.7041, lng: 77.1025 };
                loadBunksOnMap();
            }
        );
    } else {
        userLocation = { lat: 28.7041, lng: 77.1025 };
        loadBunksOnMap();
    }
}

async function loadBunksOnMap() {
    if (!mapDiv) return;

    try {
        initMap();
        const bunks = await apiCall('/bunks');

        clearMarkers();

        if (bunks.length === 0) {
            bunkListDiv.innerHTML = '<p>No charging stations available</p>';
            return;
        }

        bunks.forEach(bunk => {
            const marker = new google.maps.Marker({
                position: { lat: bunk.lat, lng: bunk.lng },
                map: map,
                title: bunk.name
            });

            const distance = haversine_distance(userLocation, { lat: bunk.lat, lng: bunk.lng });

            marker.addListener('click', () => {
                const infowindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px; max-width: 250px;">
                            <h4>${bunk.name}</h4>
                            <p><strong>Address:</strong> ${bunk.address}</p>
                            <p><strong>Distance:</strong> ${distance.toFixed(2)} km</p>
                            <p><strong>Available Slots:</strong> ${bunk.available_slots}/${bunk.total_slots}</p>
                            <button onclick="openBookingModal(${bunk.id}, '${bunk.name}')" style="background: #2ecc71; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                Book Now
                            </button>
                        </div>
                    `
                });
                infowindow.open(map, marker);
            });

            markers.push(marker);

            // Add to list
            if (bunkListDiv) {
                const div = document.createElement('div');
                div.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: #f9f9f9;';
                div.innerHTML = `
                    <h4>${bunk.name}</h4>
                    <p><strong>Address:</strong> ${bunk.address}</p>
                    <p><strong>Distance:</strong> ${distance.toFixed(2)} km</p>
                    <p><strong>Available Slots:</strong> ${bunk.available_slots}/${bunk.total_slots}</p>
                    <button onclick="openBookingModal(${bunk.id}, '${bunk.name}')" style="background: #2ecc71; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Book Slot
                    </button>
                `;
                bunkListDiv.appendChild(div);
            }
        });

        console.log(`Loaded ${bunks.length} bunks`);
    } catch (error) {
        console.error('Error loading bunks:', error);
        showToast('Failed to load bunks', 'error');
    }
}

// ==================== BOOKING ====================

window.openBookingModal = function(bunkId, bunkName) {
    selectedBookingBunk = { id: bunkId, name: bunkName };
    if (modalBunkDetails) {
        modalBunkDetails.textContent = `Bunk: ${bunkName}`;
    }
    if (bookingModal) bookingModal.style.display = 'block';
};

if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener('click', async () => {
        if (!selectedBookingBunk) {
            showToast('Please select a bunk first', 'error');
            return;
        }

        const bookingTime = bookingTimeInput.value;
        const bookingDate = document.getElementById('booking-date')?.value;

        if (!bookingTime || !bookingDate) {
            showToast('Please select time and date', 'error');
            return;
        }

        try {
            await apiCall('/bookings', 'POST', {
                bunk_id: selectedBookingBunk.id,
                booking_time: bookingTime,
                booking_date: bookingDate,
                duration_hours: 2
            });

            showToast('Booking confirmed!', 'success');
            if (bookingModal) bookingModal.style.display = 'none';
            bookingTimeInput.value = '';
            fetchBookingHistory();
            await loadBunksOnMap();
        } catch (error) {
            showToast(`Error: ${error.message}`, 'error');
        }
    });
}

async function fetchBookingHistory() {
    if (!currentToken) return;

    try {
        const bookings = await apiCall('/bookings');
        
        if (bookingHistoryList) {
            bookingHistoryList.innerHTML = '';
            
            if (bookings.length === 0) {
                bookingHistoryList.innerHTML = '<p>No bookings yet</p>';
                return;
            }

            bookings.forEach(booking => {
                const div = document.createElement('div');
                div.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: #f9f9f9;';
                div.innerHTML = `
                    <h4>${booking.name}</h4>
                    <p><strong>Address:</strong> ${booking.address}</p>
                    <p><strong>Date:</strong> ${booking.booking_date}</p>
                    <p><strong>Time:</strong> ${booking.booking_time}</p>
                    <p><strong>Status:</strong> <span style="color: ${booking.status === 'confirmed' ? '#2ecc71' : '#e74c3c'}">${booking.status}</span></p>
                    <button onclick="cancelBooking(${booking.id})" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        Cancel
                    </button>
                `;
                bookingHistoryList.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error fetching bookings:', error);
    }
}

window.cancelBooking = async function(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        await apiCall(`/bookings/${bookingId}`, 'DELETE');
        showToast('Booking cancelled successfully', 'success');
        fetchBookingHistory();
        await loadBunksOnMap();
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
};

async function loadBookingBunkList() {
    if (!bookingBunkList) return;

    try {
        const bunks = await apiCall('/bunks');
        bookingBunkList.innerHTML = '';

        bunks.forEach(bunk => {
            const div = document.createElement('div');
            div.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: #f9f9f9;';
            div.innerHTML = `
                <h4>${bunk.name}</h4>
                <p><strong>Address:</strong> ${bunk.address}</p>
                <p><strong>Available Slots:</strong> ${bunk.available_slots}/${bunk.total_slots}</p>
                <p><strong>Mobile:</strong> ${bunk.mobile}</p>
                <button onclick="openBookingModal(${bunk.id}, '${bunk.name}')" style="background: #2ecc71; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    Book Now
                </button>
            `;
            bookingBunkList.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading bunk list:', error);
    }
}

// ==================== NAVIGATION ====================

function setupNavigation() {
    if (viewMapBtn) {
        viewMapBtn.addEventListener('click', () => {
            showSection('map');
        });
    }

    if (bookSlotsBtn) {
        bookSlotsBtn.addEventListener('click', () => {
            showSection('book-slots');
        });
    }

    if (bookingHistoryBtn) {
        bookingHistoryBtn.addEventListener('click', () => {
            showSection('booking-history');
        });
    }
}

function showSection(sectionName) {
    const sections = [mapSection, bookSlotsSection, bookingHistorySection];
    sections.forEach(section => {
        if (section) section.style.display = 'none';
    });

    const buttons = [viewMapBtn, bookSlotsBtn, bookingHistoryBtn];
    buttons.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });

    switch(sectionName) {
        case 'map':
            if (mapSection) mapSection.style.display = 'block';
            if (viewMapBtn) viewMapBtn.classList.add('active');
            break;
        case 'book-slots':
            if (bookSlotsSection) bookSlotsSection.style.display = 'block';
            if (bookSlotsBtn) bookSlotsBtn.classList.add('active');
            loadBookingBunkList();
            break;
        case 'booking-history':
            if (bookingHistorySection) bookingHistorySection.style.display = 'block';
            if (bookingHistoryBtn) bookingHistoryBtn.classList.add('active');
            break;
    }
}

// ==================== ADMIN AUTHENTICATION ====================

if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', async () => {
        const email = adminEmailInput.value.trim();
        const password = adminPasswordInput.value;

        if (!validateEmail(email)) {
            showToast('Please enter a valid admin email.', 'error');
            return;
        }
        if (!validatePassword(password)) {
            showToast('Password must be at least 6 characters long.', 'error');
            return;
        }

        try {
            const result = await apiCall('/auth/login', 'POST', { email, password });

            if (result.role !== 'admin') {
                showToast('Error: You do not have admin privileges.', 'error');
                return;
            }

            currentUser = { email, id: result.userId, role: 'admin' };
            currentToken = result.token;
            localStorage.setItem('token', currentToken);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', 'admin');

            showToast('Admin logged in!', 'success');
            updateAdminUI();
        } catch (error) {
            showToast(`Error: ${error.message}`, 'error');
        }
    });
}

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        currentUser = null;
        currentToken = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        showToast('Logged out successfully.', 'success');
        updateAdminUI();
    });
}

function updateAdminUI() {
    if (currentUser && currentUser.role === 'admin' && currentToken) {
        if (adminAuthSection) adminAuthSection.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'block';
        if (adminUserInfo) adminUserInfo.textContent = `Logged in as Admin: ${currentUser.email}`;
        loadAllBunks();
        loadBunksForSlotUpdate();
    } else {
        if (adminAuthSection) adminAuthSection.style.display = 'block';
        if (adminDashboard) adminDashboard.style.display = 'none';
        if (adminUserInfo) adminUserInfo.textContent = '';
    }
}

// ==================== ADMIN BUNK MANAGEMENT ====================

if (saveBunkBtn) {
    saveBunkBtn.addEventListener('click', async () => {
        const bunkName = bunkNameInput.value.trim();
        const bunkAddress = bunkAddressInput.value.trim();
        const bunkSlots = parseInt(bunkSlotsInput.value);
        const bunkMobile = bunkMobileInput.value.trim();

        if (!bunkName || bunkName.length < 3) {
            showToast('Bunk name must be at least 3 characters long.', 'error');
            return;
        }
        if (!bunkAddress || bunkAddress.length < 5) {
            showToast('Please enter a valid address.', 'error');
            return;
        }
        if (!validateSlots(bunkSlots)) {
            showToast('Please enter a valid number of slots (1-100).', 'error');
            return;
        }
        if (!validateMobile(bunkMobile)) {
            showToast('Please enter a valid 10-digit mobile number.', 'error');
            return;
        }

        try {
            if (addBunkStatus) addBunkStatus.textContent = 'Getting coordinates...';

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(bunkAddress)}&key=AIzaSyA7Sf7dv-dWt3KN9V2_OOVA3neNTjBQ6WI`
            );
            const data = await response.json();

            if (data.results.length === 0) {
                showToast('Could not find coordinates for the given address.', 'error');
                if (addBunkStatus) addBunkStatus.textContent = '';
                return;
            }

            const { lat, lng } = data.results[0].geometry.location;

            await apiCall('/bunks', 'POST', {
                name: bunkName,
                address: bunkAddress,
                mobile: bunkMobile,
                total_slots: bunkSlots,
                lat,
                lng
            });

            showToast('Bunk location saved successfully!', 'success');
            if (addBunkStatus) addBunkStatus.textContent = '';
            bunkNameInput.value = '';
            bunkAddressInput.value = '';
            bunkSlotsInput.value = '';
            bunkMobileInput.value = '';
            loadAllBunks();
        } catch (error) {
            showToast(`Error saving bunk: ${error.message}`, 'error');
            if (addBunkStatus) addBunkStatus.textContent = '';
        }
    });
}

async function loadAllBunks() {
    if (!allBunksList) return;

    try {
        const bunks = await apiCall('/bunks');
        allBunksList.innerHTML = '';

        bunks.forEach(bunk => {
            const div = document.createElement('div');
            div.classList.add('bunk-item');
            div.innerHTML = `
                <div class="bunk-details">
                    <h4>${bunk.name}</h4>
                    <p><strong>Address:</strong> ${bunk.address}</p>
                    <p><strong>Slots:</strong> ${bunk.total_slots}</p>
                    <p><strong>Available:</strong> ${bunk.available_slots}</p>
                </div>
                <div class="bunk-actions">
                    <button class="danger-btn delete-btn" onclick="deleteBunk(${bunk.id})">Delete</button>
                </div>
            `;
            allBunksList.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading bunks:', error);
    }
}

window.deleteBunk = async function(bunkId) {
    if (!confirm('Are you sure you want to delete this bunk?')) return;

    try {
        await apiCall(`/bunks/${bunkId}`, 'DELETE');
        showToast('Bunk deleted successfully', 'success');
        loadAllBunks();
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
};

async function loadBunksForSlotUpdate() {
    if (!bunkSelect) return;

    try {
        const bunks = await apiCall('/bunks');
        bunkSelect.innerHTML = '<option value="">-- Select a Bunk --</option>';

        bunks.forEach(bunk => {
            const option = document.createElement('option');
            option.value = bunk.id;
            option.textContent = `${bunk.name} (${bunk.available_slots}/${bunk.total_slots} slots)`;
            bunkSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading bunks:', error);
    }
}

if (updateSlotsBtn) {
    updateSlotsBtn.addEventListener('click', async () => {
        const bunkId = bunkSelect.value;
        const newSlots = parseInt(newSlotsInput.value);

        if (!bunkId) {
            showToast('Please select a bunk.', 'error');
            return;
        }
        if (!validateSlots(newSlots)) {
            showToast('Please enter a valid number of slots (1-100).', 'error');
            return;
        }

        try {
            await apiCall(`/bunks/${bunkId}/slots`, 'PUT', {
                available_slots: newSlots
            });
            showToast('Slots updated successfully', 'success');
            newSlotsInput.value = '';
            loadBunksForSlotUpdate();
        } catch (error) {
            showToast(`Error: ${error.message}`, 'error');
        }
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('Script loaded successfully');
