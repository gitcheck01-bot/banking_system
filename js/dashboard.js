// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Load transactions
    loadTransactions();

    // Setup navigation
    setupNavigation();

    // Setup mobile menu
    setupMobileMenu();

    // Load initial section
    showSection('overview');
}

function loadTransactions() {
    const recentList = document.getElementById('recentTransactionsList');
    const tableBody = document.getElementById('transactionsTableBody');

    if (recentList) {
        recentList.innerHTML = '';
        // Recent transactions will be loaded from PHP
    }

    if (tableBody) {
        tableBody.innerHTML = '';
        // All transactions will be loaded from PHP
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);

                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');

                // Close mobile menu
                document.querySelector('.sidebar').classList.remove('active');
            }
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            'overview': 'Dashboard Overview',
            'accounts': 'My Accounts',
            'transactions': 'Transaction History',
            'transfer': 'Transfer Money',
            'cards': 'My Cards',
            'settings': 'Account Settings'
        };
        pageTitle.textContent = titles[sectionName] || 'Dashboard';
    }
}

function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Global functions for navigation
window.showSection = showSection;

// Logout function
function logout() {
    if(confirm('Are you sure you want to logout?')) {
        window.location.href = '../php/logout.php';
    }
}

// Filter transactions by type
function filterTransactions(type) {
    const rows = document.querySelectorAll('#transactionsTableBody .table-row[data-type]');
    
    rows.forEach(row => {
        const rowType = row.getAttribute('data-type');
        
        if (type === 'all' || 
            (type === 'income' && rowType === 'income') ||
            (type === 'expense' && rowType === 'expense') ||
            (type === 'transfer' && (rowType === 'transfer_sent' || rowType === 'transfer_received'))) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}