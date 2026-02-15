// ========================================
// CONFIGURATION
// ========================================

const ADMIN_PASSWORD = '080910';
const SESSION_KEY = 'adminAuthenticated';
const SESSION_EXPIRY = 'adminSessionExpiry';

// ========================================
// VÉRIFICATION DE SESSION AU CHARGEMENT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si déjà connecté
    if (isAuthenticated()) {
        redirectToPanel();
    }

    // Setup du formulaire
    setupLoginForm();

    // Focus sur le champ mot de passe
    document.getElementById('password').focus();
});

// ========================================
// SETUP DU FORMULAIRE
// ========================================

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Effacer le message d'erreur quand on tape
    passwordInput.addEventListener('input', () => {
        hideError();
    });
}

// ========================================
// GESTION DE LA CONNEXION
// ========================================

function handleLogin() {
    const password = document.getElementById('password').value;

    // Vérifier le mot de passe
    if (password === ADMIN_PASSWORD) {
        // Connexion réussie
        setAuthenticated();
        showSuccess();
        
        // Redirection après 1 seconde
        setTimeout(() => {
            redirectToPanel();
        }, 1000);
    } else {
        // Mot de passe incorrect
        showError('❌ Mot de passe incorrect');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

// ========================================
// GESTION DE L'AUTHENTIFICATION
// ========================================

function setAuthenticated() {
    // Sauvegarder l'authentification
    localStorage.setItem(SESSION_KEY, 'true');
    
    // Définir une expiration de 24 heures
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem(SESSION_EXPIRY, expiryTime.toString());
}

function isAuthenticated() {
    const isAuth = localStorage.getItem(SESSION_KEY) === 'true';
    const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY) || '0');
    const now = new Date().getTime();

    // Vérifier si la session est toujours valide
    if (isAuth && expiry > now) {
        return true;
    } else {
        // Session expirée, nettoyer
        clearAuthentication();
        return false;
    }
}

function clearAuthentication() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY);
}

// ========================================
// AFFICHAGE DES MESSAGES
// ========================================

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

// ========================================
// REDIRECTION
// ========================================

function redirectToPanel() {
    window.location.href = 'admin-panel.html';
}
