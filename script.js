// État de l'application
let currentUser = null;
let formData = {};

// Configuration Discord OAuth (à remplacer par vos vraies valeurs)
const DISCORD_CLIENT_ID = 'YOUR_DISCORD_CLIENT_ID';
const DISCORD_REDIRECT_URI = window.location.origin;
const WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL'; // Pour recevoir les candidatures

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Vérifier l'authentification
function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // Échanger le code contre un token (simulation)
        // Dans un vrai projet, cela se ferait côté serveur
        simulateDiscordAuth(code);
    } else {
        const storedUser = localStorage.getItem('discordUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            showPage('page1');
            populateUserInfo();
        } else {
            showPage('loginPage');
        }
    }
}

// Connexion Discord (simulation)
document.getElementById('discordLoginBtn')?.addEventListener('click', () => {
    // Dans un vrai projet, rediriger vers Discord OAuth
    // window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${DISCORD_REDIRECT_URI}&response_type=code&scope=identify`;
    
    // Pour la démo, on simule une connexion
    simulateDiscordAuth();
});

// Bouton accès admin
document.getElementById('adminAccessBtn')?.addEventListener('click', () => {
    window.location.href = 'admin-login.html';
});

function simulateDiscordAuth(code = null) {
    // Simulation d'une connexion Discord
    currentUser = {
        id: '1101858289693769758',
        username: 'nocty2605',
        discriminator: '0',
        avatar: null
    };
    
    localStorage.setItem('discordUser', JSON.stringify(currentUser));
    showPage('page1');
    populateUserInfo();
}

function logout() {
    localStorage.removeItem('discordUser');
    currentUser = null;
    formData = {};
    showPage('loginPage');
}

// Remplir les infos utilisateur
function populateUserInfo() {
    if (currentUser) {
        document.getElementById('discordId').value = currentUser.id;
        document.getElementById('discordPseudo').value = currentUser.username;
    }
}

// Setup des écouteurs d'événements
function setupEventListeners() {
    // Calcul automatique de l'âge
    const dateNaissance = document.getElementById('dateNaissance');
    if (dateNaissance) {
        dateNaissance.addEventListener('change', (e) => {
            const birthDate = new Date(e.target.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            document.getElementById('age').value = age;
        });
    }

    // Compteurs de caractères pour les motivations
    setupCharCounter('motivation1', 150);
    setupCharCounter('motivation2', 150);
    
    // Upload de fichiers
    setupFileUpload('carteIdentite', 'carteIdentitePreview');
    setupFileUpload('permisConduire', 'permisConduirePreview');
}

// Compteur de caractères
function setupCharCounter(textareaId, minLength) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;

    const counter = textarea.nextElementSibling;
    
    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        counter.textContent = `${length}/${minLength} caractères minimum`;
        
        if (length >= minLength) {
            counter.classList.remove('error');
            counter.style.color = '#10b981';
        } else {
            counter.classList.add('error');
        }
    });
}

// Gestion des fichiers
function setupFileUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const uploadBox = input?.closest('.upload-box');
    
    if (!input || !preview || !uploadBox) return;

    // Upload par sélection de fichier
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file, inputId, preview);
        }
    });

    // Drag & Drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#3b82f6';
        uploadBox.style.background = 'rgba(59, 130, 246, 0.1)';
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        uploadBox.style.background = 'rgba(15, 23, 42, 0.6)';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        uploadBox.style.background = 'rgba(15, 23, 42, 0.6)';
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file, inputId, preview);
        }
    });

    // Paste (Ctrl+V)
    uploadBox.addEventListener('click', () => {
        uploadBox.setAttribute('tabindex', '0');
        uploadBox.focus();
    });

    uploadBox.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                handleFile(file, inputId, preview);
            }
        }
    });
}

