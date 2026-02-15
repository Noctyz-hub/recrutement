const ADMIN_PASSWORD = '080910';
const SESSION_KEY = 'adminAuthenticated';
const SESSION_EXPIRY = 'adminSessionExpiry';

document.addEventListener('DOMContentLoaded', () => {
    if (isAuthenticated()) {
        redirectToPanel();
    }

    setupLoginForm();
    document.getElementById('password').focus();
});

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    passwordInput.addEventListener('input', () => {
        hideError();
    });
}

function handleLogin() {
    const password = document.getElementById('password').value;

    if (password === ADMIN_PASSWORD) {
        setAuthenticated();
        showSuccess();
        
        setTimeout(() => {
            redirectToPanel();
        }, 1000);
    } else {
        showError('❌ Mot de passe incorrect');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

function setAuthenticated() {
    localStorage.setItem(SESSION_KEY, 'true');
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem(SESSION_EXPIRY, expiryTime.toString());
}

function isAuthenticated() {
    const isAuth = localStorage.getItem(SESSION_KEY) === 'true';
    const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY) || '0');
    const now = new Date().getTime();

    if (isAuth && expiry > now) {
        return true;
    } else {
        clearAuthentication();
        return false;
    }
}

function clearAuthentication() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY);
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('show');
}

function showSuccess() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.background = 'rgba(16, 185, 129, 0.1)';
    errorDiv.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    errorDiv.style.color = '#10b981';
    errorDiv.textContent = '✅ Connexion réussie ! Redirection...';
    errorDiv.classList.add('show');
}

function redirectToPanel() {
    window.location.href = 'admin-panel.html';
}
