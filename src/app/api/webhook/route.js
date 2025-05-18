// src/app/api/webhook/route.js - Updated email import
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';
import { sendSiteEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    console.log(`Webhook received: ${new Date().toISOString()}`);

    if (!signature) {
      console.error('Stripe signature missing');
      return NextResponse.json(
        { error: 'Signature missing' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error(`Signature verification failed: ${error.message}`);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Received Stripe event: ${event.type} - ${event.id}`);

    // Handle successful payment events
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(event.data.object);
    } else if (event.type === 'payment_intent.succeeded') {
      await handlePaymentIntentSucceeded(event.data.object);
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

// Function to process checkout.session.completed
async function handleCheckoutSessionCompleted(session) {
  const { siteId, slug } = session.metadata;

  if (!siteId && !slug) {
    console.error('siteId and slug missing in session metadata');
    return;
  }

  console.log(`Processing payment completed for: ${siteId || slug}`);

  // Connect to the database
  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error(`Database connection error: ${dbError.message}`);
    throw dbError;
  }

  // Find the site by ID or slug
  let site;
  if (siteId) {
    site = await Site.findById(siteId);
  } else if (slug) {
    site = await Site.findOne({ slug });
  }

  if (!site) {
    console.error(`Site not found: ${siteId || slug}`);
    return;
  }

  // Check if the site is already marked as paid
  if (site.paid) {
    console.log(`Site ${site._id} (${site.slug}) is already marked as paid`);
    return;
  }

  // Update the site
  site.paid = true;
  site.expiresAt = null; // Remove expiration date
  site.checkoutSessionId = session.id; // Store session ID

  try {
    await site.save();
    console.log(`Site ${site._id} (${site.slug}) successfully marked as paid!`);
  } catch (saveError) {
    console.error(`Error saving site: ${saveError.message}`);
    throw saveError;
  }

  // Send email to the customer
  const customerEmail = session.customer_email || site.customerEmail;
  if (customerEmail) {
    try {
      const emailResult = await sendSiteEmail(customerEmail, site);
      if (emailResult.success) {
        console.log(`Email sent to ${customerEmail} successfully`);
      } else {
        console.error('Error sending email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }
  }
}

// Function to process payment_intent.succeeded
async function handlePaymentIntentSucceeded(paymentIntent) {
  const { siteId, slug } = paymentIntent.metadata;

  if (!siteId && !slug) {
    console.error('siteId and slug missing in paymentIntent metadata');
    return;
  }

  console.log(`Processing payment_intent.succeeded for: ${siteId || slug}`);

  // Connect to the database
  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error(`Database connection error: ${dbError.message}`);
    throw dbError;
  }

  // Find the site by ID or slug
  let site;
  if (siteId) {
    site = await Site.findById(siteId);
  } else if (slug) {
    site = await Site.findOne({ slug });
  }

  if (!site) {
    console.error(`Site not found: ${siteId || slug}`);
    return;
  }

  // Check if the site is already marked as paid
  if (site.paid) {
    console.log(`Site ${site._id} (${site.slug}) is already marked as paid`);
    return;
  }

  // Update the site
  site.paid = true;
  site.expiresAt = null; // Remove expiration date
  site.paymentIntentId = paymentIntent.id; // Store payment intent ID

  try {
    await site.save();
    console.log(`Site ${site._id} (${site.slug}) successfully marked as paid!`);
  } catch (saveError) {
    console.error(`Error saving site: ${saveError.message}`);
    throw saveError;
  }

  // Send email to the customer
  const customerEmail = site.customerEmail;
  if (customerEmail) {
    try {
      const emailResult = await sendSiteEmail(customerEmail, site);
      if (emailResult.success) {
        console.log(`Email sent to ${customerEmail} successfully`);
      } else {
        console.error('Error sending email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }
  }
}