function handleFile(file, inputId, preview) {
    // Vérifier le type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Format de fichier invalide. Utilisez JPG, PNG ou WebP.');
        return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 5MB.');
        return;
    }

    // Lire le fichier
    const reader = new FileReader();
    reader.onload = (e) => {
        formData[inputId] = e.target.result;
        preview.innerHTML = `✓ ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        preview.style.color = '#10b981';
    };
    reader.readAsDataURL(file);
}

// Navigation entre les pages
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function nextPage(pageNumber) {
    // Valider la page actuelle
    if (!validateCurrentPage(pageNumber - 1)) {
        return;
    }
    
    // Sauvegarder les données
    saveCurrentPageData();
    
    // Afficher la page suivante
    showPage(`page${pageNumber}`);
    
    // Si c'est la page de vérification, afficher le résumé
    if (pageNumber === 7) {
        displaySummary();
    }
}

function prevPage(pageNumber) {
    showPage(`page${pageNumber}`);
}

// Validation des pages
function validateCurrentPage(pageNumber) {
    switch(pageNumber) {
        case 2:
            const dateNaissance = document.getElementById('dateNaissance').value;
            if (!dateNaissance) {
                alert('Veuillez renseigner votre date de naissance');
                return false;
            }
            break;
            
        case 3:
            const requiredFields = ['nomRP', 'prenomRP', 'dateNaissanceRP', 'lieuNaissance', 'nationalite', 'sexe', 'taille', 'poids', 'statut'];
            for (let field of requiredFields) {
                if (!document.getElementById(field).value) {
                    alert('Veuillez remplir tous les champs obligatoires');
                    return false;
                }
            }
            break;
            
        case 4:
            const emploi = document.querySelector('input[name="emploi"]:checked');
            if (!emploi) {
                alert('Veuillez indiquer si vous avez un emploi actuellement');
                return false;
            }
            break;
            
        case 5:
            const motivation1 = document.getElementById('motivation1').value;
            const motivation2 = document.getElementById('motivation2').value;
            const ancienAgent = document.querySelector('input[name="ancienAgent"]:checked');
            const experience = document.getElementById('experience').value;
            
            if (motivation1.length < 150) {
                alert('La première motivation doit contenir au moins 150 caractères');
                return false;
            }
            
            if (motivation2.length < 150) {
                alert('La deuxième motivation doit contenir au moins 150 caractères');
                return false;
            }
            
            if (!ancienAgent) {
                alert('Veuillez indiquer si vous avez déjà été agent de police');
                return false;
            }
            
            if (!experience.trim()) {
                alert('Veuillez décrire votre expérience');
                return false;
            }
            break;
            
        case 6:
            if (!formData['carteIdentite']) {
                alert('Veuillez uploader votre carte d\'identité');
                return false;
            }
            
            if (!formData['permisConduire']) {
                alert('Veuillez uploader votre permis de conduire');
                return false;
            }
            break;
    }
    
    return true;
}

// Sauvegarder les données de la page
function saveCurrentPageData() {
    const inputs = document.querySelectorAll('.page.active input, .page.active select, .page.active textarea');
    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else {
            formData[input.id] = input.value;
        }
    });
}

// Afficher le résumé
function displaySummary() {
    const summary = document.getElementById('verificationSummary');
    
    const html = `
        <div class="summary-section">
            <h3>📋 Informations HRP</h3>
            <div class="summary-item">
                <span>Date de naissance:</span>
                <strong>${formData.dateNaissance || 'Non renseignée'}</strong>
            </div>
            <div class="summary-item">
                <span>Âge:</span>
                <strong>${formData.age || 'Non renseigné'} ans</strong>
            </div>
            <div class="summary-item">
                <span>Discord:</span>
                <strong>${formData.discordPseudo || 'Non renseigné'}</strong>
            </div>
        </div>

        <div class="summary-section">
            <h3>🎮 Informations RP</h3>
            <div class="summary-item">
                <span>Nom complet:</span>
                <strong>${formData.prenomRP || ''} ${formData.nomRP || ''}</strong>
            </div>
            <div class="summary-item">
                <span>Date de naissance:</span>
                <strong>${formData.dateNaissanceRP || 'Non renseignée'}</strong>
            </div>
            <div class="summary-item">
                <span>Lieu de naissance:</span>
                <strong>${formData.lieuNaissance || 'Non renseigné'}</strong>
            </div>
            <div class="summary-item">
                <span>Nationalité:</span>
                <strong>${formData.nationalite || 'Non renseignée'}</strong>
            </div>
            <div class="summary-item">
                <span>Sexe:</span>
                <strong>${formData.sexe || 'Non renseigné'}</strong>
            </div>
            <div class="summary-item">
                <span>Taille/Poids:</span>
                <strong>${formData.taille || 'N/A'} cm / ${formData.poids || 'N/A'} kg</strong>
            </div>
            <div class="summary-item">
                <span>Statut:</span>
                <strong>${formData.statut || 'Non renseigné'}</strong>
            </div>
        </div>

        <div class="summary-section">
            <h3>💼 Profession</h3>
            <div class="summary-item">
                <span>Emploi actuel:</span>
                <strong>${formData.emploi || 'Non renseigné'}</strong>
            </div>
        </div>

        <div class="summary-section">
            <h3>❤️ Motivations</h3>
            <div class="summary-item">
                <span>Ancien agent:</span>
                <strong>${formData.ancienAgent || 'Non renseigné'}</strong>
            </div>
        </div>

        <div class="summary-section">
            <h3>📄 Documents</h3>
            <div class="summary-item">
                <span>Carte d'identité:</span>
                <strong>${formData.carteIdentite ? '✓ Uploadée' : '✗ Manquante'}</strong>
            </div>
            <div class="summary-item">
                <span>Permis de conduire:</span>
                <strong>${formData.permisConduire ? '✓ Uploadé' : '✗ Manquant'}</strong>
            </div>
        </div>
    `;
    
    summary.innerHTML = html;
}

// Soumettre le formulaire
async function submitForm() {
    // Valider une dernière fois
    if (!validateCurrentPage(6)) {
        return;
    }
    
    // Sauvegarder les données finales
    saveCurrentPageData();
    
    // Préparer les données pour l'envoi
    const submission = {
        timestamp: new Date().toISOString(),
        user: currentUser,
        formData: formData
    };
    
    // Sauvegarder localement (pour le panel admin)
    saveSubmission(submission);
    
    // Envoyer au webhook Discord (optionnel)
    await sendToDiscord(submission);
    
    // Afficher la confirmation
    showPage('confirmationPage');
}

// Sauvegarder la candidature localement
function saveSubmission(submission) {
    let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    submissions.push(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions));
}

// Envoyer au webhook Discord
async function sendToDiscord(submission) {
    // Si vous avez configuré un webhook Discord, décommentez ce code
    /*
    const embed = {
        title: "🚨 Nouvelle Candidature LSPD",
        color: 3447003,
        fields: [
            {
                name: "👤 Candidat",
                value: `${submission.formData.prenomRP} ${submission.formData.nomRP}`,
                inline: true
            },
            {
                name: "📱 Discord",
                value: submission.formData.discordPseudo,
                inline: true
            },
            {
                name: "🎂 Âge",
                value: `${submission.formData.age} ans`,
                inline: true
            },
            {
                name: "💼 Emploi actuel",
                value: submission.formData.emploi,
                inline: true
            },
            {
                name: "📅 Date de soumission",
                value: new Date(submission.timestamp).toLocaleString('fr-FR'),
                inline: false
            }
        ],
        timestamp: submission.timestamp
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi au webhook:', error);
    }
    */
}
