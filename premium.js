class PremiumManager {
    constructor() {
        this.user = this.loadUserData();
        this.premiumFeatures = {
            '6-letter': { price: 2.99, name: '6-Letter Wordle' },
            '7-letter': { price: 4.99, name: '7-Letter Wordle' },
            '8-letter': { price: 6.99, name: '8-Letter Wordle' },
            '12-letter': { price: 12.99, name: '12-Letter Wordle' },
            'unlimited-hints': { price: 1.99, name: 'Unlimited Hints' },
            'custom-themes': { price: 3.99, name: 'Custom Themes' }
        };
        this.initializePaymentSystem();
    }

    loadUserData() {
        const userData = localStorage.getItem('wordleUserData');
        if (userData) {
            return JSON.parse(userData);
        }
        return {
            userId: this.generateUserId(),
            purchasedFeatures: [],
            freeTrialsUsed: [],
            createdAt: new Date().toISOString()
        };
    }

    saveUserData() {
        localStorage.setItem('wordleUserData', JSON.stringify(this.user));
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    hasAccess(featureId) {
        return this.user.purchasedFeatures.includes(featureId);
    }

    canUseTrial(featureId) {
        return !this.user.freeTrialsUsed.includes(featureId);
    }

    useTrial(featureId) {
        if (this.canUseTrial(featureId)) {
            this.user.freeTrialsUsed.push(featureId);
            this.saveUserData();
            return true;
        }
        return false;
    }

    async purchaseFeature(featureId) {
        const feature = this.premiumFeatures[featureId];
        if (!feature) {
            throw new Error('Feature not found');
        }

        try {
            // Simulate payment processing (replace with real payment gateway)
            const paymentResult = await this.processPayment(featureId, feature.price);
            
            if (paymentResult.success) {
                this.user.purchasedFeatures.push(featureId);
                this.saveUserData();
                return { success: true, message: `${feature.name} purchased successfully!` };
            } else {
                return { success: false, message: 'Payment failed. Please try again.' };
            }
        } catch (error) {
            return { success: false, message: 'Payment processing error: ' + error.message };
        }
    }

    async processPayment(featureId, amount) {
        // This is a mock payment processor
        // In production, integrate with Stripe, PayPal, or other payment providers
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate payment success/failure (90% success rate for demo)
                const success = Math.random() > 0.1;
                resolve({
                    success: success,
                    transactionId: success ? 'txn_' + Math.random().toString(36).substr(2, 9) : null,
                    featureId: featureId,
                    amount: amount
                });
            }, 2000); // Simulate network delay
        });
    }

    initializePaymentSystem() {
        // Initialize Stripe or other payment provider
        // This is where you'd load the Stripe SDK in production
        console.log('Payment system initialized');
    }

    getPurchasedFeatures() {
        return this.user.purchasedFeatures;
    }

    getAvailableFeatures() {
        return Object.keys(this.premiumFeatures).map(id => ({
            id,
            ...this.premiumFeatures[id],
            purchased: this.hasAccess(id),
            canTrial: this.canUseTrial(id)
        }));
    }
}
