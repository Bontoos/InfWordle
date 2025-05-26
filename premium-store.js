class PremiumStore {
    constructor() {
        this.premiumManager = new PremiumManager();
        this.currentFeature = null;
        this.initializeStore();
        this.setupEventListeners();
    }

    initializeStore() {
        this.renderPremiumFeatures();
        this.renderUserFeatures();
    }

    renderPremiumFeatures() {
        const premiumGrid = document.getElementById('premiumGrid');
        const features = this.premiumManager.getAvailableFeatures();

        premiumGrid.innerHTML = '';

        features.forEach(feature => {
            const featureCard = document.createElement('div');
            featureCard.className = `feature-card ${feature.purchased ? 'purchased' : ''}`;
            
            featureCard.innerHTML = `
                <div class="feature-header">
                    <h3>${feature.name}</h3>
                    <div class="feature-price">$${feature.price}</div>
                </div>
                <div class="feature-description">
                    ${this.getFeatureDescription(feature.id)}
                </div>
                <div class="feature-actions">
                    ${this.renderFeatureActions(feature)}
                </div>
            `;

            premiumGrid.appendChild(featureCard);
        });
    }

    getFeatureDescription(featureId) {
        const descriptions = {
            '6-letter': 'Challenge yourself with 6-letter words for more complex gameplay.',
            '7-letter': 'Take on 7-letter words for an even greater challenge.',
            '8-letter': 'Master 8-letter words for expert-level difficulty.',
            '12-letter': 'Ultimate challenge with 12-letter words for word masters.',
            'unlimited-hints': 'Get unlimited hints to help you solve puzzles.',
            'custom-themes': 'Personalize your game with beautiful custom themes.'
        };
        return descriptions[featureId] || 'Premium feature';
    }

    renderFeatureActions(feature) {
        if (feature.purchased) {
            return '<button class="purchased-btn" disabled>✓ Purchased</button>';
        }

        let actions = `<button class="purchase-btn" onclick="premiumStore.showPurchaseModal('${feature.id}')">Purchase</button>`;
        
        if (feature.canTrial) {
            actions += `<button class="trial-btn" onclick="premiumStore.showTrialModal('${feature.id}')">Free Trial</button>`;
        }

        return actions;
    }

    renderUserFeatures() {
        const userFeatures = document.getElementById('userFeatures');
        const purchasedFeatures = this.premiumManager.getPurchasedFeatures();

        if (purchasedFeatures.length === 0) {
            userFeatures.innerHTML = '<p class="no-features">No premium features purchased yet.</p>';
            return;
        }

        userFeatures.innerHTML = '';
        purchasedFeatures.forEach(featureId => {
            const feature = this.premiumManager.premiumFeatures[featureId];
            if (feature) {
                const featureElement = document.createElement('div');
                featureElement.className = 'user-feature';
                featureElement.innerHTML = `
                    <span class="feature-name">${feature.name}</span>
                    <span class="feature-status">Active</span>
                `;
                userFeatures.appendChild(featureElement);
            }
        });
    }

    showPurchaseModal(featureId) {
        this.currentFeature = featureId;
        const feature = this.premiumManager.premiumFeatures[featureId];
        const modal = document.getElementById('paymentModal');
        const paymentDetails = document.getElementById('paymentDetails');

        paymentDetails.innerHTML = `
            <div class="purchase-summary">
                <h3>${feature.name}</h3>
                <p>${this.getFeatureDescription(featureId)}</p>
                <div class="price-display">$${feature.price}</div>
            </div>
        `;

        modal.style.display = 'block';
    }

    showTrialModal(featureId) {
        this.currentFeature = featureId;
        const feature = this.premiumManager.premiumFeatures[featureId];
        const modal = document.getElementById('trialModal');
        const trialDetails = document.getElementById('trialDetails');

        trialDetails.innerHTML = `
            <div class="trial-summary">
                <h3>${feature.name}</h3>
                <p>${this.getFeatureDescription(featureId)}</p>
                <p class="trial-info">Try this feature for free for 24 hours!</p>
            </div>
        `;

        modal.style.display = 'block';
    }

    async processPurchase() {
        if (!this.currentFeature) return;

        const confirmBtn = document.getElementById('confirmPurchase');
        const statusDiv = document.getElementById('paymentStatus');
        
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Processing...';
        statusDiv.innerHTML = '<div class="loading">Processing payment...</div>';

        try {
            const result = await this.premiumManager.purchaseFeature(this.currentFeature);
            
            if (result.success) {
                statusDiv.innerHTML = `<div class="success">${result.message}</div>`;
                setTimeout(() => {
                    this.closeModal('paymentModal');
                    this.initializeStore(); // Refresh the store
                }, 2000);
            } else {
                statusDiv.innerHTML = `<div class="error">${result.message}</div>`;
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirm Purchase';
            }
        } catch (error) {
            statusDiv.innerHTML = `<div class="error">An error occurred: ${error.message}</div>`;
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Purchase';
        }
    }

    startTrial() {
        if (!this.currentFeature) return;

        const success = this.premiumManager.useTrial(this.currentFeature);
        if (success) {
            alert('Free trial started! You can now use this feature for 24 hours.');
            this.closeModal('trialModal');
            this.initializeStore();
            // Redirect to game with the trial feature
            window.location.href = `index.html?mode=${this.currentFeature}&trial=true`;
        } else {
            alert('Trial already used for this feature.');
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        this.currentFeature = null;
        
        // Reset payment status
        const statusDiv = document.getElementById('paymentStatus');
        if (statusDiv) statusDiv.innerHTML = '';
        
        const confirmBtn = document.getElementById('confirmPurchase');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Purchase';
        }
    }

    setupEventListeners() {
        // Purchase modal events
        document.getElementById('confirmPurchase').addEventListener('click', () => {
            this.processPurchase();
        });

        document.getElementById('cancelPurchase').addEventListener('click', () => {
            this.closeModal('paymentModal');
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal('paymentModal');
        });

        // Trial modal events
        document.getElementById('startTrial').addEventListener('click', () => {
            this.startTrial();
        });

        document.getElementById('cancelTrial').addEventListener('click', () => {
            this.closeModal('trialModal');
        });

        document.getElementById('closeTrialModal').addEventListener('click', () => {
            this.closeModal('trialModal');
        });

        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            const paymentModal = document.getElementById('paymentModal');
            const trialModal = document.getElementById('trialModal');
            
            if (event.target === paymentModal) {
                this.closeModal('paymentModal');
            }
            if (event.target === trialModal) {
                this.closeModal('trialModal');
            }
        });
    }
}

// Initialize the premium store
let premiumStore;
document.addEventListener('DOMContentLoaded', () => {
    premiumStore = new PremiumStore();
});
