// Dashboard JavaScript
let currentUser = {
    id: '12345',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    user_id: '12345'
};

let userAccounts = [
    {
        id: '1',
        account_type: 'checking',
        account_number: '****1234',
        balance: '84.00'
    },
    {
        id: '2',
        account_type: 'savings',
        account_number: '****5678',
        balance: '4000.00'
    }
];

let userTransactions = [
    { id: '1', date: '2024-10-14', description: 'Salary Deposit', category: 'Income', amount: 3500, type: 'income', status: 'completed' },
    { id: '2', date: '2024-10-13', description: 'Grocery Store', category: 'Shopping', amount: -125.50, type: 'expense', status: 'completed' },
    { id: '3', date: '2024-10-12', description: 'Electric Bill', category: 'Utilities', amount: -89.99, type: 'expense', status: 'completed' },
    { id: '4', date: '2024-10-11', description: 'Transfer to Savings', category: 'Transfer', amount: -500, type: 'transfer', status: 'completed' },
    { id: '5', date: '2024-10-10', description: 'Online Purchase', category: 'Shopping', amount: -75.25, type: 'expense', status: 'completed' },
    { id: '6', date: '2024-10-09', description: 'Freelance Payment', category: 'Income', amount: 850, type: 'income', status: 'completed' },
    { id: '7', date: '2024-10-08', description: 'Restaurant', category: 'Food', amount: -45.80, type: 'expense', status: 'completed' },
    { id: '8', date: '2024-10-07', description: 'Gas Station', category: 'Transportation', amount: -60.00, type: 'expense', status: 'completed' }
];

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Update user information
    updateUserInfo();

    // Update account balances
    updateAccountBalances();

    // Load transactions
    loadTransactions();

    // Setup navigation
    setupNavigation();

    // Setup forms
    setupTransferForm();

    // Setup mobile menu
    setupMobileMenu();

    // Load initial section
    showSection('overview');
}

function updateUserInfo() {
    const userName = document.getElementById('userName');
    const userId = document.getElementById('userId');

    if (userName && currentUser) {
        userName.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    }

    if (userId && currentUser) {
        userId.textContent = `ID: #${currentUser.user_id}`;
    }
}

function updateAccountBalances() {
    const checkingAccount = userAccounts.find(acc => acc.account_type === 'checking');
    const savingsAccount = userAccounts.find(acc => acc.account_type === 'savings');

    const checkingBalance = checkingAccount ? parseFloat(checkingAccount.balance) : 0;
    const savingsBalance = savingsAccount ? parseFloat(savingsAccount.balance) : 0;
    const totalBalance = checkingBalance + savingsBalance;

    // Calculate income and expenses
    const income = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = Math.abs(userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0));

    // Update summary cards
    updateSummaryCard('totalBalance', totalBalance);

    // Update account cards
    if (checkingAccount) {
        updateAccountCard('checking', checkingBalance, checkingAccount.account_number);
    }
    if (savingsAccount) {
        updateAccountCard('savings', savingsBalance, savingsAccount.account_number);
    }

    // Update transfer form dropdowns
    updateTransferFormAccounts();
}

function updateSummaryCard(type, amount) {
    const card = document.getElementById(type);
    if (card) {
        card.textContent = `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
}

function updateAccountCard(type, balance, number) {
    const balanceElement = document.querySelector(`.account-card.${type} .balance-amount`);
    const numberElement = document.querySelector(`.account-card.${type} .account-number`);

    if (balanceElement) {
        balanceElement.textContent = `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    if (numberElement) {
        numberElement.textContent = number;
    }
}

function updateTransferFormAccounts() {
    const fromAccountSelect = document.getElementById('fromAccount');
    if (!fromAccountSelect) return;

    fromAccountSelect.innerHTML = '';

    userAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        const accountType = account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1);
        option.textContent = `${accountType} Account (${account.account_number}) - $${parseFloat(account.balance).toFixed(2)}`;
        fromAccountSelect.appendChild(option);
    });
}

function loadTransactions() {
    const recentList = document.getElementById('recentTransactionsList');
    const tableBody = document.getElementById('transactionsTableBody');

    if (recentList) {
        recentList.innerHTML = '';
        const recentTransactions = userTransactions.slice(0, 5);
        recentTransactions.forEach(transaction => {
            recentList.appendChild(createTransactionItem(transaction));
        });
    }

    if (tableBody) {
        tableBody.innerHTML = '';
        userTransactions.forEach(transaction => {
            tableBody.appendChild(createTransactionRow(transaction));
        });
    }
}

