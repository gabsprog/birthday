import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';
import { sendSiteEmail } from '@/lib/email';

export async function POST(request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  // Handle the event
  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Get metadata
      const { siteId, slug, customerEmail } = paymentIntent.metadata;
      
      if (!siteId) {
        console.error('Missing siteId in metadata');
        return NextResponse.json({ received: true });
      }
      
      // Connect to the database
      await connectToDatabase();
      
      // Find the site
      const site = await Site.findById(siteId);
      
      if (!site) {
        console.error(`Site not found: ${siteId}`);
        return NextResponse.json({ received: true });
      }
      
      // Update the site
      site.paid = true;
      site.expiresAt = null; // Remove expiration date (site is now permanent)
      await site.save();
      
      // Send email to the customer
      if (customerEmail) {
        await sendSiteEmail(customerEmail, site);
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};