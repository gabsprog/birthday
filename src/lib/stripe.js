import Stripe from 'stripe';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default stripe;

/**
 * Create a payment intent
 * @param {number} amount - Amount in dollars
 * @param {object} metadata - Metadata to attach to the payment intent
 * @returns {Promise<object>} Object containing clientSecret and id
 */
export async function createPaymentIntent(amount, metadata) {
  try {
    console.log(`Creating payment intent for $${amount} with metadata:`, metadata);
    
    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    
    if (!metadata || !metadata.siteId) {
      throw new Error('Missing required metadata');
    }
    
    // Create a payment intent with automatic payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'brl',
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log('Payment intent created successfully:', paymentIntent.id);
    return { 
      clientSecret: paymentIntent.client_secret, 
      id: paymentIntent.id 
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}