function createTransactionItem(transaction) {
    const item = document.createElement('div');
    item.className = 'transaction-item';

    const iconClass = transaction.type === 'income' ? 'fa-arrow-down' :
                     transaction.type === 'expense' ? 'fa-arrow-up' : 'fa-exchange-alt';

    const amount = parseFloat(transaction.amount);
    const amountClass = amount > 0 ? 'positive' : 'negative';
    const amountText = amount > 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`;

    item.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon ${transaction.type}">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="transaction-details">
                <h4>${transaction.description}</h4>
                <p>${transaction.date} • ${transaction.category}</p>
            </div>
        </div>
        <div class="transaction-amount ${amountClass}">
            ${amountText}
        </div>
    `;

    return item;
}

function createTransactionRow(transaction) {
    const row = document.createElement('div');
    row.className = 'table-row';

    const amount = parseFloat(transaction.amount);
    const amountClass = amount > 0 ? 'positive' : 'negative';
    const amountText = amount > 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`;

    const statusClass = transaction.status === 'completed' ? 'success' : 'warning';
    const statusText = transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1);

    row.innerHTML = `
        <div class="table-cell">${transaction.date}</div>
        <div class="table-cell">${transaction.description}</div>
        <div class="table-cell">${transaction.category}</div>
        <div class="table-cell">
            <span class="transaction-amount ${amountClass}">${amountText}</span>
        </div>
        <div class="table-cell">
            <span class="status ${statusClass}">${statusText}</span>
        </div>
    `;

    return row;
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

function setupTransferForm() {
    const transferForm = document.getElementById('transferForm');
    const transferAmount = document.getElementById('transferAmount');
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryTotal = document.getElementById('summaryTotal');

    if (transferAmount) {
        transferAmount.addEventListener('input', function() {
            const amount = parseFloat(this.value) || 0;
            if (summaryAmount) summaryAmount.textContent = `$${amount.toFixed(2)}`;
            if (summaryTotal) summaryTotal.textContent = `$${amount.toFixed(2)}`;
        });
    }

    if (transferForm) {
        transferForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const fromAccountId = document.getElementById('fromAccount').value;
            const toAccount = document.getElementById('toAccount').value;
            const amount = parseFloat(document.getElementById('transferAmount').value);
            const description = document.getElementById('transferDescription').value;

            if (!amount || amount <= 0) {
                showMessage('Please enter a valid amount', 'error');
                return;
            }

            const fromAccount = userAccounts.find(acc => acc.id === fromAccountId);
            const fromBalance = fromAccount ? parseFloat(fromAccount.balance) : 0;

            if (amount > fromBalance) {
                showMessage('Insufficient funds', 'error');
                return;
            }

            // Process transfer
            await processTransfer(fromAccount, toAccount, amount, description);
        });
    }
}

async function processTransfer(fromAccount, toAccount, amount, description) {
    const submitBtn = document.querySelector('#transferForm button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Update account balance in memory
        const newBalance = parseFloat(fromAccount.balance) - amount;
        fromAccount.balance = newBalance.toString();

        // Create transaction record in memory
        const newTransaction = {
            id: Date.now().toString(),
            account_id: fromAccount.id,
            user_id: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            description: description || `Transfer to ${toAccount}`,
            category: 'Transfer',
            amount: -amount,
            type: 'transfer',
            status: 'completed'
        };
        userTransactions.unshift(newTransaction);

        // Refresh dashboard
        updateAccountBalances();
        loadTransactions();

        // Reset form
        document.getElementById('transferForm').reset();
        document.getElementById('summaryAmount').textContent = '$0.00';
        document.getElementById('summaryTotal').textContent = '$0.00';

        showMessage('Transfer completed successfully!', 'success');
    } catch (error) {
        console.error('Transfer error:', error);
        showMessage('Transfer failed. Please try again.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
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

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.dashboard-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `dashboard-message ${type}`;
    messageDiv.textContent = message;

    // Add styles
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;

    document.body.appendChild(messageDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Global functions for navigation
window.showSection = showSection;

window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/index.html';
    }
};

// Add status styles
const style = document.createElement('style');
style.textContent = `
    .status {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .status.success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .status.warning {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
    }

    .status.error {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);