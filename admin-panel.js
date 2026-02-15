// ========================================
// VÉRIFICATION DE L'AUTHENTIFICATION
// ========================================

const SESSION_KEY = 'adminAuthenticated';
const SESSION_EXPIRY = 'adminSessionExpiry';

function checkAuthentication() {
    const isAuth = localStorage.getItem(SESSION_KEY) === 'true';
    const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY) || '0');
    const now = new Date().getTime();

    // Si pas authentifié ou session expirée, rediriger
    if (!isAuth || expiry <= now) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY);
    window.location.href = 'admin-login.html';
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification en premier
    if (!checkAuthentication()) {
        return;
    }
    
    loadSubmissions();
    setupEventListeners();
});

// ========================================
// CONFIGURATION DES ÉVÉNEMENTS
// ========================================

function setupEventListeners() {
    // Bouton déconnexion
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Bouton actualiser
    document.getElementById('refreshBtn').addEventListener('click', loadSubmissions);
    
    // Bouton tout supprimer
    document.getElementById('clearAllBtn').addEventListener('click', clearAllSubmissions);
    
    // Recherche en temps réel
    document.getElementById('searchInput').addEventListener('input', filterSubmissions);
    
    // Fermer la modal avec le bouton X
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    
    // Fermer la modal en cliquant sur le fond
    document.getElementById('imageModal').addEventListener('click', (e) => {
        if (e.target.id === 'imageModal') {
            closeModal();
        }
    });
    
    // Empêcher la fermeture quand on clique sur le contenu de la modal
    document.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// ========================================
// CHARGEMENT DES CANDIDATURES
// ========================================

function loadSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const container = document.getElementById('submissionsContainer');
    
    // Mettre à jour les statistiques
    updateStats(submissions);
    
    // Si aucune candidature
    if (submissions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-text">Aucune candidature pour le moment</div>
            </div>
        `;
        return;
    }
    
    // Trier par date (plus récent en premier)
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Générer le HTML pour chaque candidature
    container.innerHTML = submissions.map((submission, index) => {
        return generateSubmissionCard(submission, index);
    }).join('');
    
    // Attacher les événements après la création du HTML
    attachSubmissionEvents();
}

// ========================================
// GÉNÉRATION DU HTML D'UNE CANDIDATURE
// ========================================

function generateSubmissionCard(submission, index) {
    const date = new Date(submission.timestamp);
    const formData = submission.formData;
    
    return `
        <div class="submission-card" data-index="${index}">
            <!-- Header -->
            <div class="submission-header">
                <div class="submission-user">
                    <div class="user-avatar">
                        ${(formData.prenomRP?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div class="user-info">
                        <h3>${formData.prenomRP || 'N/A'} ${formData.nomRP || 'N/A'}</h3>
                        <div class="user-discord">Discord: ${formData.discordPseudo || 'N/A'}</div>
                    </div>
                </div>
                <div class="submission-date">
                    ${formatDate(date)}<br>
                    ${formatTime(date)}
                </div>
            </div>

            <!-- Corps -->
            <div class="submission-body">
                <!-- Informations HRP -->
                <div class="info-section">
                    <h4>👤 Informations HRP</h4>
                    <div class="info-item">
                        <span class="info-label">Âge:</span>
                        <span class="info-value">${formData.age || 'N/A'} ans</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Discord ID:</span>
                        <span class="info-value">${formData.discordId || 'N/A'}</span>
                    </div>
                </div>

                <!-- Informations RP -->
                <div class="info-section">
                    <h4>🎮 Informations RP</h4>
                    <div class="info-item">
                        <span class="info-label">Date de naissance:</span>
                        <span class="info-value">${formData.dateNaissanceRP || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Lieu de naissance:</span>
                        <span class="info-value">${formData.lieuNaissance || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Nationalité:</span>
                        <span class="info-value">${formData.nationalite || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Sexe:</span>
                        <span class="info-value">${formData.sexe || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Taille/Poids:</span>
                        <span class="info-value">${formData.taille || 'N/A'} cm / ${formData.poids || 'N/A'} kg</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Statut:</span>
                        <span class="info-value">${formData.statut || 'N/A'}</span>
                    </div>
                </div>

                <!-- Profession -->
                <div class="info-section">
                    <h4>💼 Profession</h4>
                    <div class="info-item">
                        <span class="info-label">Emploi actuel:</span>
                        <span class="info-value">${formData.emploi || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Ancien agent:</span>
                        <span class="info-value">${formData.ancienAgent || 'N/A'}</span>
                    </div>
                </div>

                <!-- Motivations -->
                <div class="info-section motivation-section">
                    <h4>❤️ Motivations</h4>
                    <div class="motivation-text">
                        <strong>Pourquoi le LSPD ?</strong><br>
                        ${formData.motivation1 || 'Non renseigné'}
                    </div>
                    <div class="motivation-text">
                        <strong>Pourquoi vous ?</strong><br>
                        ${formData.motivation2 || 'Non renseigné'}
                    </div>
                    <div class="motivation-text">
                        <strong>Expérience:</strong><br>
                        ${formData.experience || 'Non renseigné'}
                    </div>
                </div>

                <!-- Documents -->
                <div class="info-section documents-section">
                    <h4>📄 Documents</h4>
                    <div class="documents-grid">
                        ${generateDocumentItem(formData.carteIdentite, '🪪', 'Carte d\'identité')}
                        ${generateDocumentItem(formData.permisConduire, '🚗', 'Permis de conduire')}
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="submission-actions">
                <button class="btn btn-export" data-index="${index}">📥 Exporter</button>
                <button class="btn btn-danger btn-delete" data-index="${index}">🗑️ Supprimer</button>
            </div>
        </div>
    `;
}

// ========================================
// GÉNÉRATION D'UN ITEM DOCUMENT
// ========================================

function generateDocumentItem(documentData, icon, label) {
    if (!documentData) return '';
    
    return `
        <div class="document-item" data-image="${encodeURIComponent(documentData)}" data-title="${label}">
            <div class="document-icon">${icon}</div>
            <div class="document-label">${label}</div>
        </div>
    `;
}

// ========================================
// ATTACHER LES ÉVÉNEMENTS AUX ÉLÉMENTS DYNAMIQUES
// ========================================

function attachSubmissionEvents() {
    // Événements pour visualiser les documents
    document.querySelectorAll('.document-item').forEach(item => {
        item.addEventListener('click', function() {
            const imageData = decodeURIComponent(this.dataset.image);
            const title = this.dataset.title;
            showImage(imageData, title);
        });
    });
    
    // Événements pour les boutons export
    document.querySelectorAll('.btn-export').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            exportSubmission(index);
        });
    });
    
    // Événements pour les boutons delete
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            deleteSubmission(index);
        });
    });
}

// ========================================
// MISE À JOUR DES STATISTIQUES
// ========================================

function updateStats(submissions) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Compter les candidatures par période
    const todayCount = submissions.filter(s => new Date(s.timestamp) >= today).length;
    const last24hCount = submissions.filter(s => new Date(s.timestamp) >= yesterday).length;
    
    // Mettre à jour l'affichage
    document.getElementById('totalSubmissions').textContent = submissions.length;
    document.getElementById('todaySubmissions').textContent = todayCount;
    document.getElementById('recentSubmissions').textContent = last24hCount;
}

// ========================================
// FILTRAGE DES CANDIDATURES
// ========================================

function filterSubmissions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.submission-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ========================================
// MODAL D'IMAGES
// ========================================

function showImage(imageData, title) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalImage').src = imageData;
    document.getElementById('imageModal').classList.add('active');
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
}

// ========================================
// SUPPRESSION D'UNE CANDIDATURE
// ========================================

function deleteSubmission(index) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
        return;
    }
    
    let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    submissions.splice(index, 1);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    
    // Recharger l'affichage
    loadSubmissions();
}

// ========================================
// SUPPRESSION DE TOUTES LES CANDIDATURES
// ========================================

function clearAllSubmissions() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES les candidatures ? Cette action est irréversible.')) {
        return;
    }
    
    localStorage.setItem('submissions', '[]');
    loadSubmissions();
}

// ========================================
// EXPORT D'UNE CANDIDATURE EN JSON
// ========================================

function exportSubmission(index) {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const submission = submissions[index];
    
    // Convertir en JSON
    const dataStr = JSON.stringify(submission, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Créer et déclencher le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidature_${submission.formData.prenomRP}_${submission.formData.nomRP}_${new Date(submission.timestamp).getTime()}.json`;
    link.click();
    
    // Nettoyer
    URL.revokeObjectURL(url);
}

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
