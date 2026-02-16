const SESSION_KEY = 'adminAuthenticated';
const SESSION_EXPIRY = 'adminSessionExpiry';

function checkAuthentication() {
    const isAuth = localStorage.getItem(SESSION_KEY) === 'true';
    const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY) || '0');
    const now = new Date().getTime();

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

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuthentication()) {
        return;
    }
    
    loadSubmissions();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('refreshBtn').addEventListener('click', loadSubmissions);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllSubmissions);
    document.getElementById('searchInput').addEventListener('input', filterSubmissions);
}

function loadSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const container = document.getElementById('submissionsContainer');
    
    updateStats(submissions);
    
    if (submissions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-text">Aucune candidature pour le moment</div>
            </div>
        `;
        return;
    }
    
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = submissions.map((submission, index) => {
        return generateSubmissionCard(submission, index);
    }).join('');
    
    attachSubmissionEvents();
}

function generateSubmissionCard(submission, index) {
    const date = new Date(submission.timestamp);
    const formData = submission.formData;
    
    return `
        <div class="submission-card" data-index="${index}">
            <div class="submission-header">
                <div class="submission-user">
                    <div class="user-avatar">
                        ${(formData.prenomRP?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <div class="user-info">
                        <h3>${formData.prenomRP || 'N/A'} ${formData.nomRP || 'N/A'}</h3>
                        <div class="user-discord">Discord: ${formData.discordPseudo || submission.user?.username || 'N/A'}</div>
                    </div>
                </div>
                <div class="submission-date">
                    ${formatDate(date)}<br>
                    ${formatTime(date)}
                </div>
            </div>

            <div class="submission-body">
                <div class="info-section">
                    <h4>👤 Informations HRP</h4>
                    <div class="info-item">
                        <span class="info-label">Date de naissance:</span>
                        <span class="info-value">${formData.dateNaissance || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Âge:</span>
                        <span class="info-value">${formData.age || 'N/A'} ans</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Pseudo Discord:</span>
                        <span class="info-value">${formData.discordPseudo || submission.user?.username || 'N/A'}</span>
                    </div>
                </div>

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
            </div>

            <div class="submission-actions">
                <button class="btn btn-success btn-accept" data-index="${index}">✅ Accepter</button>
                <button class="btn btn-danger btn-reject" data-index="${index}">❌ Refuser</button>
                <button class="btn btn-export" data-index="${index}">📥 Exporter</button>
                <button class="btn btn-danger btn-delete" data-index="${index}">🗑️ Supprimer</button>
            </div>
        </div>
    `;
}

function attachSubmissionEvents() {
    // Bouton Accepter
    document.querySelectorAll('.btn-accept').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            acceptSubmission(index);
        });
    });
    
    // Bouton Refuser
    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            rejectSubmission(index);
        });
    });
    
    // Bouton Export
    document.querySelectorAll('.btn-export').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            exportSubmission(index);
        });
    });
    
    // Bouton Delete
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            deleteSubmission(index);
        });
    });
}

function updateStats(submissions) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const todayCount = submissions.filter(s => new Date(s.timestamp) >= today).length;
    const last24hCount = submissions.filter(s => new Date(s.timestamp) >= yesterday).length;
    
    document.getElementById('totalSubmissions').textContent = submissions.length;
    document.getElementById('todaySubmissions').textContent = todayCount;
    document.getElementById('recentSubmissions').textContent = last24hCount;
}

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

function deleteSubmission(index) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
        return;
    }
    
    let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    submissions.splice(index, 1);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    
    loadSubmissions();
}

function clearAllSubmissions() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES les candidatures ? Cette action est irréversible.')) {
        return;
    }
    
    localStorage.setItem('submissions', '[]');
    loadSubmissions();
}

function exportSubmission(index) {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const submission = submissions[index];
    
    const dataStr = JSON.stringify(submission, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidature_${submission.formData.prenomRP}_${submission.formData.nomRP}_${new Date(submission.timestamp).getTime()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

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

// ========================================
// ACCEPTER UNE CANDIDATURE
// ========================================

async function acceptSubmission(index) {
    const reason = prompt('✅ Raison de l\'acceptation (optionnel) :\n\nExemple: "Profil excellent, motivations solides"');
    
    // Si l'utilisateur annule, on ne fait rien
    if (reason === null) {
        return;
    }
    
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const submission = submissions[index];
    
    // Envoyer la notification Discord
    await sendDiscordNotification(submission, 'accepted', reason || 'Aucune raison spécifiée');
    
    // Marquer comme traitée (optionnel - on peut supprimer après traitement)
    if (confirm('Supprimer cette candidature du panel après notification ?')) {
        deleteSubmission(index);
    }
}

// ========================================
// REFUSER UNE CANDIDATURE
// ========================================

async function rejectSubmission(index) {
    const reason = prompt('❌ Raison du refus (obligatoire) :\n\nExemple: "Motivation peu convaincante, veuillez prendre le temps de développer un minimum vos réponses"');
    
    // La raison est obligatoire pour un refus
    if (!reason || reason.trim() === '') {
        alert('⚠️ Veuillez indiquer une raison pour le refus');
        return;
    }
    
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const submission = submissions[index];
    
    // Envoyer la notification Discord
    await sendDiscordNotification(submission, 'rejected', reason);
    
    // Marquer comme traitée (optionnel - on peut supprimer après traitement)
    if (confirm('Supprimer cette candidature du panel après notification ?')) {
        deleteSubmission(index);
    }
}

// ========================================
// ENVOYER LA NOTIFICATION DISCORD
// ========================================

async function sendDiscordNotification(submission, status, reason) {
    // Récupérer l'URL du webhook depuis le localStorage
    // Vous devrez la configurer dans le script.js
    const WEBHOOK_URL = localStorage.getItem('responseWebhookUrl') || 'VOTRE_WEBHOOK_REPONSE_URL_ICI';
    
    if (!WEBHOOK_URL || WEBHOOK_URL === 'VOTRE_WEBHOOK_REPONSE_URL_ICI') {
        alert('⚠️ Le webhook de réponse n\'est pas configuré.\n\nVeuillez configurer DISCORD_RESPONSE_WEBHOOK_URL dans script.js');
        return;
    }
    
    const data = submission.formData;
    const isAccepted = status === 'accepted';
    
    // Créer l'embed Discord
    const embed = {
        title: isAccepted ? "✅ CANDIDATURE ACCEPTÉE" : "❌ CANDIDATURE REFUSÉE",
        color: isAccepted ? 3066993 : 15158332, // Vert ou Rouge
        description: isAccepted 
            ? `Félicitations **${data.prenomRP} ${data.nomRP}** ! Votre candidature au LSPD a été acceptée.`
            : `**${data.prenomRP} ${data.nomRP}**, votre candidature au LSPD a été refusée.`,
        fields: [
            {
                name: "👤 Candidat",
                value: `${data.prenomRP} ${data.nomRP}`,
                inline: true
            },
            {
                name: "📱 Discord",
                value: data.discordPseudo || 'Non renseigné',
                inline: true
            },
            {
                name: isAccepted ? "✅ Message" : "❌ Raison",
                value: reason,
                inline: false
            }
        ],
        footer: {
            text: "Los Santos Police Department"
        },
        timestamp: new Date().toISOString()
    };
    
    // Si accepté, ajouter les prochaines étapes
    if (isAccepted) {
        embed.fields.push({
            name: "📋 Prochaines étapes",
            value: "• Rendez-vous dans 🏛️ Aucun accès\n• Un recruteur vous contactera pour la suite\n• Préparez-vous pour l'entretien final",
            inline: false
        });
    } else {
        embed.fields.push({
            name: "🔄 Nouvelle candidature",
            value: "Vous pouvez soumettre une nouvelle candidature après avoir pris en compte nos remarques.",
            inline: false
        });
    }
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: `<@${submission.user?.id}> ${data.discordPseudo}`,
                username: "Recrutement LSPD",
                embeds: [embed]
            })
        });
        
        if (response.ok) {
            alert(isAccepted 
                ? `✅ Notification d'acceptation envoyée à ${data.discordPseudo} !`
                : `❌ Notification de refus envoyée à ${data.discordPseudo} !`
            );
        } else {
            alert('❌ Erreur lors de l\'envoi de la notification Discord');
            console.error('Erreur webhook:', response.status);
        }
    } catch (error) {
        alert('❌ Erreur lors de l\'envoi de la notification Discord');
        console.error('Erreur:', error);
    }
}
