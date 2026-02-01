import Stripe from 'stripe';
import { getSystemSetting } from '../utils/settings.utils';
import { AppError } from '../middleware/errorHandler.middleware';

export class StripeService {
    private client: Stripe | null = null;
    private apiKey: string | null = null;

    private async getClient(): Promise<Stripe> {
        const key = await getSystemSetting('stripe_key', process.env.STRIPE_SECRET_KEY);

        if (!key) {
            throw new AppError('Stripe API key is not configured', 500);
        }

        if (this.client && this.apiKey === key) {
            return this.client;
        }

        this.apiKey = key;
        this.client = new Stripe(key, {
            apiVersion: '2026-01-28.clover',
        });

        return this.client;
    }

    async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: Record<string, string>) {
        const stripe = await this.getClient();

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe uses cents
                currency: currency.toLowerCase(),
                metadata: metadata || {},
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return paymentIntent;
        } catch (error: any) {
            console.error('Stripe Error:', error);
            throw new AppError(`Payment processing failed: ${error.message}`, 500);
        }
    }
}

export const stripeService = new StripeService();
