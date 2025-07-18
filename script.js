// Global Variables
const PASSWORD = "varshade1122";
let isLoggedIn = false;

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const themeToggle = document.getElementById('themeToggle');
const currentTimeElement = document.getElementById('currentTime');
const batteryLevelElement = document.getElementById('batteryLevel');
const batteryStatusElement = document.getElementById('batteryStatus');
const chargingStatusElement = document.getElementById('chargingStatus');
const requestForm = document.getElementById('requestForm');
const notification = document.getElementById('notification');
const loginForm = document.getElementById('loginForm');
const dashboardContent = document.getElementById('dashboardContent');
const loginBtn = document.getElementById('loginBtn');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const requestsContainer = document.getElementById('requestsContainer');
const totalRequestsElement = document.getElementById('totalRequests');
const todayRequestsElement = document.getElementById('todayRequests');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);
    
    // Initialize sidebar
    initSidebar();
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Update time every second
    updateTime();
    setInterval(updateTime, 1000);
    
    // Check battery status if supported
    if ('getBattery' in navigator) {
        initBatteryStatus();
    } else {
        batteryStatusElement.style.display = 'none';
    }
    
    // Initialize form submission
    if (requestForm) {
        initRequestForm();
    }
    
    // Initialize owner dashboard
    if (window.location.pathname.includes('owner.html')) {
        initOwnerDashboard();
    }
});

// Sidebar Functions
function initSidebar() {
    if (menuToggle && sidebar && closeBtn) {
        menuToggle.addEventListener('click', toggleSidebar);
        closeBtn.addEventListener('click', toggleSidebar);
    }
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
}

// Theme Functions
function initThemeToggle() {
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Time Functions
function updateTime() {
    if (currentTimeElement) {
        const now = new Date();
        const options = { 
            timeZone: 'Asia/Jakarta',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false
        };
        const timeString = now.toLocaleTimeString('id-ID', options);
        currentTimeElement.textContent = timeString + ' WIB';
    }
}

// Battery Functions
async function initBatteryStatus() {
    try {
        const battery = await navigator.getBattery();
        updateBatteryStatus(battery);
        
        battery.addEventListener('levelchange', () => updateBatteryStatus(battery));
        battery.addEventListener('chargingchange', () => updateBatteryStatus(battery));
    } catch (error) {
        console.error('Battery API not supported:', error);
        batteryStatusElement.style.display = 'none';
    }
}

function updateBatteryStatus(battery) {
    const level = Math.round(battery.level * 100);
    batteryLevelElement.textContent = level;
    
    if (battery.charging) {
        document.body.classList.add('charging');
    } else {
        document.body.classList.remove('charging');
    }
    
    // Update battery icon based on level
    let batteryIcon = 'fa-battery-empty';
    if (level > 90) batteryIcon = 'fa-battery-full';
    else if (level > 70) batteryIcon = 'fa-battery-three-quarters';
    else if (level > 40) batteryIcon = 'fa-battery-half';
    else if (level > 20) batteryIcon = 'fa-battery-quarter';
    
    batteryStatusElement.innerHTML = `<i class="fas ${batteryIcon}"></i> ${level}%`;
}

// Form Submission Functions
function initRequestForm() {
    requestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const requestText = document.getElementById('request').value.trim();
        
        if (!name || !requestText) {
            showNotification('Mohon isi semua field yang diperlukan', false);
            return;
        }
        
        const requestData = {
            name,
            request: requestText,
            timestamp: new Date().toISOString(),
            battery: batteryLevelElement ? batteryLevelElement.textContent : 'N/A',
            charging: document.body.classList.contains('charging')
        };
        
        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (response.ok) {
                showNotification('Terima kasih! Request kamu sudah dikirim.', true);
                requestForm.reset();
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            showNotification('Maaf, terjadi kesalahan saat mengirim request. Silakan coba lagi.', false);
        }
    });
}

function showNotification(message, isSuccess) {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(isSuccess ? 'success' : 'error', 'show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Owner Dashboard Functions
function initOwnerDashboard() {
    // Check if user is already logged in
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (loggedIn) {
        showDashboard();
    } else {
        showLoginForm();
    }
    
    // Initialize login button
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Initialize logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Initialize search functionality
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', searchRequests);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchRequests();
            }
        });
    }
}

function showLoginForm() {
    if (loginForm) loginForm.style.display = 'block';
    if (dashboardContent) dashboardContent.style.display = 'none';
}

function showDashboard() {
    if (loginForm) loginForm.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
    fetchRequests();
}

function handleLogin() {
    const password = passwordInput.value.trim();
    
    if (password === PASSWORD) {
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        loginError.textContent = '';
        showDashboard();
    } else {
        loginError.textContent = 'Password salah. Silakan coba lagi.';
    }
}

function handleLogout() {
    isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    showLoginForm();
    passwordInput.value = '';
}

async function fetchRequests() {
    try {
        const response = await fetch('/api/get');
        const requests = await response.json();
        
        displayRequests(requests);
        updateStats(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
    }
}

function displayRequests(requests) {
    if (!requestsContainer) return;
    
    // Sort requests by timestamp (newest first)
    const sortedRequests = [...requests].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    requestsContainer.innerHTML = '';
    
    if (sortedRequests.length === 0) {
        requestsContainer.innerHTML = '<p class="no-requests">Tidak ada request yang ditemukan.</p>';
        return;
    }
    
    sortedRequests.forEach(request => {
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        
        const date = new Date(request.timestamp);
        const options = { 
            timeZone: 'Asia/Jakarta',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        };
        const formattedDate = date.toLocaleDateString('id-ID', options);
        
        requestCard.innerHTML = `
            <h3>🧑 Request dari: ${request.name}</h3>
            <p>📝 Isi: ${request.request}</p>
            <p>🔋 Baterai: ${request.battery} ${request.charging ? '(Sedang diisi)' : ''}</p>
            <p class="timestamp">🕒 Waktu: ${formattedDate} WIB</p>
        `;
        
        requestsContainer.appendChild(requestCard);
    });
}

function updateStats(requests) {
    if (!totalRequestsElement || !todayRequestsElement) return;
    
    const today = new Date().toLocaleDateString('id-ID');
    const todayRequests = requests.filter(request => {
        const requestDate = new Date(request.timestamp).toLocaleDateString('id-ID');
        return requestDate === today;
    });
    
    totalRequestsElement.textContent = requests.length;
    todayRequestsElement.textContent = todayRequests.length;
}

function searchRequests() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        fetchRequests();
        return;
    }
    
    fetch('/api/get')
        .then(response => response.json())
        .then(requests => {
            const filteredRequests = requests.filter(request => 
                request.name.toLowerCase().includes(searchTerm) || 
                request.request.toLowerCase().includes(searchTerm)
            );
            
            displayRequests(filteredRequests);
        })
        .catch(error => {
            console.error('Error searching requests:', error);
        });
}