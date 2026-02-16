let currentUser = null;
let formData = {};

// 📤 WEBHOOK POUR RECEVOIR LES CANDIDATURES
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1472731945879470324/9OUMDVZRrrwHxCwV_bW4d4l50zXvKvAW9IGXjtYuJBX8ikdHI2gffqx0J3pmbJDaGX2u';

// 📢 WEBHOOK POUR ENVOYER LES RÉPONSES AUX CANDIDATS (accepté/refusé)
const DISCORD_RESPONSE_WEBHOOK_URL = 'https://discord.com/api/webhooks/1472908401871687733/pHOKTagMGudrWc0xiFGYE4lvyTD7MdFb6GYDLxyHtI-ggvy2DqFhlImdAphDexZalXI9';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    
    // Sauvegarder l'URL du webhook de réponse dans localStorage pour l'admin panel
    if (DISCORD_RESPONSE_WEBHOOK_URL && DISCORD_RESPONSE_WEBHOOK_URL !== 'VOTRE_WEBHOOK_REPONSE_URL_ICI') {
        localStorage.setItem('responseWebhookUrl', DISCORD_RESPONSE_WEBHOOK_URL);
    }
});

function checkAuth() {
    const storedUser = localStorage.getItem('discordUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showPage('page1');
        populateUserInfo();
    } else {
        showPage('loginPage');
    }
}

const discordForm = document.getElementById('discordForm');
if (discordForm) {
    discordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const pseudo = document.getElementById('discordPseudoInput').value.trim();
        
        if (!pseudo) {
            alert('Veuillez renseigner votre pseudo Discord');
            return;
        }
        
        simulateDiscordAuth(pseudo);
    });
}

document.getElementById('adminAccessBtn')?.addEventListener('click', () => {
    window.location.href = 'admin-login.html';
});

function simulateDiscordAuth(username) {
    currentUser = {
        id: 'user_' + Date.now(),
        username: username,
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

function populateUserInfo() {
    if (currentUser) {
        document.getElementById('discordPseudo').value = currentUser.username;
    }
}

function setupEventListeners() {
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

    setupCharCounter('motivation1', 150);
    setupCharCounter('motivation2', 150);
}

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

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function nextPage(pageNumber) {
    if (!validateCurrentPage(pageNumber - 1)) {
        return;
    }
    
    saveCurrentPageData();
    showPage(`page${pageNumber}`);
    
    if (pageNumber === 6) {
        displaySummary();
    }
}

function prevPage(pageNumber) {
    showPage(`page${pageNumber}`);
}

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
    }
    
    return true;
}

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
                <span>Pseudo Discord:</span>
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
    `;
    
    summary.innerHTML = html;
}

async function submitForm() {
    if (!validateCurrentPage(5)) {
        return;
    }
    
    saveCurrentPageData();
    
    const submission = {
        timestamp: new Date().toISOString(),
        user: currentUser,
        formData: formData
    };
    
    saveSubmission(submission);
    await sendToDiscordWebhook(submission);
    showPage('confirmationPage');
}

function saveSubmission(submission) {
    let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    submissions.push(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions));
}

async function sendToDiscordWebhook(submission) {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === 'VOTRE_WEBHOOK_URL_ICI') {
        console.log('⚠️ Webhook Discord non configuré');
        return;
    }
    
    const data = submission.formData;
    
    const embed = {
        title: "🚨 NOUVELLE CANDIDATURE LSPD",
        color: 3447003,
        fields: [
            {
                name: "👤 Candidat",
                value: `**${data.prenomRP} ${data.nomRP}**`,
                inline: false
            },
            {
                name: "📱 Discord",
                value: data.discordPseudo || 'Non renseigné',
                inline: true
            },
            {
                name: "🎂 Âge",
                value: `${data.age} ans`,
                inline: true
            },
            {
                name: "📍 Informations RP",
                value: `**Nationalité:** ${data.nationalite || 'N/A'}\n**Lieu de naissance:** ${data.lieuNaissance || 'N/A'}\n**Date de naissance RP:** ${data.dateNaissanceRP || 'N/A'}`,
                inline: false
            },
            {
                name: "💼 Emploi actuel",
                value: data.emploi || 'Non renseigné',
                inline: true
            },
            {
                name: "👮 Ancien agent",
                value: data.ancienAgent || 'Non renseigné',
                inline: true
            },
            {
                name: "❤️ Pourquoi le LSPD ?",
                value: data.motivation1 ? (data.motivation1.substring(0, 1000) + (data.motivation1.length > 1000 ? '...' : '')) : 'Non renseigné',
                inline: false
            },
            {
                name: "⭐ Pourquoi vous ?",
                value: data.motivation2 ? (data.motivation2.substring(0, 1000) + (data.motivation2.length > 1000 ? '...' : '')) : 'Non renseigné',
                inline: false
            }
        ],
        footer: {
            text: "Système de Recrutement LSPD"
        },
        timestamp: submission.timestamp
    };
    
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: "LSPD Recrutement",
                embeds: [embed]
            })
        });
        
        if (response.ok) {
            console.log('✅ Candidature envoyée au Discord avec succès');
        } else {
            console.error('❌ Erreur lors de l\'envoi au Discord:', response.status);
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi au Discord:', error);
    }
}
